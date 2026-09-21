import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CombinedBlogPost } from 'Types/blog';

import { withViewTransition } from 'Utils/viewTransitionUtils';

interface ZoomedMedia {
	name: string;
	type: 'image' | 'video';
	index: number;
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
	sortedMedia: {
		name: string;
		type: 'image' | 'video';
		post: CombinedBlogPost;
	}[];
	transformMediaUrl: (mediaName: string) => Promise<{
		original: string;
		transformed: string;
		localFileNames?: string[];
	}>;
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

		return {
			previousMedia: sortedMedia[zoomedInMedia.index - 1],
			nextMedia: sortedMedia[zoomedInMedia.index + 1],
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

		transformMediaUrl(zoomedMediaName)
			.then(({ transformed, original, localFileNames }) => {
				if (navigationVersion !== mediaNavigationVersionRef.current) {
					return;
				}

				console.log('Local file names:', localFileNames);
				const mediaIndex = sortedMedia.findIndex(media =>
					localFileNames?.includes(media.name)
				);
				const mediaMeta = sortedMedia[mediaIndex];
				const type = mediaMeta?.type ?? zoomedInMedia?.type ?? 'image';
				const outgoingMedia = zoomedInMedia;

				const newMedia = {
					name: zoomedMediaName,
					index: mediaIndex,
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
