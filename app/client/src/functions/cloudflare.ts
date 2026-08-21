export const checkAccess = async (
    guess?: string,
    checkName: boolean = true
): Promise<boolean> => {
    guess ??= localStorage.getItem("secret") ?? undefined;
    if (guess == undefined || (localStorage.getItem("name") == undefined && checkName))
        return false;
    const response = await fetch("/api/check-secret", {
        headers: { "Authorization": guess }
    });
    const data: { message?: string } = await response.json();
    return data?.message == "authenticated" && response.ok;
};
