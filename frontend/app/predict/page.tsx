"use client";

import CircleBackground from "@/components/circlebackground";
import {
    TypographyH1,
    TypographyH2,
    TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePredictionContext } from "@/context/PredictionContext";
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    FileSearch,
    MousePointerClick,
    UploadCloud,
} from "lucide-react";
import ShinyText from "@/components/ShinyText";

const predictionSteps = [
    {
        title: "1. Prepare Sample",
        description:
            "Capture or select a microscopic urine image that clearly shows cellular structures. Supported formats include PNG and JPEG.",
        icon: UploadCloud,
    },
    {
        title: "2. Upload Image",
        description:
            "Use the upload dialog to select your file. The preview confirms the image was attached successfully before analysis.",
        icon: MousePointerClick,
    },
    {
        title: "3. Run Prediction",
        description:
            "Tap Predict to run both Non-UTI and UTI classifiers sequentially. You can cancel mid-process if you selected the wrong file.",
        icon: FileSearch,
    },
    {
        title: "4. Review Results",
        description:
            "Final probabilities and class labels appear in the results dialog. Re-run with another image anytime.",
        icon: CheckCircle2,
    },
];

export default function PredictionPage() {
    const { handleSetProcessStatusOn } = usePredictionContext();

    return (
        <div className="relative min-h-screen bg-white font-sans overflow-hidden">
            <CircleBackground
                circleCount={105}
                seed={27}
                className="opacity-70"
            />

            <div className="relative grid justify-items-center">
                <section className="relative sm:min-h-[60vh] px-8 mt-30 py-20 w-[min(960px,100%)] grid gap-6 text-center">
                    <TypographyH1>
                        Prediction <ShinyText text="Workflow" speed={6} color="text-[var(--dark-lime)]"></ShinyText>
                    </TypographyH1>
                    <TypographyP>
                        Follow the steps below to upload a urine microscopy
                        image, run both models, and interpret the resulting UTI
                        likelihood. The dialog is always available so you can
                        test multiple samples without leaving this page.
                    </TypographyP>
                    <div className="justify-self-center">
                        <Button
                            onClick={handleSetProcessStatusOn}
                            variant={"rounded"}
                        >
                            <Brain />
                            Open Prediction Dialog
                            <ArrowRight />
                        </Button>
                    </div>
                </section>

                <section className="relative w-[min(1050px,100%)] px-8 grid gap-8 pb-16">
                    <TypographyH2 className="text-center">
                        Step-by-Step Guide
                    </TypographyH2>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {predictionSteps.map(({ title, description, icon }) => {
                            const Icon = icon;
                            return (
                                <div
                                    key={title}
                                    className="border-2 border-[var(--lime-green)]/70 rounded-2xl p-5 bg-white/70 shadow-sm flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-3 text-[var(--dark-lime)]">
                                        <Icon className="size-6" />
                                        <span className="font-semibold">
                                            {title}
                                        </span>
                                    </div>
                                    <TypographyP>{description}</TypographyP>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="relative w-[min(1050px,100%)] px-8 pb-24 grid gap-8">
                    <TypographyH2 className="text-center">
                        Example Screenshot
                    </TypographyH2>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="border-2 border-[var(--lime-green)] rounded-3xl overflow-hidden bg-white">
                            <Image
                                src="/images/dialog1.png"
                                alt="Prediction dialog preview"
                                width={600}
                                height={600}
                                className="object-contain"
                            />
                        </div>
                        <div className="border-2 border-[var(--lime-green)] rounded-3xl overflow-hidden bg-white">
                            <Image
                                src="/images/rbcs-13.jpg"
                                alt="Sample microscopy image"
                                width={600}
                                height={600}
                                className="object-cover h-full"
                            />
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 items-center mt-4 mb-24 px-8 text-center">
                    <TypographyH2>
                        Ready to analyze your own image?
                    </TypographyH2>
                    <Button
                        onClick={handleSetProcessStatusOn}
                        variant={"rounded"}
                    >
                        <Brain />
                        Start Predicting
                        <ArrowRight />
                    </Button>
                </section>
            </div>
        </div>
    );
}
