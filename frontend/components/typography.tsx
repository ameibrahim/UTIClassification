export function TypographyH1({ children }: { children: string }) {
    return (
        <h1 className="scroll-m-20 text-center text-8xl font-bold tracking-tight text-balance">
            {children}
        </h1>
    );
}

export function TypographyP({ children }: { children: string }) {
    return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}
