import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import { BlogEntry, CombinedBlogPost, ProcessedBlogPost } from 'Types/blog';
import { deduplicateArray } from 'Utils/arrayUtils';
import { filterBlogPostsByFuzzySearch } from 'Utils/blogUtils';

import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import BlogContent from './BlogContent';
import BlogFiltering from './BlogFiltering';
import BlogSettings from './BlogSettings';
import PlatformLogo from './PlatformLogo';
import ZoomedInPost from './ZoomedInPost';

interface BlogProps {
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	posts: CombinedBlogPost[];
	goToBlogSelection: () => void;
}

const Blog = ({ blog, blogFiles, posts, goToBlogSelection }: BlogProps) => {
	const queryClient = useQueryClient();

	const availablePostTypes = useMemo(
		() => deduplicateArray(posts.map(post => post.processed.type)),
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
			posts.filter(({ processed: post }) =>
				tagsForFilter.length
					? !!post.tags?.length &&
						tagsForFilter.every(tag => post.tags?.includes(tag))
					: post.type
						? blogPostTypes[post.type]
						: true
			),
			fuzzySearchString
		);
		const getKey = (post: ProcessedBlogPost): Date | number => {
			switch (sortingField) {
				case 'createdBy':
					return post.createdAt || 0;
				default:
					return 0;
			}
		};

		const sortedPosts = filteredPosts.toSorted((a, b) => {
			const aValue = getKey(a.processed);
			const bValue = getKey(b.processed);

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

	const reloadBlog = () => {
		queryClient.invalidateQueries({
			predicate: query =>
				[QUERY_KEYS.BLOG_FILES, QUERY_KEYS.BLOG_POSTS].some(
					key => query.queryKey[0] === key
				),
		});
	};

	const [zoomedInPostId, setZoomedInPostId] = useState<string | null>(null);
	const zoomedInPost = sortedFilteredPosts.find(
		post => post.processed.id === zoomedInPostId
	);

	const zoomInToPost = useCallback((postId: string) => {
		setZoomedInPostId(postId);
	}, []);

	const zoomOut = useCallback(() => {
		setZoomedInPostId(null);
	}, []);

	const {
		needRefresh: [appHasUpdate],
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
					{appHasUpdate && (
						<IconButton
							icon="download"
							className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
							onClick={() => updateServiceWorker(true)}
						/>
					)}
					<IconButton
						icon="refresh"
						className="cursor-pointer"
						onClick={reloadBlog}
					/>
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
				zoomInToPost={zoomInToPost}
			/>
			<ZoomedInPost
				zoomedInPost={zoomedInPost}
				blog={blog}
				blogFiles={blogFiles}
				addTagFilter={addTagFilter}
				params={deferredParams}
				zoomOut={zoomOut}
			/>
		</div>
	);
};

export default Blog;
