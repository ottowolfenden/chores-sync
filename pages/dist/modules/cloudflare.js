const checkSecret = async (guess) => {
    if (location.host == "127.0.0.1:3000")
        return true;
    guess ??= localStorage.getItem("login-secret") ?? undefined;
    return (guess != undefined &&
        (await fetch("/api/dist/check-secret", {
            headers: { "X-Login-Secret": guess }
        })).status == 200);
};
export { checkSecret };
//# sourceMappingURL=cloudflare.js.map