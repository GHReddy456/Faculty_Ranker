interface PreviousState{
    index: number;
}

interface CachedTime {
  cachedTimeInEpoch: number;
}

const BASE_KEY = "previousState";
const mins_15 = 15 * 60 * 1000;

const getKey = (version?: string) =>
  version ? `${BASE_KEY}_${version}` : BASE_KEY;

export const savePreviousStateToLocalStorage = (state: PreviousState, version?: string) => {
    localStorage.setItem(getKey(version), JSON.stringify( { ...state, cachedTimeInEpoch: Date.now() } as CachedTime & PreviousState));
}

export const getPreviousStateFromLocalStorage = (version?: string): PreviousState | null => {
    const previousState = localStorage.getItem(getKey(version));
    if (!previousState) return null;
    const previousStateParsed = JSON.parse(previousState) as PreviousState & CachedTime;
    const timestamp = previousStateParsed.cachedTimeInEpoch;
    if (Date.now() - timestamp > mins_15) {
      localStorage.removeItem(getKey(version));
      return null;
    }
    return previousStateParsed;
}
