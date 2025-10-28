"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
    ArrowUpRight,
    BadgeX,
    Dot,
    IterationCw,
    OctagonAlert,
    X,
} from "lucide-react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";

type ProcessStatusType = "upload" | "predicting" | "error" | "results";
const ProcessStatusValues = {
    upload: "upload",
    predicting: "predicting",
    error: "error",
    results: "results",
};

function PredictionDialog({
    isPredictionDialog,
    setPredictionDialog,
}: {
    isPredictionDialog: boolean;
    setPredictionDialog: Dispatch<SetStateAction<boolean>>;
}) {
    const [processStatus, setProcessStatus] =
        useState<ProcessStatusType>("upload");

    const [isPredictionLoader, setIsPredictionLoader] = useState(false);
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        setProcessStatus("upload");
    }, []);

    function handleUploadDialogPredictButtonCallback() {
        setProcessStatus("predicting");
        setTrigger(true);
    }

    function handleClosePredictionEarly() {
        // stopFetching()
        toast.error("Prediction Cancelled Early");
        setProcessStatus("upload");
    }

    function handlePredictionSuccess() {
        toast.success("Prediction Finished");
        setProcessStatus("results");
    }

    function handlePredictionError() {
        toast.error("Error During Prediction");
        setProcessStatus("error");
    }

    async function handleRetryPrediction() {
        toast.error("Retrying Prediction");
        setProcessStatus("error");
    }

    return (
        <>
            {processStatus == ProcessStatusValues.upload && (
                <UploadDialog
                    open={isPredictionDialog}
                    onOpenChange={setPredictionDialog}
                    callback={handleUploadDialogPredictButtonCallback}
                />
            )}

            {processStatus == ProcessStatusValues.predicting && (
                <PredictingLoaderDialog
                    trigger={trigger}
                    handleCloseEarly={handleClosePredictionEarly}
                    handleSuccess={handlePredictionSuccess}
                    handleFailure={handlePredictionError}
                />
            )}

            {processStatus == ProcessStatusValues.error && <ErrorDialog />}

            {processStatus == ProcessStatusValues.results && (
                <Results
                    open={isPredictionDialog}
                    onOpenChange={setPredictionDialog}
                />
            )}
        </>
    );
}

function UploadDialog({
    open,
    onOpenChange,
    callback,
}: {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    callback: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>UTI Classification</DialogTitle>
                    <DialogDescription>
                        You can start prediction by uploading a relevant image.
                        Irrelevant images will be marked as non UTI
                    </DialogDescription>

                    <div className="grid gap-4 mt-2">
                        <Label
                            className="w-full border-[1.3px] border-[var(--lime-green)] text-[var(--lime-green)] border-dashed px-4 py-10 rounded-md flex justify-center"
                            htmlFor="upload-image"
                        >
                            <div className="">
                                Choose an image file for prediction
                            </div>
                            {/* <input
                        className="border"
                        id="upload-image"
                        type="file"
                    ></input> */}
                        </Label>
                        <Button
                            className="justify-self-end px-10"
                            variant={"rounded"}
                            onClick={callback}
                        >
                            <ShinyText
                                text="Predict"
                                disabled={false}
                                speed={5}
                                className=""
                            />
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function PredictingLoaderDialog({
    handleCloseEarly,
    handleSuccess,
    handleFailure,
    trigger,
}: {
    handleCloseEarly: () => void;
    handleSuccess: () => void;
    handleFailure: () => void;
    trigger: boolean;
}) {
    // const [progress, setProgress] = React.useState(13);

    // React.useEffect(() => {
    //     const timer = setTimeout(() => setProgress(66), 500);
    //     return () => clearTimeout(timer);
    // }, []);

    // GET FROM CONTEXT

    useEffect(() => {
        function loading() {
            setTimeout(() => {
                const random = Math.ceil(Math.random() * 10)
                console.log(random);
                if(random > 5) handleSuccess();
                else handleFailure();
            }, 3000);
        }

        if (trigger == true) {
            loading();
        }
    }, [trigger]);

    return (
        <>
            <Dialog open={true}>
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
                                        text="Predicting..."
                                        disabled={false}
                                        speed={5}
                                        className=""
                                        color="text-[var(--dark-lime)]"
                                    />
                                </ItemContent>
                            </Item>
                        </div>

                        <div className="w-full flex justify-end">
                            <Button
                                onClick={handleCloseEarly}
                                variant={"rounded"}
                            >
                                <BadgeX /> Cancel Early
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* <Progress
                value={progress}
                indicatorClassName="bg-[var(--dark-lime)]"
                className="w-full h-0.5 bg-[var(--lime-green)]/30"
            /> */}
        </>
    );
}

function ErrorDialog({}: {}) {
    return (
        <>
            <Dialog open={true}>
                <DialogContent
                    showCloseButton={false}
                    className="border-red-300"
                >
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

            {/* <Progress
                value={progress}
                indicatorClassName="bg-[var(--dark-lime)]"
                className="w-full h-0.5 bg-[var(--lime-green)]/30"
            /> */}
        </>
    );
}

function Results({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <>
            <Dialog open={open}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-[var(--dark-lime)]">
                            Results
                        </DialogTitle>

                        <div className="grid justify-items-start">
                            <ResultListItem
                                title="Predicted UTI Class"
                                value="RBC"
                            />
                            <ResultListItem title="Accuracy" value="99%" />
                            <ResultListItem
                                title="Model Used"
                                value="UTI-ResNet50V2.keras"
                            />
                            <ResultListItem
                                title="Inference Time"
                                value="3.5s"
                            />
                        </div>

                        <div className="my-2 text-xs font-bold text-[var(--dark-lime)]">
                            GradCam Shots
                        </div>

                        <div className="flex gap-2 mb-2">
                            <div className="h-30 w-30 border-2 border-[var(--lime-green)] rounded-md flex justify-center items-center">
                                <ArrowUpRight className="text-[var(--lime-green)]" />
                            </div>
                            <div className="h-30 w-30 border-2 border-[var(--lime-green)] rounded-md flex justify-center items-center">
                                <ArrowUpRight className="text-[var(--lime-green)]" />
                            </div>
                            <div className="h-30 w-30 border-2 border-[var(--lime-green)] rounded-md flex justify-center items-center">
                                <ArrowUpRight className="text-[var(--lime-green)]" />
                            </div>
                        </div>

                        <div className="w-full flex justify-end">
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant={"rounded"}
                            >
                                Done Review
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* <Progress
                value={progress}
                indicatorClassName="bg-[var(--dark-lime)]"
                className="w-full h-0.5 bg-[var(--lime-green)]/30"
            /> */}
        </>
    );
}

function ResultListItem({ title, value }: { title: string; value: string }) {
    return (
        <Item variant="default" className="gap-2 p-0">
            <ItemMedia>
                <Dot className="text-[var(--dark-lime)]" />
            </ItemMedia>
            <ItemContent>{title} - </ItemContent>
            <ItemContent className="text-[var(--lime-green)] font-bold">
                {value}
            </ItemContent>
        </Item>
    );
}

function ImageReview({
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

export default PredictionDialog;
