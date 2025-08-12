import { useMemo, useState } from 'react';

const sortingFields = ['createdBy'];
const sortingDirections = ['asc', 'desc'];

const useBlogViewSettings = () => {
	const [columnWidthRem, setColumnWidthRem] = useState<number>(24);

	const [tagsForFilter, setTagsForFilter] = useState<string[]>([]);

	const filter = useMemo(
		() => ({
			tagsForFilter,
		}),
		[tagsForFilter]
	);

	const addTagFilter = (tag: string) => {
		if (!tagsForFilter.includes(tag)) {
			setTagsForFilter(prev => [...prev, tag]);
		}
	};

	const removeTagFilter = (tag: string) => {
		setTagsForFilter(prev => prev.filter(t => t !== tag));
	};

	type SortingField = (typeof sortingFields)[number];
	type SortingDirection = (typeof sortingDirections)[number];

	const [sortingField, setSortingField] = useState<SortingField>('createdBy');
	const [sortingDirection, setSortingDirection] =
		useState<SortingDirection>('desc');

	return {
		sortingFields,
		sortingDirections,
		params: {
			columnWidthRem,
			filter,
			sortingField,
			sortingDirection,
		},
		setters: {
			setColumnWidthRem,
			setSortingField,
			setSortingDirection,
			addTagFilter,
			removeTagFilter,
		},
	};
};

export default useBlogViewSettings;
