import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useRef, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import Loader from 'Components/Loader';
import Center from 'Components/utils/Center';
import useBlogFiles from 'Hooks/api/useBlogFiles';
import useBlogPosts from 'Hooks/api/useBlogPosts';
import useRootFolders from 'Hooks/api/useRootFolders';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { ExpensiveComputationResult } from 'Hooks/useExpensiveComputation';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import {
	BlogEntry,
	CombinedBlogPost,
	ProcessedBlogPost,
	RawBlogPost,
} from 'Types/blog';
import { getBlogFolderName } from 'Utils/blogUtils';

import BlogPost from './BlogPost';
import BlogPostMediaItem from './BlogPostMediaItem';

interface BlogContentProps {
	blog: BlogEntry;
	sortedFilteredPosts: CombinedBlogPost[];
	sortedMedia: {
		name: string;
		type: 'image' | 'video';
		post: CombinedBlogPost;
	}[];
	managedPostsComputation: ExpensiveComputationResult<
		{
			stringified: string;
			raw: RawBlogPost;
			processed: ProcessedBlogPost;
		}[]
	>;
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	zoomInToPost: (postId: string) => void;
	blogKey: number;
}

const BlogContent = ({
	blog,
	sortedFilteredPosts,
	sortedMedia,
	managedPostsComputation,
	addTagFilter,
	params,
	zoomInToPost,
	blogKey,
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

	const postsGap = 16;
	const mediaGap = 8;

	const parentRef = useRef<HTMLDivElement>(null);
	const postVirtualizer = useVirtualizer({
		count: sortedFilteredPosts.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => (collapsedHeightRem + 5) * remInPixels,
		overscan: 20,
		lanes,
		gap: postsGap,
	});

	const mediaVirtualizer = useVirtualizer({
		count: sortedMedia.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => columnWidthRem * remInPixels + mediaGap,
		overscan: 5,
		lanes,
		gap: mediaGap,
	});

	const elementsRef = useRef<Map<string, Element | null>>(new Map());

	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const blogFolderName = getBlogFolderName(blog?.metadata);
	const blogFolderHandle = folders?.find(
		folder => folder.name === blogFolderName
	);
	const { data: blogFiles, isFetching: isFetchingBlogFiles } =
		useBlogFiles(blogFolderHandle);

	const {
		foundBlogPostsFiles,
		query: { data: blogPosts, isFetching: isFetchingBlogPosts },
	} = useBlogPosts(blog, blogFolderHandle, blogFiles);

	const { isLoading: isLoadingManagedPosts, progress: managedPostsProgress } =
		managedPostsComputation;

	const isFetching =
		isFetchingRootFolders ||
		isFetchingBlogFiles ||
		isFetchingBlogPosts ||
		isLoadingManagedPosts;

	const [showLoadingDescription, setShowLoadingDescription] = useState(false);

	useTimeout(() => {
		setShowLoadingDescription(true);
	}, 1000);

	if (isFetching || !blogFiles || !blogPosts) {
		return (
			<Center className="relative flex flex-col gap-4">
				<Loader
					type="pacman"
					size={60}
					{...(showLoadingDescription
						? isFetchingRootFolders
							? { text: 'Loading root folders' }
							: isFetchingBlogFiles
								? { text: 'Loading blog files' }
								: isLoadingManagedPosts
									? {
											text: `Processing managed posts`,
											progress: managedPostsProgress,
										}
									: { text: 'Loading blog posts' }
						: undefined)}
				/>
			</Center>
		);
	}

	const error =
		!blog || !blogFiles
			? "Blog doesn't have a folder for files, try another"
			: !foundBlogPostsFiles.length
				? "Blog doesn't have any post files, try another"
				: !blogPosts?.length
					? "Blog doesn't have any posts, try another"
					: undefined;

	if (error) {
		return (
			<Center className="flex-col gap-6">
				<p>{error}</p>
			</Center>
		);
	}

	const virtualizer =
		params.layoutMode === 'media' ? mediaVirtualizer : postVirtualizer;

	return (
		<div className="flex h-[calc(100dvh-4rem)] w-full justify-center">
			<div
				ref={parentRef}
				className="h-full max-w-full overflow-auto px-0 py-8 md:px-8 lg:px-12"
				style={{
					width:
						params.layoutMode === 'list' &&
						screen.orientation.type.includes('landscape')
							? columnWidthRem * remInPixels
							: '100%',
				}}
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{params.layoutMode !== 'media' &&
						postVirtualizer.getVirtualItems().map(virtualRow => {
							const post = sortedFilteredPosts[virtualRow.index];
							const postId = post.processed.id ?? '';
							return (
								<div
									key={post.processed.id}
									ref={el => {
										elementsRef.current.set(postId, el);
									}}
									data-index={virtualRow.index}
									className="absolute top-0 will-change-transform"
									style={{
										left: `calc(${virtualRow.lane} * (100% + ${postsGap}px) / ${lanes})`,
										width: `calc((100% + ${postsGap}px) / ${lanes} - ${postsGap}px)`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
								>
									<BlogPost
										key={post.processed.id}
										blog={blog}
										post={post}
										blogFiles={blogFiles}
										addTagFilter={addTagFilter}
										params={params}
										zoomInToPost={zoomInToPost}
										blogKey={blogKey}
										onLoad={() => {
											setTimeout(() => {
												postVirtualizer.measureElement(
													elementsRef.current.get(postId) ?? null
												);
											}, 100);
										}}
									/>
								</div>
							);
						})}
					{params.layoutMode === 'media' &&
						mediaVirtualizer.getVirtualItems().map(virtualRow => {
							const media = sortedMedia[virtualRow.index];
							return (
								<div
									key={media.name}
									ref={el => {
										elementsRef.current.set(media.name, el);
									}}
									data-index={virtualRow.index}
									className="absolute top-0 will-change-transform"
									style={{
										left: `calc(${virtualRow.lane} * (100% + ${mediaGap}px) / ${lanes})`,
										width: `calc((100% + ${mediaGap}px) / ${lanes} - ${mediaGap}px)`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
								>
									<BlogPostMediaItem
										key={media.name}
										blog={blog}
										blogFiles={blogFiles}
										post={media.post}
										media={media}
										params={params}
										zoomInToPost={zoomInToPost}
										onLoad={() => {
											const el = elementsRef.current.get(media.name);
											if (el) {
												mediaVirtualizer.measureElement(el);
											}
										}}
									/>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default memo(BlogContent, (prevProps, nextProps) => {
	return (
		prevProps.params === nextProps.params &&
		prevProps.blogKey === nextProps.blogKey &&
		prevProps.sortedFilteredPosts === nextProps.sortedFilteredPosts &&
		prevProps.sortedMedia === nextProps.sortedMedia &&
		prevProps.managedPostsComputation === nextProps.managedPostsComputation
	);
});
