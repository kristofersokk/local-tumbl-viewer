import DownloadLogo from 'Assets/icons/download.svg?react';
import HomeLogo from 'Assets/icons/home.svg?react';
import ClickOutside from 'Components/ClickOutside';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import { BlogEntry, BlogPost as BlogPostType } from 'Types/blog';
import { deduplicateArray } from 'Utils/arrayUtils';
import { Masonry } from 'masonic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import BlogFiltering from './BlogFiltering';
import BlogPost from './BlogPost';
import BlogSettings from './BlogSettings';
import PlatformLogo from './PlatformLogo';

interface BlogProps {
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	posts: BlogPostType[];
	goToBlogSelection: () => void;
}

const Blog = ({ blog, blogFiles, posts, goToBlogSelection }: BlogProps) => {
	const remInPixels = useRemToPixels();

	const availablePostTypes = useMemo(
		() => deduplicateArray(posts.map(post => post.type)),
		[posts]
	);

	const {
		sorting: { sortingField, sortingDirection },
		filter,
		params,
	} = useBlogViewSettings({ availablePostTypes });
	const { height: viewportHeightInPixels } = useWindowSize();

	const { tagsForFilter, addTagFilter, blogPostTypes } = filter;
	const { collapsedHeightPercent, columnWidthRem } = params;

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	const filteredPosts = useMemo(() => {
		return posts.filter(post =>
			tagsForFilter.length
				? !!post.tags.length &&
					tagsForFilter.every(tag => post.tags.includes(tag))
				: blogPostTypes[post.type]
		);
	}, [posts, tagsForFilter, blogPostTypes]);

	const sortedFilteredPosts = useMemo(() => {
		const getKey = (post: BlogPostType): Date | number => {
			switch (sortingField) {
				case 'createdBy':
					return post.calculated!.createdAt || 0;
				default:
					return 0;
			}
		};
		return filteredPosts.toSorted((a, b) => {
			const aValue = getKey(a);
			const bValue = getKey(b);

			if (aValue < bValue) {
				return sortingDirection === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortingDirection === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}, [filteredPosts, sortingField, sortingDirection]);

	const goHome = () => {
		goToBlogSelection();
	};

	const [imageUrlsCache, setImageUrlsCache] = useState<
		Record<string, { online?: string; local?: string }>
	>({});
	const [generatedObjectUrls, setGeneratedObjectUrls] = useState<string[]>([]);

	useEffect(() => {
		return () => {
			setImageUrlsCache({});
			setGeneratedObjectUrls([]);
			setTimeout(() => {
				generatedObjectUrls.forEach(url => URL.revokeObjectURL(url));
			}, 100);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [zoomedInPostId, setZoomedInPostId] = useState<string | null>(null);
	const zoomedInPost = sortedFilteredPosts.find(
		post => post.id === zoomedInPostId
	);

	const zoomInToPost = useCallback((postId: string) => {
		document.startViewTransition(() => {
			setZoomedInPostId(postId);
		});
	}, []);

	const zoomOut = useCallback(() => {
		document.startViewTransition(() => {
			setZoomedInPostId(null);
		});
	}, []);

	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky bg-navbar sticky top-0 bottom-0 flex h-16 w-full items-center justify-between px-2 sm:px-6">
				<div className="flex min-w-0 items-center gap-4">
					<button
						className="fill-text cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-800"
						onClick={() => goHome()}
					>
						<HomeLogo />
					</button>
					<PlatformLogo platform={blog.metadata.platform} />
					<a
						className="flex min-w-0 flex-col items-start justify-between text-sm [&:hover]:underline [&>*]:max-w-full"
						href={`https://tumblr.com/${blog.metadata.Name}`}
						target="_blank"
						rel="noreferrer noopener"
					>
						<p className="overflow-hidden text-nowrap text-ellipsis text-white">
							{blog.metadata.Name}
						</p>
						<p className="overflow-hidden text-nowrap text-ellipsis">
							{blog.metadata.Title}
						</p>
					</a>
				</div>
				<div className="xs:gap-1 flex items-center md:gap-2">
					{needRefresh && (
						<button
							className="fill-download-icon-fill [&:hover]:bg-download-icon-hover cursor-pointer rounded-full p-2 transition-colors"
							onClick={() => updateServiceWorker(true)}
						>
							<DownloadLogo />
						</button>
					)}
					<BlogFiltering
						filteredPosts={sortedFilteredPosts}
						allPostsCount={posts.length}
						filter={filter}
					/>
					<BlogSettings params={params} />
				</div>
			</div>
			<div className="w-full px-0 py-8 md:px-8 lg:px-12">
				<Masonry
					key={blog.metadata.Name + JSON.stringify(filter)}
					items={sortedFilteredPosts}
					render={({ data: post }) => (
						<BlogPost
							key={post.id}
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
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={columnWidthRem * remInPixels}
					itemHeightEstimate={(collapsedHeightRem + 5) * remInPixels}
					itemKey={post => post.id || post.url || ''}
					scrollFps={12}
					overscanBy={3}
				/>
			</div>
			{zoomedInPost && (
				<div>
					<div className="z-zoomed-post fixed top-0 right-0 bottom-0 left-0 flex justify-center overflow-y-auto overscroll-none [&::-webkit-scrollbar]:hidden">
						<div className="min-h-[calc(100dvh+1px)]">
							<div className="h-fit py-10 pb-16 lg:py-16">
								<div className="h-fit w-[40rem] max-w-[90vw]">
									<ClickOutside onClickOutside={zoomOut}>
										{ref => (
											<BlogPost
												Ref={ref}
												className="min-h-fit"
												blog={blog}
												post={zoomedInPost}
												blogFiles={blogFiles}
												addTagFilter={addTagFilter}
												params={params}
												imageUrlsCache={imageUrlsCache}
												generatedObjectUrls={generatedObjectUrls}
												forceUncollapsed
											/>
										)}
									</ClickOutside>
								</div>
							</div>
						</div>
					</div>
					<div className="z-zoomed-post-backdrop fixed top-0 right-0 bottom-0 left-0 backdrop-blur-xl backdrop-brightness-75" />
				</div>
			)}
		</div>
	);
};

export default Blog;
