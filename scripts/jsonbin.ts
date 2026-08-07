const binId = "6a75f311f5f4af5e29f80b3e";

const get = async (accessor?: string): Promise<string | null> => {
    const accessKey = localStorage.getItem("access-key");
    if (!accessKey) return null;

    const headers: Record<string, string> = {
        "X-Access-Key": accessKey,
        "X-Bin-Meta": "false"
    };
    if (accessor) headers["X-JSON-Path"] = accessor;
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        method: "GET",
        headers: headers
    });

    if (!response.ok) return null;
    let text = await response.text();
    console.log(text);
    return text;
};

export { get };
