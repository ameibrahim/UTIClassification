"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Brain, Home, Info } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/predict", label: "Predict", icon: <Brain /> },
    { href: "/about", label: "About", icon: <Info /> },
];

const activeLinkStyle =
    "bg-white hover:bg-white text-[var(--dark-lime)] hover:text-[var(--dark-lime)]";
const dormantLinkStyle =
    "bg-[var(--dark-lime)] hover:bg-[var(--lime-green)] text-white";

const Navbar = () => {
    const path = usePathname();

    return (
        <header className="pointer-events-auto fixed z-13 px-6 w-full">
            <nav
                style={{
                    backdropFilter: "blur(39px)",
                    WebkitBackdropFilter: "blur(39px)",
                    background: "#7D7D4270",
                }}
                className="mx-auto mt-6 flex w-[min(1000px,100%)] items-center justify-between rounded-full p-3"
            >
                <Link href={"/"}>
                    <Button
                        variant={"rounded"}
                        className={`${
                            path == "/" ? activeLinkStyle : dormantLinkStyle
                        } border-0`}
                    >
                        <Home />{" "}
                        <p
                            className={`${
                                path == "/" ? "block" : "hidden sm:block"
                            } `}
                        >
                            Home
                        </p>
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={"rounded"}
                                className={`${
                                    path == item.href
                                        ? activeLinkStyle
                                        : dormantLinkStyle
                                } border-0`}
                            >
                                {item.icon}
                                <p
                                    className={`${
                                        path == item.href
                                            ? "block"
                                            : "hidden sm:block"
                                    }`}
                                >
                                    {item.label}
                                </p>
                            </Button>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
