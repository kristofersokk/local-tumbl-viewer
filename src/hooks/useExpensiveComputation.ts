import { useCallback, useEffect, useRef, useState } from 'react';

export interface ExpensiveComputation<D, R, S> {
	data: D | undefined;
	getInitialState: (data: D | undefined) => S;
	executeSingleComputation: (state: S, setState: (s: S) => void) => void;
	isReady: (state: S) => boolean;
	getResult: (state: S) => R | undefined;
	isValid: (state: S) => boolean;
	batchSize?: number;
}

const useExpensiveComputation = <I, R, S>({
	data,
	getInitialState,
	executeSingleComputation,
	isReady,
	getResult,
	isValid,
	batchSize = 1,
}: ExpensiveComputation<I, R, S>) => {
	const state = useRef<S>(getInitialState(data));

	const [, rawRerender] = useState({});
	const rerender = useCallback(() => {
		rawRerender({});
	}, []);

	const executeRef = useRef<() => void>(() => {});
	const execute = useCallback(() => {
		for (let i = 0; i < batchSize; i++) {
			if (isReady(state.current)) {
				break;
			}
			executeSingleComputation(state.current, newState => {
				state.current = newState;
			});
		}
		if (!isReady(state.current)) {
			setTimeout(() => executeRef.current(), 0);
		}
		if (isReady(state.current)) {
			rerender();
		}
	}, [batchSize, executeSingleComputation, isReady, rerender]);

	useEffect(() => {
		executeRef.current = execute;
	}, [execute]);

	useEffect(() => {
		state.current = getInitialState(data);
		if (data !== undefined) {
			executeRef.current();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return isReady(state.current) && isValid(state.current)
		? getResult(state.current)
		: undefined;
};

export default useExpensiveComputation;
