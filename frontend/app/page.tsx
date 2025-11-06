"use client";

import CircleBackground from "@/components/circlebackground";
import {
    TypographyH1,
    TypographyH2,
    TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight, Brain } from "lucide-react";
import Image from "next/image";
import { usePredictionContext } from "@/context/PredictionContext";

export default function Home() {
    const { handleSetProcessStatusOn } = usePredictionContext();

    return (
        <div className="relative min-h-screen bg-white font-sans overflow-hidden">
            <CircleBackground
                circleCount={150}
                seed={11}
                className="opacity-80"
            />
            <div className="relative grid justify-items-center">
                <div className="content relative sm:min-h-screen sm:py-0 pt-50 pb-30 grid place-items-center w-[min(960px,100%)] mx-6">
                    <div className="grid gap-6">
                        <div className="">
                            <TypographyH1>UTI</TypographyH1>
                            <TypographyH1>Classification</TypographyH1>
                        </div>

                        <Button
                            onClick={handleSetProcessStatusOn}
                            variant={"rounded"}
                            className=""
                        >
                            <Brain />
                            Start Prediction
                            <ArrowRight />
                        </Button>
                    </div>
                </div>

                <div className="relative grid w-[min(970px,100%)] mb-20 px-8">
                    <div className="flex flex-col sm:flex-row sm:gap-10 gap-5">
                        <div className="flex-1">
                            <TypographyH2>What is UTI?</TypographyH2>
                            <TypographyP>
                                UTI, Urinary Tract Infection is a disease that
                                affects the groin area. It can cause extreme
                                pain when relieving pee through the bladder.
                            </TypographyP>
                            <TypographyP>
                                The urinary tract includes the kidneys, ureters,
                                bladder, and urethra. Bacteria can invade any
                                part of this system, but most infections begin
                                in the bladder when microbes travel up the
                                urethra.
                            </TypographyP>
                            <TypographyP>
                                Common symptoms include burning sensations while
                                urinating, cloudy or bloody urine, pelvic
                                cramping, and a frequent urge to urinate even
                                when little urine is produced. Untreated
                                infections can spread to the kidneys, leading to
                                fever, chills, and lower back pain.
                            </TypographyP>
                        </div>

                        <div className="flex-1 sm:mt-14 rounded-3xl border-10 border-[var(--lime-green)]/40 grid place-items-center">
                            <Image
                                src="/images/rbcs-13.jpg"
                                alt=""
                                height={600}
                                width={600}
                                className="rounded-xl object-cover"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 mt-14">
                        <div>
                            <TypographyH2>Prediction Process</TypographyH2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="flex-1 relative bg-white rounded-md grid place-items-center border-2 sm:h-35 border-[var(--lime-green)] overflow-hidden">
                                <Image
                                    src="/images/dialog1.png"
                                    alt=""
                                    height={600}
                                    width={600}
                                    className="rounded-md object-contain"
                                />
                            </div>

                            <Button
                                variant={"outline"}
                                size={"icon"}
                                className="rounded-full border-[var(--dark-lime)]"
                            >
                                <ArrowRight className="sm:block hidden text-[var(--dark-lime)]" />
                                <ArrowDown className="sm:hidden block text-[var(--dark-lime)]" />
                            </Button>
                            <div className="relative flex-1 rounded-md grid place-items-center border-2 h-35 border-[var(--lime-green)] overflow-hidden">
                                <Image
                                    src="/image.jpg"
                                    alt=""
                                    height={300}
                                    width={600}
                                    className="rounded-md object-contain"
                                />
                            </div>

                            <Button
                                variant={"outline"}
                                size={"icon"}
                                className="rounded-full border-[var(--dark-lime)]"
                            >
                                <ArrowRight className="sm:block hidden text-[var(--dark-lime)]" />
                                <ArrowDown className="sm:hidden block text-[var(--dark-lime)]" />{" "}
                            </Button>

                            <div className="relative flex-1 rounded-md grid place-items-center border-2 h-35 border-[var(--lime-green)] overflow-hidden">
                                <Image
                                    src="/image.jpg"
                                    alt=""
                                    height={300}
                                    width={600}
                                    className="rounded-md object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 items-center mt-20 mb-40 px-8">
                    <TypographyH2 className="text-center">
                        Ready To Start? Start Predicting.
                    </TypographyH2>

                    <Button
                        onClick={handleSetProcessStatusOn}
                        variant={"rounded"}
                    >
                        <Brain />
                        Start Prediction
                        <ArrowRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
