"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

type CircleConfig = {
    sizePx: string;
    leftPercent: string;
    topPercent: string;
    durationSec: string;
    delaySec: string;
    translateXPx: string;
    translateYPx: string;
    opacity: number;
};

const normalizeZero = (value: number, threshold = 0.0005) =>
    Math.abs(value) < threshold ? 0 : value;

const formatPercent = (value: number) => `${normalizeZero(value).toFixed(2)}%`;
const formatPixel = (value: number) => `${normalizeZero(value).toFixed(2)}px`;
const formatSeconds = (value: number) => `${normalizeZero(value).toFixed(2)}s`;

const createRng = (seed: number) => {
    let state = seed >>> 0;

    return () => {
        state += 0x6d2b79f5;
        state = Math.imul(state ^ (state >>> 15), 1 | state);
        state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
        return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
};

const generateCircles = (count: number, seed = 13): CircleConfig[] => {
    const rng = createRng(seed);

    return Array.from({ length: count }, () => {
        const size = 13 + rng() * 3;
        const left = rng() * 100;
        const top = rng() * 100;
        const duration = 13 + rng() * 13;
        const delay = rng() * -duration;
        const translateX = (rng() - 0.5) * 140;
        const translateY = (rng() - 0.5) * 160;
        const opacity = 0.13 + rng() * 0.87;

        return {
            sizePx: formatPixel(size),
            leftPercent: formatPercent(left),
            topPercent: formatPercent(top),
            durationSec: formatSeconds(duration),
            delaySec: formatSeconds(delay),
            translateXPx: formatPixel(translateX),
            translateYPx: formatPixel(translateY),
            opacity: Number(normalizeZero(opacity).toFixed(3)),
        };
    });
};

type CircleBackgroundProps = {
    circleCount?: number;
    className?: string;
    seed?: number;
};

const CircleBackground = ({
    circleCount = 150,
    className,
    seed = 13,
}: CircleBackgroundProps) => {
    const circles = useMemo(
        () => generateCircles(circleCount, seed),
        [circleCount, seed]
    );
    const containerClass = [
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClass}>
            {circles.map((circle, index) => (
                <span
                    key={index}
                    className="circle"
                    style={
                        {
                            width: circle.sizePx,
                            height: circle.sizePx,
                            left: circle.leftPercent,
                            top: circle.topPercent,
                            opacity: circle.opacity,
                            animationDelay: circle.delaySec,
                            animationDuration: circle.durationSec,
                            "--tx": circle.translateXPx,
                            "--ty": circle.translateYPx,
                        } as CSSProperties
                    }
                />
            ))}
            <style jsx>{`
                .circle {
                    position: absolute;
                    border-radius: 50%;
                    background: white;
                    border: 1px solid #57572E;
                    transform: translate3d(-50%, -50%, 0);
                    animation-name: circleFloat;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    filter: blur(0.2px);
                }

                .circle:nth-of-type(odd) {
                    animation-name: circleFloatAlt;
                }

                @keyframes circleFloat {
                    0%,
                    100% {
                        transform: translate3d(-50%, -50%, 0);
                    }
                    50% {
                        transform: translate3d(
                            calc(-50% + var(--tx)),
                            calc(-50% + var(--ty)),
                            0
                        );
                    }
                }

                @keyframes circleFloatAlt {
                    0%,
                    100% {
                        transform: translate3d(-50%, -50%, 0) scale(1);
                    }
                    40% {
                        transform: translate3d(
                                calc(-50% - calc(var(--tx) * 0.6)),
                                calc(-50% - calc(var(--ty) * 0.6)),
                                0
                            )
                            scale(1.05);
                    }
                    70% {
                        transform: translate3d(
                                calc(-50% + calc(var(--tx) * 0.8)),
                                calc(-50% + calc(var(--ty) * 0.8)),
                                0
                            )
                            scale(0.97);
                    }
                }
            `}</style>
        </div>
    );
};

export default CircleBackground;