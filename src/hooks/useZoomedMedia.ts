import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { withViewTransition } from 'Utils/viewTransitionUtils';

interface ZoomedMedia {
	name: string;
	type: 'image' | 'video';
	url: string;
}

// Manages the zoomed-in media state and its enter/exit view transitions.
const useZoomedMedia = ({
	zoomedMediaName,
	sortedMedia,
	transformMediaUrl,
	zoomToMedia,
	navigateOutOfMedia,
}: {
	zoomedMediaName: string | undefined;
	sortedMedia: { name: string; type: 'image' | 'video' }[];
	transformMediaUrl: (
		mediaName: string
	) => Promise<{ transformed: string; original: string }>;
	zoomToMedia: (mediaName: string) => void;
	navigateOutOfMedia: () => void;
}) => {
	const [zoomedInMedia, setZoomedInMedia] = useState<ZoomedMedia | null>(null);
	const [transitioningMediaName, setTransitioningMediaName] = useState<
		string | null
	>(null);
	const [previewTransitionMediaName, setPreviewTransitionMediaName] = useState<
		string | null
	>(null);
	const [outgoingTransitionMedia, setOutgoingTransitionMedia] =
		useState<ZoomedMedia | null>(null);
	const mediaNavigationVersionRef = useRef(0);

	const adjacentMedia = useMemo(() => {
		if (!zoomedInMedia) {
			return {};
		}

		const currentIndex = sortedMedia.findIndex(
			media => media.name === zoomedInMedia.name
		);
		return {
			previousMedia: sortedMedia[currentIndex - 1],
			nextMedia: sortedMedia[currentIndex + 1],
			currentIndex,
			total: sortedMedia.length,
		};
	}, [sortedMedia, zoomedInMedia]);

	const zoomInToMedia = useCallback(
		(media: { name: string; type: 'image' | 'video' }) => {
			zoomToMedia(media.name);
		},
		[zoomToMedia]
	);

	useEffect(() => {
		const navigationVersion = ++mediaNavigationVersionRef.current;

		if (!zoomedMediaName) {
			if (!zoomedInMedia) {
				return;
			}
			const closingMedia = zoomedInMedia;
			const transition = withViewTransition(() => {
				setZoomedInMedia(null);
				setTransitioningMediaName(closingMedia.name);
			});
			void transition?.finished.finally(() => {
				if (navigationVersion !== mediaNavigationVersionRef.current) {
					return;
				}
				setTransitioningMediaName(null);
			});
			return;
		}

		if (zoomedInMedia?.name === zoomedMediaName) {
			return;
		}

		const mediaMeta = sortedMedia.find(media => media.name === zoomedMediaName);
		const type = mediaMeta?.type ?? zoomedInMedia?.type ?? 'image';
		const outgoingMedia = zoomedInMedia;

		transformMediaUrl(zoomedMediaName)
			.then(({ transformed, original }) => {
				if (navigationVersion !== mediaNavigationVersionRef.current) {
					return;
				}
				const newMedia = {
					name: zoomedMediaName,
					type,
					url: transformed || original,
				};

				if (!outgoingMedia) {
					flushSync(() => {
						setTransitioningMediaName(zoomedMediaName);
					});
					const transition = withViewTransition(() => {
						setZoomedInMedia(newMedia);
					});
					void transition?.finished.finally(() => {
						if (navigationVersion !== mediaNavigationVersionRef.current) {
							return;
						}
						setTransitioningMediaName(null);
					});
					return;
				}

				flushSync(() => {
					setOutgoingTransitionMedia(null);
					setPreviewTransitionMediaName(zoomedMediaName);
				});
				const transition = withViewTransition(() => {
					setOutgoingTransitionMedia(outgoingMedia);
					setZoomedInMedia(newMedia);
				});
				const cleanup = () => {
					if (navigationVersion !== mediaNavigationVersionRef.current) {
						return;
					}
					setPreviewTransitionMediaName(null);
					setOutgoingTransitionMedia(null);
				};
				if (transition) {
					void transition.finished.finally(cleanup);
				} else {
					cleanup();
				}
			})
			.catch((error: unknown) => {
				console.error('Error transforming media url:', error);
			});
	}, [zoomedMediaName, zoomedInMedia, sortedMedia, transformMediaUrl]);

	const zoomOutOfMedia = useCallback(() => {
		if (!zoomedInMedia) {
			return;
		}
		navigateOutOfMedia();
	}, [zoomedInMedia, navigateOutOfMedia]);

	const dismissMediaFromBackground = useCallback(() => {
		const blockFollowUpInput = (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
		};
		const removeInputGuard = () => {
			document.removeEventListener('mousedown', blockFollowUpInput, true);
			document.removeEventListener('touchstart', blockFollowUpInput, true);
			document.removeEventListener('click', blockFollowUpInput, true);
		};

		document.addEventListener('mousedown', blockFollowUpInput, true);
		document.addEventListener('touchstart', blockFollowUpInput, true);
		document.addEventListener('click', blockFollowUpInput, true);
		window.setTimeout(removeInputGuard, 500);
		zoomOutOfMedia();
	}, [zoomOutOfMedia]);

	return {
		zoomedInMedia,
		adjacentMedia,
		transitioningMediaName,
		previewTransitionMediaName,
		outgoingTransitionMedia,
		zoomInToMedia,
		zoomOutOfMedia,
		dismissMediaFromBackground,
	};
};

export default useZoomedMedia;
