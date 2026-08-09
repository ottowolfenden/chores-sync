const checkAccess = async (guess, checkName = true) => {
    if (location.host == "127.0.0.1:3000")
        return localStorage.getItem("name") != undefined || !checkName;
    guess ??= localStorage.getItem("login-secret") ?? undefined;
    return (guess != undefined &&
        (localStorage.getItem("name") != undefined || !checkName) &&
        (await fetch("/api/dist/check-secret", {
            headers: { "X-Login-Secret": guess }
        })).status == 200);
};
export { checkAccess };
//# sourceMappingURL=cloudflare.js.map