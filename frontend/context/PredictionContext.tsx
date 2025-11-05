import useFileUpload from "@/hooks/useFileUpload";
import React, { useEffect } from "react";
import {
    ChangeEvent,
    useContext,
    ReactNode,
    useState,
    useCallback,
    useMemo,
} from "react";
import { toast } from "sonner";

export type ProcessStatusType =
    | "upload"
    | "predicting"
    | "error"
    | "results"
    | "off";
export const ProcessStatusValues = {
    upload: "upload",
    predicting: "predicting",
    error: "error",
    results: "results",
    off: "off",
};

type PredictionContextValue = {
    handlePredictingImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    startPrediction: () => Promise<void>;
    imageURL?: string;
    isUploading: boolean;
    processStatus: ProcessStatusType;
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
    const { uploadFile, isUploading } = useFileUpload();
    const [processStatus, setProcessStatus] =
        useState<ProcessStatusType>("upload");

    useEffect(() => {
        setProcessStatus("upload");
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
    }, []);

    const handleSetProcessStatusOn = useCallback(() => {
        setProcessStatus("upload");
    }, []);

    const handleUploadDialogPredictButtonCallback = useCallback(() => {
        setProcessStatus("predicting");
    }, []);

    const handleClosePredictionEarly = useCallback(() => {
        toast.error("Prediction Cancelled Early");
        setProcessStatus("upload");
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
        try {
            if (!image) {
                toast.error("No image selected");
                setProcessStatus("upload");
                return;
            }

            const result = await uploadFile(image);
            console.log("upload result: ", result);

            const fileName = result.split("/uploads/")[1];

            const prediction = await fetch("/api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileName }),
            });

            const predictionResults = JSON.parse(
                await prediction.text()
            ).classification;
            console.log("predictionResults: ", predictionResults);

            if (predictionResults) {
                handlePredictionSuccess();
            } else {
                handlePredictionError();
            }
        } catch (error) {
            console.error(error);
            handlePredictionError();
        }
    }, [
        image,
        uploadFile,
        handlePredictionError,
        handlePredictionSuccess,
        setProcessStatus,
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