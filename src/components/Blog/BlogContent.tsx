import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useRef } from 'react';

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
	const { width: viewportWidthInPixels, height: viewportHeightInPixels } =
		useWindowSize();
	const { collapsedHeightPercent, columnWidthRem } = params;

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	const lanes =
		params.layoutMode === 'list'
			? 1
			: Math.max(
					1,
					Math.floor(viewportWidthInPixels / remInPixels / columnWidthRem)
				);
	const lanePercentage = 100 / lanes;

	const parentRef = useRef<HTMLDivElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: sortedFilteredPosts.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => (collapsedHeightRem + 5) * remInPixels,
		overscan: 3,
		lanes,
	});

	return (
		<div className="flex w-full justify-center px-0 py-8 md:px-8 lg:px-12">
			<div
				ref={parentRef}
				style={{
					width:
						params.layoutMode === 'list'
							? columnWidthRem * remInPixels
							: '100%',
					maxWidth: '100%',
				}}
			>
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{rowVirtualizer.getVirtualItems().map(virtualRow => {
						const post = sortedFilteredPosts[virtualRow.index];
						return (
							<div
								key={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								data-index={virtualRow.index}
								className="absolute top-0 will-change-transform"
								style={{
									left: `${virtualRow.lane * lanePercentage}%`,
									width: `calc(${lanePercentage}% - ${virtualRow.lane === lanes - 1 ? 0 : 1}rem)`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<div className="pb-4">
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
								</div>
							</div>
						);
					})}
				</div>
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
