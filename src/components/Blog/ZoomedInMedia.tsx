import classNames from 'classnames';
import ClickOutside from 'Components/ClickOutside';
import IconButton from 'Components/IconButton';
import { useEffect, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { getMediaViewTransitionName } from 'Utils/viewTransitionUtils';

type MediaItem = { name: string; type: 'image' | 'video' };

interface ZoomedInMediaProps {
	media: (MediaItem & { url: string }) | null;
	previousMedia?: MediaItem;
	nextMedia?: MediaItem;
	currentIndex?: number;
	total?: number;
	transformMediaUrl: (inputUrls: string | string[]) => Promise<{
		original: string;
		transformed: string;
	}>;
	selectMedia: (media: MediaItem) => void;
	previewTransitionMediaName?: string;
	outgoingTransitionMedia?: MediaItem & { url: string };
	dismissFromBackground: () => void;
	zoomOut: () => void;
}

const ZoomedInMedia = ({
	media,
	previousMedia,
	nextMedia,
	currentIndex,
	total,
	transformMediaUrl,
	selectMedia,
	previewTransitionMediaName,
	outgoingTransitionMedia,
	dismissFromBackground,
	zoomOut,
}: ZoomedInMediaProps) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const [isImageZoomed, setIsImageZoomed] = useState(false);
	const [adjacentUrls, setAdjacentUrls] = useState<{
		previous?: { name: string; url: string };
		next?: { name: string; url: string };
	}>({});

	useEffect(() => {
		if (!media) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case 'Escape':
					zoomOut();
					break;
				case 'ArrowLeft':
					if (!isImageZoomed && previousMedia) {
						event.preventDefault();
						selectMedia(previousMedia);
					}
					break;
				case 'ArrowRight':
					if (!isImageZoomed && nextMedia) {
						event.preventDefault();
						selectMedia(nextMedia);
					}
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isImageZoomed, media, nextMedia, previousMedia, selectMedia, zoomOut]);

	useEffect(() => {
		const resolveMedia = async (adjacentMedia: MediaItem | undefined) => {
			if (!adjacentMedia) {
				return undefined;
			}

			const { transformed, original } = await transformMediaUrl(
				adjacentMedia.name
			);
			return { name: adjacentMedia.name, url: transformed || original };
		};

		Promise.all([resolveMedia(previousMedia), resolveMedia(nextMedia)])
			.then(([previous, next]) => {
				setAdjacentUrls({ previous, next });
			})
			.catch((error: unknown) => {
				console.error('Error transforming adjacent media urls:', error);
			});
	}, [nextMedia, previousMedia, transformMediaUrl]);
	if (!media) {
		return null;
	}

	const isOutsideImage = (clientX: number, clientY: number) => {
		const image = imageRef.current;
		const bounds = image?.getBoundingClientRect();
		if (!image || !bounds) {
			return true;
		}

		const scale = Math.min(
			bounds.width / image.naturalWidth,
			bounds.height / image.naturalHeight
		);
		const renderedWidth = image.naturalWidth * scale;
		const renderedHeight = image.naturalHeight * scale;
		const left = bounds.left + (bounds.width - renderedWidth) / 2;
		const top = bounds.top + (bounds.height - renderedHeight) / 2;
		return (
			clientX < left ||
			clientX > left + renderedWidth ||
			clientY < top ||
			clientY > top + renderedHeight
		);
	};
	const previous = adjacentUrls.previous;
	const next = adjacentUrls.next;
	const previousUrl =
		previous?.name === previousMedia?.name
			? previous?.url
			: outgoingTransitionMedia?.name === previousMedia?.name
				? outgoingTransitionMedia?.url
				: undefined;
	const nextUrl =
		next?.name === nextMedia?.name
			? next?.url
			: outgoingTransitionMedia?.name === nextMedia?.name
				? outgoingTransitionMedia?.url
				: undefined;
	const isMediaSwitching = Boolean(
		previewTransitionMediaName || outgoingTransitionMedia
	);
	const previousViewTransitionName =
		!isMediaSwitching && previewTransitionMediaName === previousMedia?.name
			? getMediaViewTransitionName(previousMedia?.name ?? '')
			: undefined;
	const nextViewTransitionName =
		!isMediaSwitching && previewTransitionMediaName === nextMedia?.name
			? getMediaViewTransitionName(nextMedia?.name ?? '')
			: undefined;
	const navigateFromSwipe = (touch: { clientX: number; clientY: number }) => {
		if (isImageZoomed) {
			return;
		}

		const touchStart = touchStartRef.current;
		touchStartRef.current = null;
		if (!touchStart) {
			return;
		}

		const horizontalDistance = touch.clientX - touchStart.x;
		const verticalDistance = touch.clientY - touchStart.y;
		if (
			Math.abs(horizontalDistance) < 56 ||
			Math.abs(horizontalDistance) < Math.abs(verticalDistance)
		) {
			return;
		}

		if (horizontalDistance < 0 && nextMedia) {
			selectMedia(nextMedia);
		} else if (horizontalDistance > 0 && previousMedia) {
			selectMedia(previousMedia);
		}
	};
	return (
		<>
			<div
				className="z-zoomed-media fixed inset-0 select-none"
				// prevent clicks inside the zoomed media overlay from bubbling to the
				// zoomed post's click-outside listener and closing the post instead
				onMouseDown={event => event.stopPropagation()}
				onTouchStart={event => event.stopPropagation()}
			>
				<IconButton
					icon="close"
					iconProps={{ width: 32, height: 32 }}
					aria-label="Close media"
					onClick={zoomOut}
					className={classNames(
						'bg-control-bg/50 hover:bg-control-bg/80 absolute top-4 right-4',
						{
							'z-0': isImageZoomed,
							'z-10': !isImageZoomed,
						}
					)}
				/>
				{media.type === 'image' ? (
					<TransformWrapper
						key={media.name}
						minScale={1}
						maxScale={8}
						centerOnInit
						doubleClick={{ mode: 'toggle', step: 2 }}
						panning={{ disabled: !isImageZoomed }}
						pinch={{ allowPanning: isImageZoomed }}
						onTransform={(_, state) => {
							setIsImageZoomed(currentValue => {
								const nextValue = state.scale > 1.01;
								return currentValue === nextValue ? currentValue : nextValue;
							});
						}}
					>
						<TransformComponent
							wrapperClass="!h-full !w-full touch-none"
							contentClass="!flex !h-full !w-full items-center justify-center"
							wrapperProps={{
								onMouseDown: event => {
									if (isOutsideImage(event.clientX, event.clientY)) {
										event.preventDefault();
										event.stopPropagation();
										dismissFromBackground();
									}
								},
								onTouchStart: event => {
									const touch = event.touches[0];
									if (touch && isOutsideImage(touch.clientX, touch.clientY)) {
										event.preventDefault();
										event.stopPropagation();
										dismissFromBackground();
										return;
									}
									if (touch && event.touches.length === 1) {
										touchStartRef.current = {
											x: touch.clientX,
											y: touch.clientY,
										};
									}
								},
								onTouchEnd: event => {
									const touch = event.changedTouches[0];
									if (touch) {
										navigateFromSwipe(touch);
									}
								},
							}}
						>
							<img
								ref={imageRef}
								src={media.url}
								alt=""
								draggable={false}
								className="h-full max-h-[calc(100dvh-8rem)] w-full max-w-[100vw] object-contain sm:max-w-[calc(100vw-26rem)]"
								style={{
									viewTransitionName: isMediaSwitching
										? 'none'
										: getMediaViewTransitionName(media.name),
								}}
							/>
						</TransformComponent>
					</TransformWrapper>
				) : (
					<ClickOutside onClickOutside={zoomOut}>
						{ref => (
							<div
								className="flex h-full w-full items-center justify-center"
								onTouchStart={event => {
									const touch = event.touches[0];
									if (touch && event.touches.length === 1) {
										touchStartRef.current = {
											x: touch.clientX,
											y: touch.clientY,
										};
									}
								}}
								onTouchEnd={event => {
									const touch = event.changedTouches[0];
									if (touch) {
										navigateFromSwipe(touch);
									}
								}}
							>
								<div ref={ref as React.Ref<HTMLDivElement>}>
									<video
										src={media.url}
										className="h-full max-h-[calc(100dvh-8rem)] w-full max-w-[100vw] object-contain sm:max-w-[calc(100vw-26rem)]"
										controls
										autoPlay
									/>
								</div>
							</div>
						)}
					</ClickOutside>
				)}
				{!isImageZoomed && total !== undefined && total > 0 && (
					<div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
						{(currentIndex ?? 0) + 1} / {total}
					</div>
				)}
				{!isImageZoomed && (
					<>
						<div className="group pointer-events-none absolute inset-y-4 left-0 z-10 hidden w-[clamp(3rem,15vw,12rem)] -translate-x-1/4 items-center justify-start transition-transform duration-200 ease-out hover:translate-x-0 sm:flex">
							{previousUrl && (
								<button
									type="button"
									className="pointer-events-auto max-h-[72dvh] max-w-full cursor-w-resize"
									onClick={() => previousMedia && selectMedia(previousMedia)}
								>
									{previousMedia?.type === 'image' ? (
										<img
											src={previousUrl}
											alt=""
											draggable={false}
											className="max-h-[72dvh] max-w-full object-contain opacity-80"
											style={
												previousViewTransitionName
													? { viewTransitionName: previousViewTransitionName }
													: undefined
											}
										/>
									) : (
										<video
											src={previousUrl}
											className="max-h-[72dvh] max-w-full object-contain opacity-80"
											muted
											playsInline
											preload="metadata"
										/>
									)}
								</button>
							)}
						</div>
						<div className="group pointer-events-none absolute inset-y-4 right-0 z-10 hidden w-[clamp(3rem,15vw,12rem)] translate-x-1/4 items-center justify-end transition-transform duration-200 ease-out hover:translate-x-0 sm:flex">
							{nextUrl && (
								<button
									type="button"
									className="pointer-events-auto max-h-[72dvh] max-w-full cursor-e-resize"
									onClick={() => nextMedia && selectMedia(nextMedia)}
								>
									{nextMedia?.type === 'image' ? (
										<img
											src={nextUrl}
											alt=""
											draggable={false}
											className="max-h-[72dvh] max-w-full object-contain opacity-80"
											style={
												nextViewTransitionName
													? { viewTransitionName: nextViewTransitionName }
													: undefined
											}
										/>
									) : (
										<video
											src={nextUrl}
											className="max-h-[72dvh] max-w-full object-contain opacity-80"
											muted
											playsInline
											preload="metadata"
										/>
									)}
								</button>
							)}
						</div>
					</>
				)}
			</div>
			<div className="z-zoomed-media-backdrop fixed inset-0 backdrop-blur-xl backdrop-brightness-75" />
		</>
	);
};

export default ZoomedInMedia;
