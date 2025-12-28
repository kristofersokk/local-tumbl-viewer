import throttle from 'lodash/throttle';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsMounted } from 'usehooks-ts';

import { CacheName, getCacheValue, storeCacheValue } from 'Utils/cacheUtils';

export interface ExpensiveComputation<D, R, S> {
	data: D | undefined;
	getInitialState: (data: D | undefined) => S;
	getStepCount?: (state: S) => number;
	executeSingleComputation: (state: S, setState: (s: S) => void) => void;
	isReady: (state: S) => boolean;
	getResult: (state: S) => R;
	isValid: (state: S) => boolean;
	batchSize?: number;
}

export interface ExpensiveComputationResult<TR> {
	isLoading: boolean;
	isError: boolean;
	progress?: {
		current: number;
		total: number;
	};
	data: TR | undefined;
}

const DEFAULT_BATCH_TIME_MS = 14; // Aim for ~60fps, so ~16ms per frame minus some overhead

const useExpensiveComputation = <I, R, S, TR = R>(
	{
		data,
		getInitialState,
		executeSingleComputation,
		getStepCount,
		isReady,
		getResult,
		isValid,
	}: ExpensiveComputation<I, R, S>,
	{
		enabled = true,
		batchTimeMs = DEFAULT_BATCH_TIME_MS,
		transform = result => result as unknown as TR,
		useCache,
	}: {
		enabled?: boolean;
		batchTimeMs?: number;
		transform?: (result: R) => TR;
		useCache?: {
			cacheName: CacheName;
			key: string;
		};
	} = {}
): ExpensiveComputationResult<TR> => {
	const state = useRef<S>(getInitialState(data));
	const transformRef = useRef(transform);
	const stepCountRef = useRef(0);
	const totalStepsRef = useRef(getStepCount?.(state.current) ?? 0);
	const isMounted = useIsMounted();

	useEffect(() => {
		transformRef.current = transform;
	}, [transform]);

	const [, rawRerender] = useState({});
	const rerender = useCallback(() => {
		rawRerender({});
	}, []);

	const throttledRerender = useMemo(() => throttle(rerender, 100), [rerender]);
	const incrementStepCount = useCallback(() => {
		stepCountRef.current++;
		throttledRerender();
	}, [throttledRerender]);

	const calculatedBatchSizeRef = useRef<number>(undefined);
	const startTimeRef = useRef<number>(0);
	const endTimeRef = useRef<number>(0);

	const executeRef = useRef<() => void>(() => {});
	const execute = useCallback(() => {
		if (calculatedBatchSizeRef.current) {
			const start = performance.now();
			for (let i = 0; i < calculatedBatchSizeRef.current; i++) {
				if (!isMounted()) {
					return;
				}
				if (isReady(state.current)) {
					break;
				}
				executeSingleComputation(state.current, newState => {
					state.current = newState;
				});
				incrementStepCount();
			}
			const end = performance.now();
			const elapsed = end - start;
			const newBatchSize = Math.max(
				1,
				Math.floor((calculatedBatchSizeRef.current * batchTimeMs) / elapsed)
			);
			calculatedBatchSizeRef.current = newBatchSize;
		} else {
			const start = performance.now();
			while (!isReady(state.current)) {
				if (!isMounted()) {
					return;
				}
				const now = performance.now();
				const elapsed = now - start;
				if (elapsed >= batchTimeMs) {
					const stepsDone = stepCountRef.current;
					const newBatchSize = Math.max(
						1,
						Math.floor((stepsDone * batchTimeMs) / elapsed)
					);
					calculatedBatchSizeRef.current = newBatchSize;
					break;
				}
				executeSingleComputation(state.current, newState => {
					state.current = newState;
				});
				incrementStepCount();
			}
		}

		if (isReady(state.current)) {
			endTimeRef.current = performance.now();
			console.log(
				`Computation finished in ${Math.round(
					endTimeRef.current - startTimeRef.current
				)} ms`
			);
		} else {
			setTimeout(() => executeRef.current(), 0);
		}
		rerender();
	}, [
		isReady,
		rerender,
		batchTimeMs,
		isMounted,
		executeSingleComputation,
		incrementStepCount,
	]);

	useEffect(() => {
		executeRef.current = execute;
	}, [execute]);

	const getInitialStateRef = useRef(getInitialState);
	useEffect(() => {
		getInitialStateRef.current = getInitialState;
	}, [getInitialState]);

	const getStepCountRef = useRef(getStepCount);
	useEffect(() => {
		getStepCountRef.current = getStepCount;
	}, [getStepCount]);

	const cachedValue = useCache
		? getCacheValue<ExpensiveComputationResult<TR>>(
				useCache.cacheName,
				useCache.key
			)
		: undefined;

	useEffect(() => {
		state.current = getInitialStateRef.current(data);
		if (data !== undefined && enabled && !cachedValue) {
			stepCountRef.current = 0;
			totalStepsRef.current = getStepCountRef.current?.(state.current) ?? 0;
			startTimeRef.current = performance.now();
			calculatedBatchSizeRef.current = undefined;
			executeRef.current();
		}
	}, [data, enabled, cachedValue]);

	const result = getResult(state.current);
	const transformedResult = useMemo(
		() => transformRef.current(result),
		[result]
	);

	const loading = enabled && !isReady(state.current);
	const error = enabled && !isValid(state.current);
	const progressStepCount = stepCountRef.current;
	const progressTotalSteps = totalStepsRef.current;
	const progress = useMemo(
		() =>
			enabled
				? {
						current: progressStepCount,
						total: progressTotalSteps,
					}
				: undefined,
		[enabled, progressStepCount, progressTotalSteps]
	);
	const returnData =
		isReady(state.current) && isValid(state.current)
			? transformedResult
			: undefined;

	const returnObj = useMemo(() => {
		return { isLoading: loading, isError: error, progress, data: returnData };
	}, [error, loading, progress, returnData]);

	if (useCache && isReady(state.current) && isValid(state.current)) {
		storeCacheValue(useCache.cacheName, useCache.key, returnObj);
	}

	return returnObj;
};

export default useExpensiveComputation;
