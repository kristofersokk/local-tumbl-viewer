import { DOMAttributes, ReactNode } from 'react';

type CallbacksOnly<T> = {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	[K in keyof T as T[K] extends Function | undefined ? K : never]: T[K];
};

type DOMCallbacks = CallbacksOnly<DOMAttributes<HTMLElement>>;

const InterceptCallbacks = <C extends DOMCallbacks>(
	inputProps: DOMAttributes<HTMLElement> & {
		intercept: {
			[key in keyof C]: (
				prevCb: Exclude<C[key], undefined>,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				args: Parameters<Exclude<C[key], undefined>>
			) => void;
		};
		render: (props: C) => ReactNode;
	}
) => {
	const { render, intercept, ...rest } = inputProps;

	const interceptableProps = Object.keys(intercept) as (keyof C)[];
	const newProps = Object.fromEntries(
		interceptableProps.map(key => [
			key,
			rest[key as keyof DOMCallbacks]
				? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					(...args: Parameters<Exclude<C[key], undefined>>) => {
						const result = intercept[key](
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-expect-error
							rest[key as keyof DOMCallbacks],
							args
						);
						return result;
					}
				: undefined,
		])
	) as C;

	const props = {
		...rest,
		...newProps,
	};

	return render(props);
};

export default InterceptCallbacks;
