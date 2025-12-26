import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { ProcessedBlogPost } from 'Types/blog';
import { shouldSaveData } from 'Utils/networkUtils';
import useWindowSize from './useWindowSize';

const sortingFields = ['createdBy'];
const sortingDirections = ['asc', 'desc'];

export type BlogViewSettings = ReturnType<typeof useBlogViewSettings>;
export type BlogParams = BlogViewSettings['params'];
export type BlogDeferredParams = BlogViewSettings['deferredParams'];
export type BlogSorting = BlogViewSettings['sorting'];
export type BlogFiltering = BlogViewSettings['filter'];

interface BlogViewSettingsProps {
	availablePostTypes: ProcessedBlogPost['type'][];
}

const useBlogViewSettings = ({ availablePostTypes }: BlogViewSettingsProps) => {
	const { width } = useWindowSize();

	// Params
	const [layoutMode, setLayoutMode] = useState<'masonry' | 'list'>(
		width > 600 ? 'masonry' : 'list'
	);
	const [columnWidthRem, setColumnWidthRem] = useState<number>(24);
	const [collapsedHeightPercent, setCollapsedHeightPercent] =
		useState<number>(50);
	const [showDate, setShowDate] = useState<boolean>(true);
	const [showPostLink, setShowPostLink] = useState<boolean>(true);
	const [showRebloggedInfo, setShowRebloggedInfo] = useState<boolean>(true);
	const [showTags, setShowTags] = useState<boolean>(true);
	const [fallbackToOnlineMedia, setFallbackToOnlineMedia] =
		useState<boolean>(!shouldSaveData());
	const [debugMode, setDebugMode] = useState<boolean>(import.meta.env.DEV);

	const params = useMemo(
		() => ({
			layoutMode,
			setLayoutMode,
			columnWidthRem,
			setColumnWidthRem,
			collapsedHeightPercent,
			setCollapsedHeightPercent,
			showDate,
			setShowDate,
			showPostLink,
			setShowPostLink,
			showRebloggedInfo,
			setShowRebloggedInfo,
			showTags,
			setShowTags,
			fallbackToOnlineMedia,
			setFallbackToOnlineMedia,
			debugMode,
			setDebugMode,
		}),
		[
			layoutMode,
			columnWidthRem,
			collapsedHeightPercent,
			showDate,
			showPostLink,
			showRebloggedInfo,
			showTags,
			fallbackToOnlineMedia,
			debugMode,
		]
	);

	// Deferred params
	const deferredLayoutMode = useDeferredValue(layoutMode);
	const deferredColumnWidthRem = useDeferredValue(columnWidthRem);
	const deferredCollapsedHeightPercent = useDeferredValue(
		collapsedHeightPercent
	);
	const deferredShowDate = useDeferredValue(showDate);
	const deferredShowPostLink = useDeferredValue(showPostLink);
	const deferredShowRebloggedInfo = useDeferredValue(showRebloggedInfo);
	const deferredShowTags = useDeferredValue(showTags);
	const deferredFallbackToOnlineMedia = useDeferredValue(fallbackToOnlineMedia);
	const deferredDebugMode = useDeferredValue(debugMode);
	const deferredParams = useMemo(
		() => ({
			layoutMode: deferredLayoutMode,
			columnWidthRem: deferredColumnWidthRem,
			collapsedHeightPercent: deferredCollapsedHeightPercent,
			showDate: deferredShowDate,
			showPostLink: deferredShowPostLink,
			showRebloggedInfo: deferredShowRebloggedInfo,
			showTags: deferredShowTags,
			fallbackToOnlineMedia: deferredFallbackToOnlineMedia,
			debugMode: deferredDebugMode,
		}),
		[
			deferredLayoutMode,
			deferredColumnWidthRem,
			deferredCollapsedHeightPercent,
			deferredShowDate,
			deferredShowPostLink,
			deferredShowRebloggedInfo,
			deferredShowTags,
			deferredFallbackToOnlineMedia,
			deferredDebugMode,
		]
	);

	// Filter
	const [blogPostTypes, setBlogPostTypes] = useState(
		Object.fromEntries(
			availablePostTypes.map(type => [type, true] as const)
		) as Record<NonNullable<ProcessedBlogPost['type']>, boolean>
	);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setBlogPostTypes(
			() =>
				Object.fromEntries(
					availablePostTypes.map(type => [type, true] as const)
				) as Record<NonNullable<ProcessedBlogPost['type']>, boolean>
		);
	}, [availablePostTypes]);

	const setBlogPostType = (type: ProcessedBlogPost['type'], value: boolean) => {
		if (!type) return;
		setBlogPostTypes(prev => ({ ...prev, [type]: value }));
	};

	const [tagsForFilter, setTagsForFilter] = useState<string[]>([]);

	const addTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => (prev.includes(tag) ? [...prev] : [...prev, tag]));
	}, []);

	const removeTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => prev.filter(t => t !== tag));
	}, []);

	const [fuzzySearchString, setFuzzySearchString] = useState<
		string | undefined
	>();

	const filter = useMemo(
		() => ({
			tagsForFilter,
			addTagFilter,
			removeTagFilter,
			blogPostTypes,
			setBlogPostType,
			fuzzySearchString,
			setFuzzySearchString,
		}),
		[
			tagsForFilter,
			addTagFilter,
			removeTagFilter,
			blogPostTypes,
			fuzzySearchString,
		]
	);

	// Deferred filter
	const deferredBlogPostTypes = useDeferredValue(blogPostTypes);
	const deferredTagsForFilter = useDeferredValue(tagsForFilter);
	const deferredFuzzySearchString = useDeferredValue(fuzzySearchString);

	const deferredFilter = useMemo(
		() => ({
			tagsForFilter: deferredTagsForFilter,
			blogPostTypes: deferredBlogPostTypes,
			fuzzySearchString: deferredFuzzySearchString,
		}),
		[deferredTagsForFilter, deferredBlogPostTypes, deferredFuzzySearchString]
	);

	// Sorting
	type SortingField = (typeof sortingFields)[number];
	type SortingDirection = (typeof sortingDirections)[number];

	const [sortingField, setSortingField] = useState<SortingField>('createdBy');
	const [sortingDirection, setSortingDirection] =
		useState<SortingDirection>('desc');

	const sorting = useMemo(
		() => ({
			sortingField,
			sortingDirection,
			setSortingField,
			setSortingDirection,
			sortingFields,
			sortingDirections,
		}),
		[sortingField, sortingDirection, setSortingField, setSortingDirection]
	);

	// Deferred sorting
	const deferredSortingField = useDeferredValue(sortingField);
	const deferredSortingDirection = useDeferredValue(sortingDirection);
	const deferredSorting = useMemo(
		() => ({
			sortingField: deferredSortingField,
			sortingDirection: deferredSortingDirection,
		}),
		[deferredSortingField, deferredSortingDirection]
	);

	return {
		params,
		deferredParams,
		filter,
		deferredFilter,
		sorting,
		deferredSorting,
	};
};

export default useBlogViewSettings;
