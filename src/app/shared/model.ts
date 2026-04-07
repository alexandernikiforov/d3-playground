interface LadderCell {
    price: number;
    bidVolume: number;
    askVolume: number;
}

interface TimeBucket {
    startTime: Date;
    open: number;
    close: number;
    cells: LadderCell[];
}
