export const getRandInt = (min: number, max: number) =>
    Math.floor(Math.random() * (Math.floor(max + 1) - Math.ceil(min)) + Math.ceil(min));

export const getRandFrom = <T>(array: T[]) => array[getRandInt(0, array.length - 1)];

export const getRandsFrom = <T>(array: T[], n: number) => {
    let clone = structuredClone(array);
    let result = [];
    for (let i = 0; i < n; i++) {
        const item = getRandFrom(clone);
        if (!item) throw new Error("insufficient items");
        clone.splice(clone.indexOf(item), 1);
        result.push(item);
    }
    return result;
};

export const shuffle = <T>(array: T[]) => {
    let clone = structuredClone(array);
    let i = clone.length;
    while (i > 0) {
        let randIndex = getRandInt(0, clone.length - 1);
        i--;
        [clone[i], clone[randIndex]] = [clone[randIndex]!, clone[i]!];
    }
    return clone;
};
