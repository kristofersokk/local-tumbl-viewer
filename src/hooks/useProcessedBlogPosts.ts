import { useMemo } from 'react';

import useBlogFiles from 'Hooks/api/useBlogFiles';
import useBlogPosts from 'Hooks/api/useBlogPosts';
import useRootFolders from 'Hooks/api/useRootFolders';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import useExpensiveComputation from 'Hooks/useExpensiveComputation';
import useTransformMediaUrl from 'Hooks/useTransformMediaUrl';
import { BlogEntry, ProcessedBlogPost } from 'Types/blog';
import { deduplicateArray, shuffleArray } from 'Utils/arrayUtils';
import { getCachedProcessedBlogPost } from 'Utils/blogPostProcessingUtils';
import {
	detectBlogMediaFiles,
	filterBlogPostsByFuzzySearch,
	getBlogFolderName,
} from 'Utils/blogUtils';
import { expensiveMap } from 'Utils/computationUtils';

// Fetches, processes, filters and sorts a blog's posts, deriving the media list used for zooming.
const useProcessedBlogPosts = (blog: BlogEntry) => {
	const { data: folders } = useRootFolders();
	const blogFolderName = getBlogFolderName(blog?.metadata);
	const blogFolderHandle = folders?.find(
		folder => folder.name === blogFolderName
	);
	const { data: blogFiles } = useBlogFiles(blogFolderHandle);

	const {
		query: { data: posts },
	} = useBlogPosts(blog, blogFolderHandle, blogFiles);

	const blogMediaFiles = useMemo(() => {
		if (!blogFiles || !posts) return undefined;
		return detectBlogMediaFiles(
			blogFiles.map(file => file.name),
			posts
				.map(post => ('id' in post ? post.id : undefined))
				.filter(id => id !== undefined)
		);
	}, [blogFiles, posts]);

	const managedPostsComputation = useExpensiveComputation(
		expensiveMap(
			posts,
			post =>
				getCachedProcessedBlogPost({
					blog,
					rawPost: post,
					blogMediaFiles,
				}).value
		),
		{
			enabled: !!blogMediaFiles,
			transform: posts => posts?.filter(post => !!post),
			batchTimeMs: 14,
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
	const transformMediaUrl = useTransformMediaUrl({
		fallbackToOnlineMedia: deferredParams.fallbackToOnlineMedia,
		imgMappingEntries: blog.fileEntries.Entries,
		blogFiles: blogFiles ?? [],
		blogName: blog.metadata.Name,
	});

	const { tagsForFilter, blogPostTypes, fuzzySearchString } = deferredFilter;
	const { addTagFilter } = filter;

	const filteredPosts = useMemo(() => {
		if (!managedPosts) return [];

		return filterBlogPostsByFuzzySearch(
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
	}, [managedPosts, fuzzySearchString, tagsForFilter, blogPostTypes]);

	const sortedFilteredPosts = useMemo(() => {
		const getKey = (post: ProcessedBlogPost): Date | number => {
			switch (sortingField) {
				case 'createdBy':
					return post.createdAt || 0;
				default:
					return 0;
			}
		};

		const sortedPosts =
			sortingField === 'shuffle'
				? shuffleArray(filteredPosts)
				: filteredPosts.toSorted((a, b) => {
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
	}, [filteredPosts, sortingField, sortingDirection]);

	const sortedMedia = useMemo(
		() =>
			sortedFilteredPosts.flatMap(
				post =>
					post.processed.mediaFiles?.map(file => ({
						...file,
						post,
					})) ?? []
			),
		[sortedFilteredPosts]
	);

	return {
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
	};
};

export default useProcessedBlogPosts;
