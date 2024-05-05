export const tickResolutionMinutes = 5;
export const milliSecondsPerTick = tickResolutionMinutes * 60 * 1000;
export const tickToTime = (tick: number) => tick * milliSecondsPerTick;
export const timeToTick = (time: number) => Math.round(time / milliSecondsPerTick);
export const incrementTick = (tick: number, times = 1) => tick + times;
export const decrementTick = (tick: number, times = 1) => tick - times;
export const getCurrentTick = () => timeToTick(Date.now());
