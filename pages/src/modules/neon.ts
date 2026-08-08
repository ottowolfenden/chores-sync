const get = async (): Promise<void> => {
    await new Promise(r => setTimeout(r, 2000));
    console.log("finished");
};

export { get };
