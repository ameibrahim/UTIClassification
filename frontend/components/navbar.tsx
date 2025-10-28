import Link from "next/link";
import { Button } from "./ui/button";
import { Brain, Home, Info } from "lucide-react";

const navItems = [
    { href: "/predict", label: "Predict", icon: <Brain /> },
    { href: "/about", label: "About", icon: <Info /> },
];

const Navbar = () => {
    return (
        <header className="pointer-events-auto">
            <nav className="mx-auto mt-6 flex w-[min(960px,100%)] items-center justify-between rounded-full border-1  bg-[#7D7D42] p-3">
                <Button
                    variant={"rounded"}
                    // className="bg-[#a8a860] hover:bg-[#bbbb70] border-0 text-white"
                    className="bg-white hover:bg-white text-[var(--dark-lime)] hover:text-[var(--dark-lime)]"
                >
                    <Home /> Home
                </Button>
                <div className="flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={"rounded"}
                                className="bg-[#a8a860] hover:bg-[#bbbb70] text-white border-0"
                            >
                                {item.icon}
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
