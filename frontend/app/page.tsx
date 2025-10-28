"use client";

import CircleBackground from "@/components/circlebackground";
import Navbar from "@/components/navbar";
import PredictionDialog from "@/components/prediction/PredictionDialog";
import { TypographyH1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain } from "lucide-react";
import { useState } from "react";

export default function Home() {
    const [isPredictionDialog, setPredictionDialog] = useState(true);

    return (
        <div className="relative min-h-screen bg-white font-sans overflow-hidden">
            <CircleBackground circleCount={130} />
            <div className="relative z-10">
                <div className="absolute z-10 px-6 w-full">
                    <Navbar />
                </div>

                <div className="content relative min-h-screen border-2 grid place-items-center">
                    <div className="grid gap-6">
                        <div className="">
                            <TypographyH1>UTI</TypographyH1>
                            <TypographyH1>Classification</TypographyH1>
                        </div>

                        <Button
                            onClick={() => setPredictionDialog(true)}
                            variant={"rounded"}
                            className=""
                        >
                            <Brain />
                            Start Prediction
                            <ArrowRight />
                        </Button>
                    </div>
                </div>
            </div>

            <PredictionDialog
                setPredictionDialog={setPredictionDialog}
                isPredictionDialog={isPredictionDialog}
            />
        </div>
    );
}
