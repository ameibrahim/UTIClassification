"use client";

import React, { Dispatch, SetStateAction } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogDescription,
    DialogHeader,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import ShinyText from "../ShinyText";
import { Spinner } from "../ui/spinner";
import { ItemMedia, ItemContent, Item } from "../ui/item";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    BadgeX,
    Dot,
    IterationCw,
    OctagonAlert,
    X,
} from "lucide-react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
    ProcessStatusValues,
    usePredictionContext,
} from "@/context/PredictionContext";
import { Separator } from "../ui/separator";

const MULTICLASS_LABELS = {
    leuko: "Leukocytes",
    eryth: "Erythrocytes",
    mycete: "Fungi",
    cast: "Casts",
    cryst: "Crystals",
    epith: "Epithelial Cells",
    epithn: "Renal Epithelial Cells",
};

function getMulticlassLabel(key: string): string {
    return MULTICLASS_LABELS[key as keyof typeof MULTICLASS_LABELS] ?? key;
}

export default function PredictionDialogSet() {
    // These are all controlled by a context
    // to be able to pass data around efficiently
    // and seperate the UI into multiple components
    // as well as keep the set in the layout for use
    // in other pages.

    return (
        <>
            <UploadDialog />
            <PredictingLoaderDialog />
            <ErrorDialog />
            <ResultsDialog />
        </>
    );
}

function UploadDialog() {
    const {
        processStatus,
        handleSetProcessStatusOff,
        handlePredictingImageChange,
        startPrediction,
        image,
        imageURL,
    } = usePredictionContext();

    return (
        <Dialog
            open={processStatus === ProcessStatusValues.upload}
            onOpenChange={handleSetProcessStatusOff}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>UTI Classification</DialogTitle>
                    <DialogDescription>
                        You can start prediction by uploading a relevant image.
                        Irrelevant images will be marked as non UTI
                    </DialogDescription>

                    <div className="grid gap-4 mt-2">
                        <Label
                            className="relative w-full border-[1.3px] border-[var(--lime-green)] text-[var(--lime-green)] border-dashed px-4 py-10 rounded-md flex justify-center"
                            htmlFor="upload-image"
                        >
                            {!imageURL ? (
                                <div className="">
                                    Choose an image file for prediction
                                </div>
                            ) : (
                                <div className="grid gap-4 justify-items-center">
                                    <Image
                                        src={imageURL}
                                        alt={
                                            image?.name ??
                                            "Selected image preview"
                                        }
                                        height={200}
                                        width={200}
                                        className="object-contain rounded-md"
                                    />
                                    <div className="text-xs max-w-md">
                                        {image?.name}
                                    </div>
                                </div>
                            )}

                            <input
                                className="hidden w-full h-full"
                                id="upload-image"
                                type="file"
                                accept="image/*"
                                onChange={handlePredictingImageChange}
                            />
                        </Label>

                        <div className="sm:flex grid sm:justify-between justify-center gap-2 items-center">
                            <div>
                                {image && (
                                    <div className="flex gap-1 items-center text-xs text-gray-500">
                                        <ArrowUp className="size-3" /> click on
                                        the image to choose another
                                    </div>
                                )}
                            </div>
                            <Button
                                className="justify-self-end px-10"
                                variant={"rounded"}
                                onClick={() => {
                                    startPrediction();
                                }}
                            >
                                <ShinyText
                                    text="Predict"
                                    disabled={false}
                                    speed={5}
                                    className=""
                                />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function PredictingLoaderDialog() {
    const { processStatus, handleClosePredictionEarly, unuDisplayMs } =
        usePredictionContext();
    const displayTime = formatMillisecondsToSeconds(unuDisplayMs ?? 0);

    return (
        <Dialog open={processStatus === ProcessStatusValues.predicting}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>
                        <ShinyText
                            text="Predicting From Image"
                            disabled={false}
                            speed={7}
                            className=""
                            color="text-[var(--dark-lime)]"
                        />
                    </DialogTitle>

                    <div className="py-20 w-full grid place-items-center">
                        <Item variant="default" className="gap-2">
                            <ItemMedia>
                                <Spinner className="text-[var(--dark-lime)]" />
                            </ItemMedia>
                            <ItemContent>
                                <ShinyText
                                    text={`Predicting...`}
                                    disabled={false}
                                    speed={5}
                                    className=""
                                    color="text-[var(--dark-lime)]"
                                />
                            </ItemContent>
                        </Item>
                    </div>

                    <div className="w-full text-xs font-bold items-end flex justify-between">
                        <ShinyText
                            text={displayTime}
                            disabled={false}
                            speed={3}
                            className=""
                            color="text-[var(--dark-lime)]"
                        />
                        <Button
                            onClick={handleClosePredictionEarly}
                            variant={"rounded"}
                        >
                            <BadgeX /> Cancel Early
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function ErrorDialog() {
    const { processStatus, handleClosePredictionEarly, handleRetryPrediction } =
        usePredictionContext();

    return (
        <Dialog open={processStatus == ProcessStatusValues.error}>
            <DialogContent showCloseButton={false} className="border-red-300">
                <DialogHeader>
                    <DialogTitle className="text-red-500">
                        Error Predicting
                    </DialogTitle>

                    <div className="py-20 w-full grid place-items-center">
                        <Item variant="default" className="gap-2">
                            <ItemMedia>
                                <OctagonAlert className="text-red-500 size-4" />
                            </ItemMedia>
                            <ItemContent className="text-red-500">
                                Error During Prediction
                            </ItemContent>
                        </Item>
                    </div>

                    <div className="w-full flex justify-between">
                        <Button
                            variant={"rounded"}
                            className="bg-yellow-400 hover:bg-yellow-400"
                            onClick={handleClosePredictionEarly}
                        >
                            <X className="text-yellow-200" />
                            <ShinyText
                                text="Cancel"
                                disabled={false}
                                speed={5}
                                className=""
                                color="text-yellow-200"
                            />
                        </Button>

                        <Button
                            variant={"rounded"}
                            className="bg-red-500 hover:bg-red-400"
                            onClick={() => {
                                void handleRetryPrediction();
                            }}
                        >
                            <IterationCw className="text-red-100" />
                            <ShinyText
                                text="Retry"
                                disabled={false}
                                speed={3}
                                className=""
                                color="text-red-100"
                            />
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

const UNUCLASSNAMES = {
    "0": "Non UTI",
    "1": "UTI",
    "2": "Error",
};

const UTICLASSNAMES = {
    "0": "Fungi",
    "1": "PSS",
    "2": "RBC",
};

function turnIntoPercentage(decimal: number) {
    const clamped = Math.max(0, Math.min(1, decimal));
    return `${(clamped * 100).toFixed(2)}%`;
}

function formatMillisecondsToSeconds(milliseconds: number | null) {
    if (milliseconds == null) {
        return "—";
    }
    return `${(milliseconds / 1000).toFixed(1)}s`;
}

function getClassLabel<T extends Record<string, string>>(
    labels: T,
    key: string
): string {
    if (key in labels) {
        return labels[key as keyof T];
    }
    return "Unknown";
}

function toProbability(value: number | string | undefined): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 0;
}

function ResultsDialog() {
    const {
        processStatus,
        handleSetProcessStatusOff,
        unuPredictionResult,
        utiPredictionResult,
        unuModelFileName,
        utiModelFileName,
        unuDisplayMs,
        utiDisplayMs,
        cellProcessStatus,
        cellPredictions,
        totalCells,
        processedCells,
    } = usePredictionContext();

    const renderBinaryClassification = () => {
        if (!unuPredictionResult) return null;

        const predictedKey = String(
            unuPredictionResult.classification?.predicted_class ?? "0"
        );
        const predictedLabel = getClassLabel(UNUCLASSNAMES, predictedKey);
        const accuracy = toProbability(
            unuPredictionResult.classification?.max_prob
        );

        return (
            <div>
                <div className="text-xs underline underline-offset-4 mb-4 font-medium text-[var(--dark-lime)]">
                    Binary Classification
                </div>

                <div className="border-1 py-1 rounded-md">
                    <div className="grid justify-items-start sm:py-1 sm:p-0 p-3 sm:gap-0 gap-1 ">
                        <ResultListItem
                            title="Predicted Class"
                            value={predictedLabel}
                        />
                        <Separator />
                        <ResultListItem
                            title="Accuracy"
                            value={turnIntoPercentage(accuracy)}
                        />
                        <Separator />

                        <ResultListItem
                            title="Model Used"
                            value={unuModelFileName}
                        />
                        <Separator />

                        <ResultListItem
                            title="Inference Time"
                            value={formatMillisecondsToSeconds(unuDisplayMs)}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDeepClassificationSpinner = () => {
        if (
            unuPredictionResult?.classification?.predicted_class == "0" ||
            utiPredictionResult
        )
            return null;

        return (
            <div className="p-4 w-full grid place-items-center">
                <Item variant="default" className="gap-2">
                    <ItemMedia>
                        <Spinner className="text-[var(--dark-lime)]" />
                    </ItemMedia>
                    <ItemContent>
                        <ShinyText
                            text={`Performing Deeper Classification...`}
                            disabled={false}
                            speed={5}
                            className=""
                            color="text-[var(--dark-lime)]"
                        />
                    </ItemContent>
                </Item>
            </div>
        );
    };

    const renderMultiClassificationSpinner = () => {
        if (
            unuPredictionResult?.classification?.predicted_class === "0" ||
            cellProcessStatus == "finished"
        )
            return null;

        return (
            <div className="p-4 w-full grid place-items-center gap-3">
                <Item variant="default" className="gap-3">
                    <ItemMedia>
                        <Spinner className="text-[var(--dark-lime)]" />
                    </ItemMedia>

                    <ItemContent className="flex flex-col gap-1">
                        <ShinyText
                            text="Performing Multi Classification..."
                            disabled={false}
                            speed={5}
                            color="text-[var(--dark-lime)]"
                        />
                    </ItemContent>
                </Item>
                {totalCells > 0 && (
                    <div className="text-xs opacity-70">
                        {processedCells} / {totalCells} cells analyzed
                    </div>
                )}
            </div>
        );
    };

    const CELL_ORDER = [
        "leuko",
        "eryth",
        "mycete",
        "cast",
        "cryst",
        "epith",
        "epithn",
    ];

    const renderMultiClassification = () => {
        if (!cellPredictions) return null;

        const classCounts = CELL_ORDER.reduce(
            (acc, key) => {
                acc[key] = 0;
                return acc;
            },
            {} as Record<string, number>
        );

        cellPredictions.forEach((prediction) => {
            const key = prediction.prediction.class;
            if (classCounts[key] !== undefined) {
                classCounts[key] += 1;
            }
        });

        return (
            <div>
                <div className="text-xs underline underline-offset-4 mb-4 font-medium text-[var(--dark-lime)]">
                    Multi Classification
                </div>

                <div className="grid justify-items-start border-1 sm:py-1 sm:p-0 p-3 sm:gap-0 gap-1 rounded-md">
                    {classCounts && classCounts.length > 1 && CELL_ORDER.map((key, index) => (
                        <div className="grid justify-items-start border-1 sm:py-1 sm:p-0 p-3 sm:gap-0 gap-1 rounded-md">
                            <ResultListItem
                                title={getMulticlassLabel(key)}
                                value={classCounts[key]}
                            />
                            {index !== CELL_ORDER.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderUTIClassification = () => {
        if (!utiPredictionResult) return null;

        const predictedKey = String(
            utiPredictionResult.classification?.predicted_class ?? "0"
        );
        const predictedLabel = getClassLabel(UTICLASSNAMES, predictedKey);
        const accuracy = toProbability(
            utiPredictionResult.classification?.max_prob
        );

        return (
            <div>
                <div className="text-xs underline underline-offset-4 mb-4 font-medium text-[var(--dark-lime)]">
                    UTI Classification
                </div>
                <div className="grid justify-items-start border-1 sm:py-1 sm:p-0 p-3 sm:gap-0 gap-1 rounded-md">
                    <ResultListItem
                        title="Predicted UTI Class"
                        value={predictedLabel}
                    />
                    <Separator />
                    <ResultListItem
                        title="Accuracy"
                        value={turnIntoPercentage(accuracy)}
                    />
                    <Separator />
                    <ResultListItem
                        title="Model Used"
                        value={utiModelFileName}
                    />
                    <Separator />

                    <ResultListItem
                        title="Inference Time"
                        value={formatMillisecondsToSeconds(utiDisplayMs)}
                    />
                </div>
            </div>
        );
    };

    return (
        <Dialog
            open={
                processStatus == ProcessStatusValues.results ||
                processStatus == ProcessStatusValues.predictinguti
            }
        >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-[var(--dark-lime)]">
                        Results
                    </DialogTitle>

                    {renderBinaryClassification()}
                    {renderDeepClassificationSpinner()}
                    {renderUTIClassification()}
                    {renderMultiClassificationSpinner()}
                    {renderMultiClassification()}

                    <div className="w-full items-end font-bold text-xs flex justify-between mt-2">
                        <div>
                            {!utiPredictionResult && (
                                <ShinyText
                                    text={formatMillisecondsToSeconds(
                                        utiDisplayMs
                                    )}
                                    disabled={false}
                                    speed={3}
                                    className=""
                                    color="text-[var(--dark-lime)]"
                                />
                            )}
                        </div>
                        <Button
                            onClick={handleSetProcessStatusOff}
                            variant={"rounded"}
                        >
                            Done Review
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
function ResultListItem({
    title,
    value,
}: {
    title: string | number;
    value: string | number;
}) {
    return (
        <Item
            variant="default"
            className="gap-0 p-0 text-xs sm:flex grid sm:items-center sm:justify-center justify-start"
        >
            <ItemMedia className="sm:flex hidden">
                <Dot className="text-[var(--dark-lime)]" />
            </ItemMedia>
            <ItemContent className="text-start sm:no-underline underline underline-offset-2">
                {title}
            </ItemContent>
            <ItemContent className="sm:flex hidden">:</ItemContent>
            <ItemContent className="sm:ml-1 text-[var(--lime-green)] font-bold text-start">
                {value}
            </ItemContent>
        </Item>
    );
}

export function ImageReview({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    className="aspect-square"
                >
                    <DialogHeader>
                        <div className="z-1 w-full h-full absolute top-0 left-0">
                            <Image
                                fill={true}
                                alt="Review Image"
                                className="object-cover"
                                src="/image.jpg"
                            />
                        </div>
                        <DialogTitle className="z-10 flex justify-between items-center">
                            <Item className="bg-[var(--dark-lime)] rounded-2xl py-2 select-none opacity-70 text-xs text-white">
                                Image Review
                            </Item>

                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        className="rounded-full p-0"
                                        variant={"rounded"}
                                        size={"icon"}
                                    >
                                        <ArrowDown />
                                        {/* <Spinner /> */}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="flex gap-1 items-center">
                                    downloading image{" "}
                                    <Spinner className="size-3" />
                                </TooltipContent>
                            </Tooltip>
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
