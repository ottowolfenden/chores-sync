const checkAccess = async (
    guess?: string,
    checkName: boolean = true
): Promise<boolean> => {
    if (location.host == "127.0.0.1:3000")
        return localStorage.getItem("name") != undefined || !checkName;
    guess ??= localStorage.getItem("login-secret") ?? undefined;
    return (
        guess != undefined &&
        (localStorage.getItem("name") != undefined || !checkName) &&
        (
            await fetch("/api/dist/check-secret", {
                headers: { "X-Login-Secret": guess }
            })
        ).status == 200
    );
};

export { checkAccess };
