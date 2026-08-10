const checkAccess = async (
    guess?: string,
    checkName: boolean = true
): Promise<boolean> => {
    guess ??= localStorage.getItem("login-secret") ?? undefined;
    return (
        guess != undefined &&
        (localStorage.getItem("name") != undefined || !checkName) &&
        (
            await fetch("/api/check-secret", {
                headers: { "X-Login-Secret": guess }
            })
        ).status == 200
    );
};

export { checkAccess };
