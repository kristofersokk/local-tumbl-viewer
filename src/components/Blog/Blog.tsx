import { useRegisterSW } from 'virtual:pwa-register/react';

import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import useBlogReload from 'Hooks/useBlogReload';
import useProcessedBlogPosts from 'Hooks/useProcessedBlogPosts';
import useZoomedMedia from 'Hooks/useZoomedMedia';
import { BlogEntry } from 'Types/blog';

import BlogContent from './BlogContent';
import BlogFiltering from './BlogFiltering';
import BlogSettings from './BlogSettings';
import PlatformLogo from './PlatformLogo';
import ZoomedInMedia from './ZoomedInMedia';
import ZoomedInPost from './ZoomedInPost';
import HeaderPill from '../HeaderPill';
import ThemeToggle from '../ThemeToggle';

interface BlogProps {
	blog: BlogEntry;
	goToBlogSelection: () => void;
	zoomedPostId: string | undefined;
	zoomedMediaName: string | undefined;
	zoomToPost: (postId: string) => void;
	zoomOutOfPost: () => void;
	zoomToMedia: (mediaName: string) => void;
	zoomOutOfMedia: () => void;
}

const Blog = ({
	blog,
	goToBlogSelection,
	zoomedPostId,
	zoomedMediaName,
	zoomToPost,
	zoomOutOfPost,
	zoomToMedia,
	zoomOutOfMedia: navigateOutOfMedia,
}: BlogProps) => {
	const {
		posts,
		blogFiles,
		managedPostsComputation,
		filter,
		sorting,
		params,
		deferredParams,
		addTagFilter,
		transformMediaUrl,
		sortedFilteredPosts,
		sortedMedia,
	} = useProcessedBlogPosts(blog);

	const goHome = () => {
		goToBlogSelection();
	};

	const { blogKey, reloadBlog } = useBlogReload();

	const zoomedInPost = sortedFilteredPosts.find(
		post => post.processed.id === zoomedPostId
	);

	const zoomInToPost = zoomToPost;
	const zoomOut = zoomOutOfPost;

	const {
		zoomedInMedia,
		adjacentMedia,
		transitioningMediaName,
		previewTransitionMediaName,
		outgoingTransitionMedia,
		zoomInToMedia,
		zoomOutOfMedia,
		dismissMediaFromBackground,
	} = useZoomedMedia({
		zoomedMediaName,
		sortedMedia,
		transformMediaUrl,
		zoomToMedia,
		navigateOutOfMedia,
	});
	const selectZoomedMedia = zoomInToMedia;

	const {
		needRefresh: [appHasUpdate],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<div className="h-dvh">
			<div className="z-sticky max-md:bg-navbar max-md:border-navbar-border max-md:shadow-header fixed top-0 right-0 left-0 flex h-16 justify-between max-md:border-b md:right-3">
				<HeaderPill side="left" className="gap-1">
					<Tooltip content={<p>Back to blog selection</p>}>
						<IconButton icon="home" onClick={() => goHome()} />
					</Tooltip>
					<div className="flex items-center gap-2 sm:gap-3">
						<PlatformLogo platform={blog.metadata.platform} />
						<a
							className="flex min-w-0 flex-col items-start justify-between text-sm *:max-w-full [&:hover]:underline"
							href={`https://tumblr.com/${blog.metadata.Name}`}
							target="_blank"
							rel="noreferrer noopener"
						>
							<p className="text-text-highlight overflow-hidden text-nowrap text-ellipsis">
								{blog.metadata.Name}
							</p>
							<p className="overflow-hidden text-nowrap text-ellipsis">
								{blog.metadata.Title}
							</p>
						</a>
					</div>
				</HeaderPill>
				<HeaderPill side="right">
					<ThemeToggle />
					{appHasUpdate && (
						<Tooltip content="Update available">
							<IconButton
								icon="download"
								className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
								onClick={() => updateServiceWorker(true)}
							/>
						</Tooltip>
					)}
					<Tooltip content={<p>Refresh</p>}>
						<IconButton
							icon="refresh"
							className="cursor-pointer"
							onClick={reloadBlog}
						/>
					</Tooltip>
					<BlogFiltering
						filteredPosts={sortedFilteredPosts}
						allPostsCount={posts?.length}
						filter={filter}
					/>
					<BlogSettings params={params} sorting={sorting} />
				</HeaderPill>
			</div>
			<BlogContent
				blog={blog}
				sortedFilteredPosts={sortedFilteredPosts}
				sortedMedia={sortedMedia}
				managedPostsComputation={managedPostsComputation}
				addTagFilter={addTagFilter}
				params={deferredParams}
				zoomInToPost={zoomInToPost}
				zoomInToMedia={zoomInToMedia}
				zoomedInMediaName={zoomedInMedia?.name}
				transitioningMediaName={transitioningMediaName ?? undefined}
				blogKey={blogKey}
			/>
			<ZoomedInPost
				zoomedInPost={zoomedInPost}
				blog={blog}
				addTagFilter={addTagFilter}
				params={deferredParams}
				zoomOut={zoomOut}
				zoomInToMedia={zoomInToMedia}
				blogKey={blogKey}
			/>
			{blogFiles && (
				<ZoomedInMedia
					key={zoomedInMedia?.name ?? 'closed'}
					media={zoomedInMedia}
					previousMedia={adjacentMedia.previousMedia}
					nextMedia={adjacentMedia.nextMedia}
					currentIndex={adjacentMedia.currentIndex}
					total={adjacentMedia.total}
					transformMediaUrl={transformMediaUrl}
					selectMedia={selectZoomedMedia}
					previewTransitionMediaName={previewTransitionMediaName ?? undefined}
					outgoingTransitionMedia={outgoingTransitionMedia ?? undefined}
					dismissFromBackground={dismissMediaFromBackground}
					zoomOut={zoomOutOfMedia}
				/>
			)}
		</div>
	);
};

export default Blog;
