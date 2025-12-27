import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import { QUERY_KEYS } from 'Constants/queryKeys';
import useBlogFiles from 'Hooks/api/useBlogFiles';
import useBlogPosts from 'Hooks/api/useBlogPosts';
import useRootFolders from 'Hooks/api/useRootFolders';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import useExpensiveComputation from 'Hooks/useExpensiveComputation';
import { BlogEntry, ProcessedBlogPost } from 'Types/blog';
import { deduplicateArray } from 'Utils/arrayUtils';
import {
	filterBlogPostsByFuzzySearch,
	getBlogFolderName,
	getCachedProcessedBlogPost,
} from 'Utils/blogUtils';
import { clearCache } from 'Utils/cacheUtils';
import { expensiveMap } from 'Utils/computationUtils';

import BlogContent from './BlogContent';
import BlogFiltering from './BlogFiltering';
import BlogSettings from './BlogSettings';
import PlatformLogo from './PlatformLogo';
import ZoomedInPost from './ZoomedInPost';

interface BlogProps {
	blog: BlogEntry;
	goToBlogSelection: () => void;
}

const Blog = ({ blog, goToBlogSelection }: BlogProps) => {
	const queryClient = useQueryClient();

	const { data: folders } = useRootFolders();
	const blogFolderName = getBlogFolderName(blog?.metadata);
	const blogFolderHandle = folders?.find(
		folder => folder.name === blogFolderName
	);
	const { data: blogFiles } = useBlogFiles(blogFolderHandle);

	const [managedType, setManagedType] = useState<'managed' | 'unmanaged'>(
		'managed'
	);

	const {
		query: { data: posts },
	} = useBlogPosts(
		blog,
		blogFolderHandle,
		blogFiles,
		managedType === 'managed'
	);

	const managedPostsComputation = useExpensiveComputation(
		expensiveMap(
			posts,
			post =>
				getCachedProcessedBlogPost({
					blog,
					rawPost: post,
					blogFileNames: blogFiles!.map(file => file.name),
				}).value,
			1000
		),
		{
			enabled: managedType === 'managed' && !!blogFiles,
			transform: posts => posts?.filter(post => !!post),
		}
	);
	const { data: managedPosts } = managedPostsComputation;

	const availablePostTypes = useMemo(
		() =>
			deduplicateArray((managedPosts ?? []).map(post => post.processed.type)),
		[managedPosts]
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
		if (!managedPosts) return [];

		const filteredPosts = filterBlogPostsByFuzzySearch(
			(managedPosts ?? []).filter(({ processed: post }) =>
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
		managedPosts,
		fuzzySearchString,
		tagsForFilter,
		blogPostTypes,
	]);

	const goHome = () => {
		goToBlogSelection();
	};

	const [blogKey, setBlogKey] = useState(0);

	const reloadBlog = () => {
		clearCache('BLOG_PROCESSING');
		queryClient
			.invalidateQueries({
				predicate: query =>
					[QUERY_KEYS.BLOG_FILES, QUERY_KEYS.BLOG_POSTS].some(
						key => query.queryKey[0] === key
					),
			})
			.then(() => {
				setBlogKey(prev => prev + 1);
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

	return (
		<div className="grid h-dvh grid-rows-[auto_1fr]">
			<div className="bg-navbar flex h-16 items-center justify-between px-2 shadow-2xl shadow-slate-950/70 sm:px-6">
				<div className="flex min-w-0 items-center gap-1 sm:gap-4">
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
							<p className="overflow-hidden text-nowrap text-ellipsis text-white">
								{blog.metadata.Name}
							</p>
							<p className="overflow-hidden text-nowrap text-ellipsis">
								{blog.metadata.Title}
							</p>
						</a>
					</div>
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
						allPostsCount={posts?.length}
						filter={filter}
						managedType={managedType}
					/>
					<BlogSettings params={params} sorting={sorting} />
				</div>
			</div>
			<BlogContent
				blog={blog}
				sortedFilteredPosts={sortedFilteredPosts}
				managedPostsComputation={managedPostsComputation}
				addTagFilter={addTagFilter}
				params={deferredParams}
				zoomInToPost={zoomInToPost}
				blogKey={blogKey}
			/>
			<ZoomedInPost
				zoomedInPost={zoomedInPost}
				blog={blog}
				addTagFilter={addTagFilter}
				params={deferredParams}
				zoomOut={zoomOut}
				blogKey={blogKey}
			/>
		</div>
	);
};

export default Blog;
