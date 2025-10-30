export function TypographyH1({ children }: { children: string }) {
    return (
        <h1 className="scroll-m-20 text-center text-5xl md:text-8xl font-bold tracking-tight text-balance">
            {children}
        </h1>
    );
}

export function TypographyH2({
    children,
    className,
}: {
    children: string;
    className?: string;
}) {
    return (
        <h1
            className={`scroll-m-20 text-3xl font-bold tracking-tighter text-balance text-[var(--dark-lime)] ${className}`}
        >
            {children}
        </h1>
    );
}

export function TypographyP({ children }: { children: string }) {
    return <p className="leading-7 [&:not(:first-child)]:mt-3">{children}</p>;
}
