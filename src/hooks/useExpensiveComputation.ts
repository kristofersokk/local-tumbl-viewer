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

const DEBUG = true;

const useExpensiveComputation = <I, R, S, TR = R>(
	{
		data,
		getInitialState,
		executeSingleComputation,
		getStepCount,
		isReady,
		getResult,
		isValid,
		batchSize = 1,
	}: ExpensiveComputation<I, R, S>,
	{
		enabled = true,
		transform = result => result as unknown as TR,
		useCache,
	}: {
		enabled?: boolean;
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

	const executeRef = useRef<() => void>(() => {});
	const execute = useCallback(() => {
		for (let i = 0; i < batchSize; i++) {
			if (!isMounted()) {
				return;
			}
			if (isReady(state.current)) {
				break;
			}
			executeSingleComputation(state.current, newState => {
				state.current = newState;
			});
			stepCountRef.current++;
		}
		if (DEBUG) {
			console.log(
				`Progress: ${stepCountRef.current} / ${totalStepsRef.current}`
			);
		}
		if (!isReady(state.current)) {
			setTimeout(() => executeRef.current(), 0);
		}
		rerender();
	}, [batchSize, isMounted, executeSingleComputation, isReady, rerender]);

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
