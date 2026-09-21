import UnsafeContent from 'Components/UnsafeContent';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import useTransformMediaUrl from 'Hooks/useTransformMediaUrl';
import { useMemo } from 'react';
import { BlogEntry } from 'Types/blog';
import { getBlogPostProcessors } from 'Utils/blogPostUtils';
import { getMediaViewTransitionName } from 'Utils/viewTransitionUtils';

interface BlogPostMediaItemProps {
	blog: BlogEntry;
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	media: { name: string; type: 'image' | 'video' };
	params: BlogDeferredParams;
	zoomInToMedia: (media: { name: string; type: 'image' | 'video' }) => void;
	isZoomedIn: boolean;
	isTransitioning: boolean;
	onLoad?: () => void;
}

const BlogPostMediaItem = ({
	blog,
	blogFiles,
	media,
	params,
	zoomInToMedia,
	isZoomedIn,
	isTransitioning,
	onLoad,
}: BlogPostMediaItemProps) => {
	const { fallbackToOnlineMedia } = params;

	const {
		fileEntries: { Entries: imgMappingEntries },
	} = blog;

	const { Name: blogName } = blog.metadata;

	const transformMediaUrl = useTransformMediaUrl({
		fallbackToOnlineMedia,
		imgMappingEntries,
		blogFiles,
		blogName,
	});

	const blogPostProcessors = useMemo(
		() => getBlogPostProcessors(transformMediaUrl),
		[transformMediaUrl]
	);

	return (
		<div
			className="relative aspect-square h-0 w-full cursor-nesw-resize pb-[100%] transition-transform duration-150 ease-in-out hover:scale-[0.98]"
			onClick={() => {
				zoomInToMedia(media);
			}}
		>
			<UnsafeContent
				domProcessors={blogPostProcessors}
				className="absolute top-0 left-0 h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
				style={
					media.type === 'image' && isTransitioning && !isZoomedIn
						? { viewTransitionName: getMediaViewTransitionName(media.name) }
						: undefined
				}
				content={
					media.type === 'image'
						? `<img data-src="${media.name}" />`
						: `<video data-src="${media.name}" />`
				}
				onLoad={onLoad}
			/>
		</div>
	);
};

export default BlogPostMediaItem;
