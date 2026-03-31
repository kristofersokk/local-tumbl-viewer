import UnsafeContent from 'Components/UnsafeContent';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import useTransformMediaUrl from 'Hooks/useTransformMediaUrl';
import { useMemo } from 'react';
import { BlogEntry, CombinedBlogPost } from 'Types/blog';
import { getBlogPostProcessors } from 'Utils/blogPostUtils';

interface BlogPostMediaItemProps {
	blog: BlogEntry;
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	post: CombinedBlogPost;
	media: { name: string; type: 'image' | 'video' };
	params: BlogDeferredParams;
	zoomInToPost?: (postId: string) => void;
	onLoad?: () => void;
}

const BlogPostMediaItem = ({
	blog,
	blogFiles,
	post,
	media,
	params,
	zoomInToPost,
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
				if (post.processed.id) {
					zoomInToPost?.(post.processed.id);
				}
			}}
		>
			<UnsafeContent
				domProcessors={blogPostProcessors}
				className="absolute top-0 left-0 h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
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
