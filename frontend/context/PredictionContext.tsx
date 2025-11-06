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
    classification: {
        predicted_class: "0" | "1" | "2";
        max_prob: number;
        class_probabilities: Record<string, number>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

type PredictionContextValue = {
    handlePredictingImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    startPrediction: () => Promise<void>;
    imageURL?: string;
    isUploading: boolean;
    processStatus: ProcessStatusType;
    unuModelFileName: string;
    setUNUModelFileName: (filename: string) => void;
    utiModelFileName: string;
    setUTIModelFileName: (filename: string) => void;
    unuPredictionResult: PredictionResponse | null;
    utiPredictionResult: PredictionResponse | null;
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
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setProcessStatus("off");
    }, []);

    const handlePredictingImageChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            try {
                if (event.target.files) {
                    const file = event.target.files[0];
                    setImage(file);
                    const url = URL.createObjectURL(file);
                    console.log("url", url);
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
        setUNUPredictionResult(null);
        setUTIPredictionResult(null);
    }, []);

    const handleSetProcessStatusOn = useCallback(() => {
        setProcessStatus("upload");
        setUNUPredictionResult(null);
        setUTIPredictionResult(null);
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

            const sendPrediction = async (
                modelFileName: string
            ): Promise<PredictionResponse> => {
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

                return (await response.json()) as PredictionResponse;
            };

            const unuResult = await sendPrediction(unuModelFileNameState);
            setUNUPredictionResult(unuResult);

            console.log("unuResult: ", unuResult);

            const predictedClass =
                unuResult.classification?.predicted_class ?? null;

            if (Number(predictedClass) == 1) {
                toast.success("Image is UTI, running deeper classification");
                setProcessStatus("predictinguti")
                const utiResult = await sendPrediction(utiModelFileNameState);
                setUTIPredictionResult(utiResult);
                console.log("utiResult: ", utiResult);
            } else {
                setUTIPredictionResult(null);
            }

            handlePredictionSuccess();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                console.log("Prediction request aborted");
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
            isUploading,
            processStatus,
            unuModelFileNameState,
            utiModelFileNameState,
            unuPredictionResult,
            utiPredictionResult,
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
