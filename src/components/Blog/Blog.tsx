import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import { BlogEntry, BlogPost as BlogPostType } from 'Types/blog';
import { deduplicateArray } from 'Utils/arrayUtils';
import { filterBlogPostsByFuzzySearch } from 'Utils/blogUtils';

import BlogContent from './BlogContent';
import BlogFiltering from './BlogFiltering';
import BlogSettings from './BlogSettings';
import PlatformLogo from './PlatformLogo';
import ZoomedInPost from './ZoomedInPost';

interface BlogProps {
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	posts: BlogPostType[];
	goToBlogSelection: () => void;
}

const Blog = ({ blog, blogFiles, posts, goToBlogSelection }: BlogProps) => {
	const availablePostTypes = useMemo(
		() => deduplicateArray(posts.map(post => post.type)),
		[posts]
	);

	const {
		sorting,
		deferredSorting: { sortingField, sortingDirection },
		filter,
		deferredFilter,
		params,
		deferredParams,
	} = useBlogViewSettings({ availablePostTypes });

	const { tagsForFilter, blogPostTypes, fuzzySearchString } = deferredFilter;
	const { addTagFilter } = filter;

	const sortedFilteredPosts = useMemo(() => {
		const filteredPosts = filterBlogPostsByFuzzySearch(
			posts.filter(post =>
				tagsForFilter.length
					? !!post.tags.length &&
						tagsForFilter.every(tag => post.tags.includes(tag))
					: blogPostTypes[post.type]
			),
			fuzzySearchString
		);
		const getKey = (post: BlogPostType): Date | number => {
			switch (sortingField) {
				case 'createdBy':
					return post.calculated!.createdAt || 0;
				default:
					return 0;
			}
		};

		const sortedPosts = filteredPosts.toSorted((a, b) => {
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

		return sortedPosts;
	}, [
		sortingField,
		sortingDirection,
		posts,
		fuzzySearchString,
		tagsForFilter,
		blogPostTypes,
	]);

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

	const [, refreshRaw] = useState({});
	const refresh = useCallback(() => {
		refreshRaw({});
	}, []);

	useEffect(() => {
		const timeout = setTimeout(() => {
			refresh();
		}, 1000);
		return () => clearTimeout(timeout);
	}, [refresh]);

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky bg-navbar sticky top-0 bottom-0 flex h-16 w-full items-center justify-between px-2 sm:px-6">
				<div className="flex min-w-0 items-center gap-4">
					<Tooltip content={<p>Back to blog selection</p>}>
						<IconButton icon="home" onClick={() => goHome()} />
					</Tooltip>
					<PlatformLogo platform={blog.metadata.platform} />
					<a
						className="flex min-w-0 flex-col items-start justify-between text-sm *:max-w-full [&:hover]:underline"
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
						<IconButton
							icon="download"
							className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
							onClick={() => updateServiceWorker(true)}
						/>
					)}
					<BlogFiltering
						filteredPosts={sortedFilteredPosts}
						allPostsCount={posts.length}
						filter={filter}
					/>
					<BlogSettings params={params} sorting={sorting} />
				</div>
			</div>
			<BlogContent
				blog={blog}
				blogFiles={blogFiles}
				sortedFilteredPosts={sortedFilteredPosts}
				addTagFilter={addTagFilter}
				params={deferredParams}
				imageUrlsCache={imageUrlsCache}
				generatedObjectUrls={generatedObjectUrls}
				zoomInToPost={zoomInToPost}
			/>
			<ZoomedInPost
				zoomedInPost={zoomedInPost}
				blog={blog}
				blogFiles={blogFiles}
				addTagFilter={addTagFilter}
				params={deferredParams}
				imageUrlsCache={imageUrlsCache}
				generatedObjectUrls={generatedObjectUrls}
				zoomOut={zoomOut}
			/>
		</div>
	);
};

export default Blog;
