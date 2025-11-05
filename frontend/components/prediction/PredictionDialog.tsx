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
    } = usePredictionContext();

    return (
        <Dialog
            open={processStatus == ProcessStatusValues.upload}
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
                            className="w-full border-[1.3px] border-[var(--lime-green)] text-[var(--lime-green)] border-dashed px-4 py-10 rounded-md flex justify-center"
                            htmlFor="upload-image"
                        >
                            <div className="">
                                Choose an image file for prediction
                            </div>
                            <input
                                className="hidden"
                                id="upload-image"
                                type="file"
                                onChange={handlePredictingImageChange}
                            />
                        </Label>
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function PredictingLoaderDialog() {
    const { processStatus, handleClosePredictionEarly } =
        usePredictionContext();

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

function ResultsDialog() {
    const { processStatus, handleSetProcessStatusOff } = usePredictionContext();
    return (
        <Dialog open={processStatus == ProcessStatusValues.results}>
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
                        <ResultListItem title="Inference Time" value="3.5s" />
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