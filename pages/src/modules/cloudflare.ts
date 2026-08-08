const checkSecret = async (guess?: string): Promise<boolean> => {
    guess ??= localStorage.getItem("login-secret") ?? undefined;
    return (
        guess != undefined &&
        (
            await fetch("/api/dist/check-secret", {
                headers: { "X-Login-Secret": guess }
            })
        ).status == 200
    );
};

export { checkSecret };
