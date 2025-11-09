import { Masonry } from 'masonic';
import { memo } from 'react';

import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import { BlogEntry, CombinedBlogPost, ProcessedBlogPost } from 'Types/blog';

import BlogPost from './BlogPost';

interface BlogContentProps {
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	sortedFilteredPosts: CombinedBlogPost[];
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	imageUrlsCache: Record<
		string,
		{
			online?: string;
			local?: string;
		}
	>;
	generatedObjectUrls: string[];
	zoomInToPost: (postId: string) => void;
}

const BlogContent = ({
	blog,
	blogFiles,
	sortedFilteredPosts,
	addTagFilter,
	params,
	imageUrlsCache,
	generatedObjectUrls,
	zoomInToPost,
}: BlogContentProps) => {
	const remInPixels = useRemToPixels();
	const { height: viewportHeightInPixels } = useWindowSize();
	const { collapsedHeightPercent, columnWidthRem } = params;

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	return (
		<div className="flex w-full justify-center px-0 py-8 md:px-8 lg:px-12">
			<div
				style={{
					width:
						params.layoutMode === 'list'
							? columnWidthRem * remInPixels
							: '100%',
					maxWidth: '100%',
				}}
			>
				<Masonry
					key={blog.metadata.Name + sortedFilteredPosts.length}
					items={sortedFilteredPosts}
					render={({ data: post }) => (
						<BlogPost
							key={post.processed.id}
							blog={blog}
							post={post}
							blogFiles={blogFiles}
							addTagFilter={addTagFilter}
							params={params}
							imageUrlsCache={imageUrlsCache}
							generatedObjectUrls={generatedObjectUrls}
							zoomInToPost={zoomInToPost}
						/>
					)}
					maxColumnWidth={
						params.layoutMode === 'list'
							? columnWidthRem * remInPixels
							: undefined
					}
					columnCount={params.layoutMode === 'list' ? 1 : undefined}
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={columnWidthRem * remInPixels}
					itemHeightEstimate={(collapsedHeightRem + 5) * remInPixels}
					itemKey={({ processed: post }) => post.id || post.url || ''}
					scrollFps={12}
					overscanBy={3}
				/>
			</div>
		</div>
	);
};

const calculatePostsArrayId = (posts: { processed: ProcessedBlogPost }[]) => {
	return posts.map(post => post.processed.id).join(',');
};

export default memo(BlogContent, (prevProps, nextProps) => {
	return (
		prevProps.params === nextProps.params &&
		calculatePostsArrayId(prevProps.sortedFilteredPosts) ===
			calculatePostsArrayId(nextProps.sortedFilteredPosts)
	);
});
