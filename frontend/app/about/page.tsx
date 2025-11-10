"use client";

import CircleBackground from "@/components/circlebackground";
import {
    TypographyH1,
    TypographyH2,
    TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePredictionContext } from "@/context/PredictionContext";
import {
    ArrowRight,
    Brain,
    CloudDownload,
    Database,
    Github,
    Microscope,
    ShieldCheck,
    Users,
} from "lucide-react";

const pillars = [
    {
        title: "Clinical Awareness",
        description:
            "Highlight the prevalence of UTIs and empower clinicians, laboratorians, and patients with faster triage information.",
        icon: ShieldCheck,
    },
    {
        title: "Imaging + AI",
        description:
            "Combine microscope imagery with deep-learning models to grade samples consistently and reduce manual review time.",
        icon: Microscope,
    },
    {
        title: "Collaborative Tools",
        description:
            "Provide an interface that researchers, students, and healthcare teams can iterate on together as datasets evolve.",
        icon: Users,
    },
];

export default function AboutPage() {
    const { handleSetProcessStatusOn } = usePredictionContext();
    const resourceLinks = [
        {
            label: "Zenodo Dataset",
            href: "https://zenodo.org/uploads/17449876",
            icon: Database,
        },
        {
            label: "GitHub Repository",
            href: "https://github.com/ameibrahim/UTIClassification",
            icon: Github,
        },
        {
            label: "Google Drive Assets",
            href: "https://drive.google.com/file/d/1uya9xPwyf2UtO8uLETywclmfBg9BP3AD/view?usp=share_link",
            icon: CloudDownload,
        },
    ];

    return (
        <div className="relative min-h-screen bg-white font-sans overflow-hidden">
            <CircleBackground
                circleCount={95}
                seed={33}
                className="opacity-60"
            />

            <div className="relative grid justify-items-center ">
                <section className="relative sm:min-h-[60vh] px-8 mt-30 py-20 w-[min(960px,100%)] grid gap-6 text-center">
                    <TypographyH1>About The Project</TypographyH1>
                    <TypographyP>
                        UTIClassification brings laboratory-grade AI assistance
                        to microscopic urine images. The goal is to offer a
                        transparent workflow for experimenting with
                        computer-vision models that separate non-UTI cases from
                        probable infections.
                    </TypographyP>

                    <div className="justify-self-center">
                        <Button
                            onClick={handleSetProcessStatusOn}
                            variant={"rounded"}
                        >
                            <Brain />
                            Try The Predictor
                            <ArrowRight />
                        </Button>
                    </div>
                </section>

                <section className="relative w-[min(1050px,100%)] px-8 grid gap-10 pb-16">
                    <TypographyH2 className="text-center">
                        Guiding Pillars
                    </TypographyH2>
                    <div className="grid gap-5 sm:grid-cols-3">
                        {pillars.map(({ title, description, icon }) => {
                            const Icon = icon;
                            return (
                                <div
                                    key={title}
                                    className="border-2 border-[var(--lime-green)]/70 rounded-3xl p-6 bg-white/80 flex flex-col gap-3 text-center"
                                >
                                    <Icon className="size-8 mx-auto text-[var(--dark-lime)]" />
                                    <h3 className="font-semibold text-lg">
                                        {title}
                                    </h3>
                                    <TypographyP>{description}</TypographyP>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="relative w-[min(1050px,100%)] px-8 grid gap-8 pb-24">
                    <TypographyH2 className="text-center">
                        Data &amp; Models
                    </TypographyH2>
                    <div className="grid gap-8 sm:grid-cols-2 items-center">
                        <div className="grid gap-4">
                            <TypographyP>
                                The demo ships with two pretrained models:
                                `UNU_ResNet101V2_Round5.keras` for Non-UTI
                                detection and `UTI_VGG19_Round4.keras` for UTI
                                classification. Each is exposed through the web
                                interface so you can evaluate predictions
                                without downloading tooling.
                            </TypographyP>
                        </div>

                        <div className="rounded-3xl border-10 border-[var(--lime-green)]/40 overflow-hidden">
                            <Image
                                src="/images/rbcs-13.jpg"
                                alt="Microscopy sample"
                                width={800}
                                height={600}
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 items-center mt-4 mb-24 px-8 text-center">
                    <TypographyH2>
                        Want to contribute or extend the models?
                    </TypographyH2>
                    <TypographyP>
                        Explore the repository, tweak the training notebooks, or
                        adapt the API to your preferred deployment target.
                    </TypographyP>
                    <div className="flex flex-wrap justify-center gap-3">
                        {resourceLinks.map(({ label, href, icon: Icon }) => (
                            <Button
                                key={label}
                                variant={"rounded"}
                                asChild
                                className="gap-2"
                            >
                                <Link
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
