interface LadderCell {
    price: number;
    bidVolume: number;
    askVolume: number;
}

interface TimeBucket {
    startTime: Date;
    cells: LadderCell[];
}
