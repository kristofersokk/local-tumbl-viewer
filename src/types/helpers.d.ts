type ValueOf<T> = T[keyof T];

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};
