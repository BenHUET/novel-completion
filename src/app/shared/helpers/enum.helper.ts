// from https://stackoverflow.com/a/79180882
type Enum = Record<string, number | string>;

type EnumIteratorCallback<T> = (value: T, key?: string) => void;

export function enumIterator<T>(
  e: Enum,
  callback: EnumIteratorCallback<T>,
): void {
  const keys = Object.keys(e).filter((k) => isNaN(Number(k)));
  for (const key of keys) {
    callback(e[key] as T, key);
  }
}
