import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import parse_qs, urlparse

import requests

logger = logging.getLogger(__name__)

GOOGLE_DRIVE_DOWNLOAD_URL = "https://drive.google.com/uc?export=download"


def ensure_model_available(model_filename: str, models_dir: Path) -> Path:
    models_dir.mkdir(parents=True, exist_ok=True)
    model_path = models_dir / model_filename
    if model_path.exists():
        return model_path

    # Prefer manifest-based lookup if present.
    manifest_path = _manifest_path(models_dir)
    if manifest_path.exists():
        entry = _find_manifest_entry(manifest_path, model_filename)
        if entry:
            _download_manifest_entry(entry, model_path)
            if model_path.exists():
                return model_path

    # Fallback to env-driven source selection (legacy path).
    source = os.getenv("MODEL_SOURCE", "").strip().lower()
    if source == "gdrive":
        _download_from_gdrive(model_filename, model_path)
    else:
        raise FileNotFoundError(
            "Model file not found locally and no manifest entry exists. "
            "Set MODELS_MANIFEST or MODEL_SOURCE=gdrive."
        )

    if not model_path.exists():
        raise FileNotFoundError(f"Model download completed but file is still missing: {model_path}")

    return model_path


def download_models_from_manifest(manifest_path: Path, models_dir: Path) -> List[Path]:
    models_dir.mkdir(parents=True, exist_ok=True)
    entries = _load_manifest(manifest_path)
    if not entries:
        raise ValueError(f"Manifest is empty: {manifest_path}")

    downloaded: List[Path] = []
    for entry in entries:
        filename = entry.get("filename")
        if not filename:
            raise ValueError("Manifest entry missing 'filename'.")
        destination = models_dir / filename
        if destination.exists():
            continue
        _download_manifest_entry(entry, destination)
        if not destination.exists():
            raise FileNotFoundError(f"Model download completed but file is still missing: {destination}")
        downloaded.append(destination)

    return downloaded


def _download_manifest_entry(entry: Dict[str, str], destination: Path) -> None:
    if destination.exists():
        logger.info("Model already exists, skipping download: %s", destination)
        return
    url = entry.get("url")
    if not url:
        raise ValueError("Manifest entry missing 'url'.")
    _download_from_url(url, destination)


def _load_manifest(manifest_path: Path) -> List[Dict[str, str]]:
    try:
        raw = manifest_path.read_text()
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"Manifest not found: {manifest_path}") from exc

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Manifest is not valid JSON: {manifest_path}") from exc

    if isinstance(data, dict):
        data = data.get("models", [])
    if not isinstance(data, list):
        raise ValueError("Manifest must be a list or an object with a 'models' list.")
    return data


def _find_manifest_entry(manifest_path: Path, model_filename: str) -> Optional[Dict[str, str]]:
    for entry in _load_manifest(manifest_path):
        if entry.get("filename") == model_filename:
            return entry
    return None


def _manifest_path(models_dir: Path) -> Path:
    raw = os.getenv("MODELS_MANIFEST", "").strip()
    if raw:
        return Path(raw)
    return models_dir / "models.json"


def _download_from_url(url: str, destination: Path) -> None:
    if destination.exists():
        logger.info("Model already exists, skipping download: %s", destination)
        return
    if "drive.google.com" in url:
        file_id = _extract_gdrive_file_id(url)
        if file_id:
            _download_gdrive_file(file_id, destination)
            return
    _download_http(url, destination)


def _download_http(url: str, destination: Path) -> None:
    logger.info("Downloading model from URL: %s", url)
    response = requests.get(url, stream=True, timeout=60)
    response.raise_for_status()
    _save_response_content(response, destination)


def _download_from_gdrive(model_filename: str, destination: Path) -> None:
    file_id = _resolve_gdrive_file_id(model_filename)
    if not file_id:
        raise ValueError(
            "MODEL_GDRIVE_FILE_MAP must include this model filename "
            f"({model_filename}) when using Google Drive downloads."
        )

    logger.info("Downloading model from Google Drive file id: %s", file_id)
    _download_gdrive_file(file_id, destination)


def _resolve_gdrive_file_id(model_filename: str) -> Optional[str]:
    raw_map = os.getenv("MODEL_GDRIVE_FILE_MAP", "").strip()
    if not raw_map:
        return None

    try:
        mapping: Dict[str, str] = json.loads(raw_map)
    except json.JSONDecodeError as exc:
        raise ValueError("MODEL_GDRIVE_FILE_MAP must be valid JSON.") from exc

    return mapping.get(model_filename)


def _download_gdrive_file(file_id: str, destination: Path) -> None:
    session = requests.Session()
    response = session.get(GOOGLE_DRIVE_DOWNLOAD_URL, params={"id": file_id}, stream=True, timeout=60)
    response.raise_for_status()

    token = _get_confirm_token(response)
    if token:
        response = session.get(
            GOOGLE_DRIVE_DOWNLOAD_URL,
            params={"id": file_id, "confirm": token},
            stream=True,
            timeout=60,
        )
        response.raise_for_status()

    _save_response_content(response, destination)


def _extract_gdrive_file_id(url: str) -> Optional[str]:
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    if "id" in query and query["id"]:
        return query["id"][0]
    parts = parsed.path.split("/")
    if "d" in parts:
        try:
            idx = parts.index("d")
            return parts[idx + 1]
        except (ValueError, IndexError):
            return None
    return None


def _get_confirm_token(response: requests.Response) -> Optional[str]:
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value
    return None


def _save_response_content(response: requests.Response, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as handle:
        for chunk in response.iter_content(chunk_size=32768):
            if chunk:
                handle.write(chunk)
