import { useCallback, useEffect, useRef, useState } from "react";

//const debouncedSearch = useDebounce(search, 300)
export function useDebounce<T>(value: T, delay = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = window.setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			window.clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

//const [searchDebounced, cancel] = useDebouncedCallback((q) => doSearch(q), 300)
export function useDebouncedCallback<Fn extends (...args: any[]) => any>(
	fn: Fn,
	delay = 300
) {
	const timeoutRef = useRef<number | undefined>(undefined);
	const latestFn = useRef<Fn>(fn);

	// keep latest function reference
	useEffect(() => {
		latestFn.current = fn;
	}, [fn]);

	const cancel = useCallback(() => {
		if (timeoutRef.current !== undefined) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = undefined;
		}
	}, []);

	const debounced = useCallback(
		(...args: Parameters<Fn>) => {
			cancel();
			timeoutRef.current = window.setTimeout(() => {
				latestFn.current(...args);
			}, delay);
		},
		[cancel, delay]
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => cancel();
	}, [cancel]);

	return [debounced, cancel] as const;
}

export default useDebounce;
