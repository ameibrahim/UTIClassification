"use client";

import CircleBackground from "@/components/circlebackground";
import Navbar from "@/components/navbar";
import { TypographyH1, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function Home() {
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
                            variant={"rounded"}
                            className="bg-[#7D7D42] hover:bg-[#a8a860] text-white justify-self-center duration-300"
                        >
                            Start Prediction
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
