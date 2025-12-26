import { ExpensiveComputation } from 'Hooks/useExpensiveComputation';

export const expensiveMap = <D, R>(
	data: D[] | undefined,
	mapFn: (item: D, index: number, array: D[]) => R,
	batchSize = 1
): ExpensiveComputation<
	D[],
	R[],
	{
		data: D[];
		result: R[];
		computationsDone: number;
		isValid: boolean;
	}
> => ({
	data,
	getInitialState: data => ({
		data: data || [],
		result: [],
		computationsDone: 0,
		isValid: !!data,
	}),
	getStepCount: state => state.data?.length ?? 0,
	executeSingleComputation: (state, setState) => {
		const { data, result, computationsDone } = state;
		if (computationsDone < data.length) {
			const newResult = mapFn(data[computationsDone], computationsDone, data);
			setState({
				data,
				result: [...result, newResult],
				computationsDone: computationsDone + 1,
				isValid: state.isValid,
			});
		}
	},
	isReady: state => state.computationsDone >= state.data.length,
	getResult: state => state.result,
	isValid: state => state.isValid,
	batchSize,
});
