import { useCallback, useState } from 'react';

const sortingFields = ['createdBy'];
const sortingDirections = ['asc', 'desc'];

export type BlogViewSettings = ReturnType<typeof useBlogViewSettings>;
export type BlogParams = BlogViewSettings['params'];
export type BlogSorting = BlogViewSettings['sorting'];
export type BlogFiltering = BlogViewSettings['filter'];

const useBlogViewSettings = () => {
	const [collapsedHeightRem, setCollapsedHeightRem] = useState<number>(24);
	const [columnWidthRem, setColumnWidthRem] = useState<number>(24);
	const [showDate, setShowDate] = useState<boolean>(true);

	const [tagsForFilter, setTagsForFilter] = useState<string[]>([]);

	const addTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => (prev.includes(tag) ? [...prev] : [...prev, tag]));
	}, []);

	const removeTagFilter = useCallback((tag: string) => {
		setTagsForFilter(prev => prev.filter(t => t !== tag));
	}, []);

	type SortingField = (typeof sortingFields)[number];
	type SortingDirection = (typeof sortingDirections)[number];

	const [sortingField, setSortingField] = useState<SortingField>('createdBy');
	const [sortingDirection, setSortingDirection] =
		useState<SortingDirection>('desc');

	return {
		sorting: {
			sortingField,
			sortingDirection,
			setSortingField,
			setSortingDirection,
			sortingFields,
			sortingDirections,
		},
		filter: {
			tagsForFilter,
			addTagFilter,
			removeTagFilter,
		},
		params: {
			collapsedHeightRem,
			columnWidthRem,
			setCollapsedHeightRem,
			setColumnWidthRem,
			showDate,
			setShowDate,
		},
	};
};

export default useBlogViewSettings;
