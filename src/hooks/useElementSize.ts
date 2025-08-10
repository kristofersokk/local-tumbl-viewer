import { RefObject, useEffect, useState } from 'react';

const useElementSize = (ref: RefObject<HTMLDivElement | null>) => {
	const [size, setSize] = useState({
		width: 0,
		height: 0,
		scrollWidth: 0,
		scrollHeight: 0,
	});

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const updateSize = () => {
			setSize({
				width: element.offsetWidth,
				height: element.offsetHeight,
				scrollWidth: element.scrollWidth,
				scrollHeight: element.scrollHeight,
			});
		};

		updateSize();
		window.addEventListener('resize', updateSize);
		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(element);

		return () => {
			window.removeEventListener('resize', updateSize);
			resizeObserver.disconnect();
		};
	}, [ref]);

	return size;
};

export default useElementSize;
