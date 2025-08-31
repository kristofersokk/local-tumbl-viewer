import { useEffect, useState } from 'react';

const useTimer = (timerMs: number, cb?: () => void) => {
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCompleted(true);
			cb?.();
		}, timerMs);

		return () => clearTimeout(timer);
	}, [timerMs, cb]);

	return completed;
};

export default useTimer;
