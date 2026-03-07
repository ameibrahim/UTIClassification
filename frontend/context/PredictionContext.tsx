"use client";

import useFileUpload from "@/hooks/useFileUpload";
import React, { useEffect } from "react";
import {
    ChangeEvent,
    useContext,
    ReactNode,
    useState,
    useCallback,
    useMemo,
    useRef,
    useLayoutEffect,
} from "react";
import { toast } from "sonner";

export type ProcessStatusType =
    | "upload"
    | "predicting"
    | "predictinguti"
    | "error"
    | "results"
    | "off";
export const ProcessStatusValues = {
    upload: "upload",
    predicting: "predicting",
    error: "error",
    results: "results",
    off: "off",
    predictinguti: "predictinguti",
};

type PredictionResponse = {
    classification?: {
        predicted_class?: number | string;
        max_prob?: number;
        class_probabilities?: Record<string, number>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

type PredictionContextValue = {
    handlePredictingImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    startPrediction: () => Promise<void>;
    imageURL?: string;
    image: File | undefined;
    isUploading: boolean;
    processStatus: ProcessStatusType;
    unuModelFileName: string;
    setUNUModelFileName: (filename: string) => void;
    utiModelFileName: string;
    setUTIModelFileName: (filename: string) => void;
    unuPredictionResult: PredictionResponse | null;
    utiPredictionResult: PredictionResponse | null;
    unuDisplayMs: number | null;
    utiDisplayMs: number | null;
    handleUploadDialogPredictButtonCallback: () => void;
    handleClosePredictionEarly: () => void;
    handlePredictionSuccess: () => void;
    handlePredictionError: () => void;
    handleRetryPrediction: () => Promise<void>;
    handleSetProcessStatusOff: () => void;
    handleSetProcessStatusOn: () => void;
};

const PredictionContext = React.createContext<PredictionContextValue | null>(
    null
);

export function usePredictionContext() {
    const context = useContext(PredictionContext);
    if (!context) {
        throw new Error(
            "usePredictionContext must be used within a PredictionProvider"
        );
    }
    return context;
}

export function PredictionProvider({ children }: { children: ReactNode }) {
    const [imageURL, setImageURL] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<File | undefined>(undefined);
    const { isUploading } = useFileUpload();
    const [processStatus, setProcessStatus] =
        useState<ProcessStatusType>("off");
    const [unuModelFileNameState, setUNUModelFileNameState] = useState<string>(
        "UNU_ResNet101V2_Round5.keras"
    );
    const [utiModelFileNameState, setUTIModelFileNameState] = useState<string>(
        "UTI_VGG19_Round4.keras"
    );
    const [unuPredictionResult, setUNUPredictionResult] =
        useState<PredictionResponse | null>(null);
    const [utiPredictionResult, setUTIPredictionResult] =
        useState<PredictionResponse | null>(null);
    const [unuInferenceStart, setUNUInferenceStart] = useState<number | null>(
        null
    );
    const [unuInferenceDuration, setUNUInferenceDuration] = useState<
        number | null
    >(null);
    const [utiInferenceStart, setUTIInferenceStart] = useState<number | null>(
        null
    );
    const [utiInferenceDuration, setUTIInferenceDuration] = useState<
        number | null
    >(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [unuDisplayMs, setUNUDisplayMs] = useState<number | null>(null);
    const [utiDisplayMs, setUTIDisplayMs] = useState<number | null>(null);

    useEffect(() => {
        setProcessStatus("off");
        setImage(undefined);
    }, []);

    useLayoutEffect(() => {
        if (unuInferenceDuration != null) {
            setUNUDisplayMs(unuInferenceDuration);
            return;
        }

        if (unuInferenceStart != null) {
            const tick = () =>
                setUNUDisplayMs(
                    Math.max(0, performance.now() - unuInferenceStart)
                );
            tick();
            const id = window.setInterval(tick, 100);
            return () => window.clearInterval(id);
        }

        setUNUDisplayMs(null);
    }, [unuInferenceStart, unuInferenceDuration]);

    useLayoutEffect(() => {
        if (utiInferenceDuration != null) {
            setUTIDisplayMs(utiInferenceDuration);
            return;
        }

        if (utiInferenceStart != null) {
            const tick = () =>
                setUTIDisplayMs(
                    Math.max(0, performance.now() - utiInferenceStart)
                );
            tick();
            const id = window.setInterval(tick, 100);
            return () => window.clearInterval(id);
        }

        setUTIDisplayMs(null);
    }, [utiInferenceStart, utiInferenceDuration]);

    const handlePredictingImageChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            try {
                if (event.target.files) {
                    const file = event.target.files[0];
                    setImage(file);
                    const url = URL.createObjectURL(file);
                    setImageURL(url);
                }
            } catch (error) {
                setImageURL(undefined);
                setImage(undefined);
                console.error(error);
            }
        },
        []
    );

    const handleSetProcessStatusOff = useCallback(() => {
        setProcessStatus("off");
        setImage(undefined);
        setImageURL(undefined);

        setUNUPredictionResult(null);
        setUTIPredictionResult(null);
        setUNUInferenceStart(null);
        setUNUInferenceDuration(null);
        setUTIInferenceStart(null);
        setUTIInferenceDuration(null);
        setUNUDisplayMs(null);
        setUTIDisplayMs(null);
    }, []);

    const handleSetProcessStatusOn = useCallback(() => {
        setProcessStatus("upload");
        setUNUPredictionResult(null);
        setUTIPredictionResult(null);
        setUNUInferenceStart(null);
        setUNUInferenceDuration(null);
        setUTIInferenceStart(null);
        setUTIInferenceDuration(null);
        setUNUDisplayMs(null);
        setUTIDisplayMs(null);
    }, []);

    const handleUploadDialogPredictButtonCallback = useCallback(() => {
        setProcessStatus("predicting");
    }, []);

    const handleClosePredictionEarly = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        toast.error("Prediction Cancelled Early");
        setProcessStatus("upload");
        setUNUPredictionResult(null);
        setUTIPredictionResult(null);
        setUNUInferenceStart(null);
        setUNUInferenceDuration(null);
        setUTIInferenceStart(null);
        setUTIInferenceDuration(null);
        setUNUDisplayMs(null);
        setUTIDisplayMs(null);
    }, []);

    const handlePredictionSuccess = useCallback(() => {
        toast.success("Prediction Finished");
        setProcessStatus("results");
    }, []);

    const handlePredictionError = useCallback(() => {
        toast.error("Error During Prediction");
        setProcessStatus("error");
    }, []);

    const startPrediction = useCallback(async () => {
        let controller: AbortController | null = null;
        try {
            if (!image) {
                toast.error("No image selected");
                setProcessStatus("upload");
                return;
            }

            if (!unuModelFileNameState || !utiModelFileNameState) {
                toast.error("Select a model before predicting");
                setProcessStatus("upload");
                return;
            }

            setProcessStatus("predicting");

            abortControllerRef.current?.abort();
            controller = new AbortController();
            abortControllerRef.current = controller;
            const activeController = controller;

            setUNUPredictionResult(null);
            setUTIPredictionResult(null);
            setUNUInferenceStart(null);
            setUNUInferenceDuration(null);
            setUTIInferenceStart(null);
            setUTIInferenceDuration(null);
            setUNUDisplayMs(null);
            setUTIDisplayMs(null);

            const sendPrediction = async (
                modelFileName: string,
                setStart: React.Dispatch<React.SetStateAction<number | null>>,
                setDuration: React.Dispatch<React.SetStateAction<number | null>>
            ): Promise<PredictionResponse> => {
                const startedAt = performance.now();
                setStart(startedAt);
                setDuration(null);

                try {
                    const formData = new FormData();
                    formData.append("image", image);
                    formData.append("modelInputFeatureSize", "224");
                    formData.append("modelFilename", modelFileName);

                    const response = await fetch(
                        "https://api.uticlassification.app/predict/",
                        {
                            method: "POST",
                            body: formData,
                            signal: activeController.signal,
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Prediction request failed with status ${response.status}`
                        );
                    }

                    const parsed =
                        (await response.json()) as PredictionResponse;
                    setDuration(performance.now() - startedAt);
                    return parsed;
                } catch (err) {
                    setDuration(performance.now() - startedAt);
                    throw err;
                }
            };

            const unuResult = await sendPrediction(
                unuModelFileNameState,
                setUNUInferenceStart,
                setUNUInferenceDuration
            );
            setUNUPredictionResult(unuResult);

            const predictedClass = Number(
                unuResult.classification?.predicted_class ?? null
            );

            if (predictedClass === 1) {
                toast.success("Image is UTI, running deeper classification");
                setProcessStatus("predictinguti");
                const utiResult = await sendPrediction(
                    utiModelFileNameState,
                    setUTIInferenceStart,
                    setUTIInferenceDuration
                );
                setUTIPredictionResult(utiResult);
            } else {
                setUTIPredictionResult(null);
                setUTIInferenceStart(null);
                setUTIInferenceDuration(null);
            }

            handlePredictionSuccess();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            console.error(error);
            handlePredictionError();
        } finally {
            if (controller && abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, [
        image,
        unuModelFileNameState,
        utiModelFileNameState,
        handlePredictionError,
        handlePredictionSuccess,
    ]);

    const handleRetryPrediction = useCallback(async () => {
        toast.error("Retrying Prediction");
        setProcessStatus("error");
    }, []);

    const value = useMemo(
        () => ({
            handlePredictingImageChange,
            startPrediction,
            imageURL,
            isUploading,
            processStatus,
            unuModelFileName: unuModelFileNameState,
            setUNUModelFileName: setUNUModelFileNameState,
            utiModelFileName: utiModelFileNameState,
            setUTIModelFileName: setUTIModelFileNameState,
            unuPredictionResult,
            utiPredictionResult,
            unuDisplayMs,
            utiDisplayMs,
            image,
            handleUploadDialogPredictButtonCallback,
            handleClosePredictionEarly,
            handlePredictionSuccess,
            handlePredictionError,
            handleRetryPrediction,
            handleSetProcessStatusOff,
            handleSetProcessStatusOn,
        }),
        [
            handlePredictingImageChange,
            startPrediction,
            imageURL,
            image,
            isUploading,
            processStatus,
            unuModelFileNameState,
            utiModelFileNameState,
            unuPredictionResult,
            utiPredictionResult,
            unuDisplayMs,
            utiDisplayMs,
            handleUploadDialogPredictButtonCallback,
            handleClosePredictionEarly,
            handlePredictionSuccess,
            handlePredictionError,
            handleRetryPrediction,
            handleSetProcessStatusOff,
            handleSetProcessStatusOn,
        ]
    );

    return (
        <PredictionContext.Provider value={value}>
            {children}
        </PredictionContext.Provider>
    );
}
