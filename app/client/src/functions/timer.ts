export const delay = async (ms: number) => await new Promise(r => setTimeout(r, ms));

export const throttle = (callback: () => void, ms: number) => {
    let lastTimestamp = -Infinity;
    return () => {
        const now = Date.now();
        if (now - lastTimestamp < ms) return;
        lastTimestamp = now;
        callback();
    };
};
