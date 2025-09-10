import { useEffect, useState } from 'react';
import { get, set } from '@lib/idb';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

export const usePersistentState = <T>(key: string, defaultValue: T): [T, SetValue<T>] => {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const idbValue = await get<T>(key);
        if (idbValue !== undefined && isMounted) {
          setValue(idbValue);
          return;
        }
        const lsValue = localStorage.getItem(key);
        if (lsValue !== null && isMounted) {
          setValue(JSON.parse(lsValue));
          return;
        }
      } catch (e) {
        console.error(`Failed to load state for ${key}`, e);
      }
      if (isMounted) setValue(defaultValue);
    };
    load();
    return () => { isMounted = false; };
  }, [key]);

  useEffect(() => {
    if (value === defaultValue && localStorage.getItem(key) === null) return;
    const save = async () => {
      try {
        await set(key, value);
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to save state for ${key}`, e);
      }
    };
    save();
  }, [key, value, defaultValue]);

  return [value, setValue];
};

