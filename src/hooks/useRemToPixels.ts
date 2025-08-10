import { useEffect, useState } from 'react';

/**
 * Custom hook to get the current size of 1 rem in pixels.
 * Listens to changes in the computed font-size of the root HTML element.
 *
 * @returns {number} The current size of 1 rem in pixels.
 */
function useRemToPixels(): number {
	const [remInPixels, setRemInPixels] = useState<number>(16); // Default to 16px

	useEffect(() => {
		const getRemValue = () => {
			// Get the computed font-size of the root HTML element
			// This is the basis for the 'rem' unit
			const htmlFontSize = parseFloat(
				getComputedStyle(document.documentElement).fontSize
			);
			setRemInPixels(htmlFontSize);
		};

		// Initial calculation
		getRemValue();

		// Set up a listener for window resize events
		// This is because a user might change their browser's default font size,
		// or zoom levels can affect the computed font size.
		window.addEventListener('resize', getRemValue);

		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener('resize', getRemValue);
		};
	}, []);

	return remInPixels;
}

export default useRemToPixels;
