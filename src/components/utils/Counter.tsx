interface CounterProps {
	top?: number;
	left?: number;
	count: number | undefined;
}

const Counter = ({ count, top = 16, left = 16 }: CounterProps) => {
	if (count === undefined) return null;

	return (
		<span
			className="bg-counter absolute size-4 translate-1/2 rounded-full text-xs text-white"
			style={{ top, left }}
		>
			{count}
		</span>
	);
};

export default Counter;
