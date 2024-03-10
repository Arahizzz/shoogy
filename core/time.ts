const roundTo = (roundTo: number) => (x: number) => Math.round(x / roundTo) * roundTo;

export const tickResolution = 5;
export const roundToTickResolution = roundTo(tickResolution);
export const tickToTime = (tick: number) => tick * 60_000;
export const timeToTick = (time: number) => roundToTickResolution(time / 60_000);
export const incrementTick = (tick: number, times = 1) => tick + times * tickResolution;
export const decrementTick = (tick: number, times = 1) => tick - times * tickResolution;
export const getCurrentTick = () => timeToTick(Date.now());
