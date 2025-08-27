import { useCallback, useState } from 'react';
import { BlogPost } from 'Types/blog';
import { shouldSaveData } from 'Utils/networkUtils';

const sortingFields = ['createdBy'];
const sortingDirections = ['asc', 'desc'];

export type BlogViewSettings = ReturnType<typeof useBlogViewSettings>;
export type BlogParams = BlogViewSettings['params'];
export type BlogSorting = BlogViewSettings['sorting'];
export type BlogFiltering = BlogViewSettings['filter'];

interface BlogViewSettingsProps {
	availablePostTypes: BlogPost['type'][];
}

const useBlogViewSettings = ({ availablePostTypes }: BlogViewSettingsProps) => {
	// Params
	const [columnWidthRem, setColumnWidthRem] = useState<number>(24);
	const [collapsedHeightPercent, setCollapsedHeightPercent] =
		useState<number>(50);
	const [showDate, setShowDate] = useState<boolean>(true);
	const [showPostLink, setShowPostLink] = useState<boolean>(true);
	const [showRebloggedInfo, setShowRebloggedInfo] = useState<boolean>(true);
	const [showTags, setShowTags] = useState<boolean>(true);
	const [fallbackToOnlineMedia, setFallbackToOnlineMedia] =
		useState<boolean>(!shouldSaveData());

	// Filter
	const [blogPostTypes, setBlogPostTypes] = useState(
		Object.fromEntries(
			availablePostTypes.map(type => [type, true] as const)
		) as Record<BlogPost['type'], boolean>
	);

	const setBlogPostType = (type: BlogPost['type'], value: boolean) => {
		setBlogPostTypes(prev => ({ ...prev, [type]: value }));
	};

	const [tagsForFilter, setTagsForFilter] = useState<string[]>([]);

	const addTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => (prev.includes(tag) ? [...prev] : [...prev, tag]));
	}, []);

	const removeTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => prev.filter(t => t !== tag));
	}, []);

	// Sorting
	type SortingField = (typeof sortingFields)[number];
	type SortingDirection = (typeof sortingDirections)[number];

	const [sortingField, setSortingField] = useState<SortingField>('createdBy');
	const [sortingDirection, setSortingDirection] =
		useState<SortingDirection>('desc');

	return {
		params: {
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
		},
		filter: {
			tagsForFilter,
			addTagFilter,
			removeTagFilter,
			blogPostTypes,
			setBlogPostType,
		},
		sorting: {
			sortingField,
			sortingDirection,
			setSortingField,
			setSortingDirection,
			sortingFields,
			sortingDirections,
		},
	};
};

export default useBlogViewSettings;
