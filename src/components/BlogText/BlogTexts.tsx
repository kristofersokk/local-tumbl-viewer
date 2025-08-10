import useRemToPixels from 'Hooks/useRemToPixels';
import { Blog, BlogText as BlogTextType } from 'Types/blog';
import { Masonry } from 'masonic';
import { useMemo, useState } from 'react';
import BlogText from './BlogText';

const sortingFields = ['createdBy'];
const sortingDirections = ['asc', 'desc'];

interface BlogTextsProps {
	blog: Blog;
	texts: BlogTextType[];
}

const BlogTexts = ({ blog, texts }: BlogTextsProps) => {
	const remInPixels = useRemToPixels();

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

	const filteredTexts = useMemo(() => {
		return texts.filter(text =>
			filter.tagsForFilter.length
				? !!text.tags.length &&
					filter.tagsForFilter.every(tag => text.tags.includes(tag))
				: true
		);
	}, [texts, filter]);

	type SortingField = (typeof sortingFields)[number];
	type SortingDirection = (typeof sortingDirections)[number];

	const [sortingField, setSortingField] = useState<SortingField>('createdBy');
	const [sortingDirection, setSortingDirection] =
		useState<SortingDirection>('desc');

	const sortedTexts = useMemo(() => {
		const getKey = (text: BlogTextType) => {
			switch (sortingField) {
				case 'createdBy':
					return text['unix-timestamp'];
				default:
					return 0;
			}
		};
		return filteredTexts.toSorted((a, b) => {
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
	}, [filteredTexts, sortingField, sortingDirection]);

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky sticky top-0 bottom-0 flex h-16 w-full items-center justify-between bg-[#111] px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-4">
						<img
							src="https://assets.tumblr.com/images/default_avatar/sphere_closed_64.png"
							className="h-11 w-11 rounded"
						/>
						<div className="flex flex-col items-start justify-between text-sm">
							<p className="text-white">{blog.Name}</p>
							<p>{blog.Title}</p>
						</div>
					</div>
					<a
						href={`https://${blog.Name}.tumblr.com`}
						className="text-sm text-gray-400 transition-colors hover:text-white"
					>
						Visit Blog
					</a>
				</div>
				<div>
					{!!tagsForFilter.length && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-400">Filtering by: </span>
							{tagsForFilter.map(tag => (
								<span
									key={tag}
									className="flex items-center gap-0.5 rounded-full bg-gray-800 px-2 py-1"
								>
									<p className="text-sm">#{tag}</p>
									{
										<button
											// On hover, change background drop-shadow instead of text color
											className="h-4 w-4 cursor-pointer rounded-sm p-1 align-middle text-sm leading-0.5 text-gray-400 transition-colors hover:bg-gray-700"
											onClick={() => removeTagFilter(tag)}
										>
											x
										</button>
									}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
			<div className="w-full px-4 py-8 md:px-8 lg:px-12">
				<Masonry
					key={JSON.stringify(filter)}
					items={sortedTexts}
					render={({ data: text }) => (
						<BlogText key={text.id} text={text} addTagFilter={addTagFilter} />
					)}
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={24 * remInPixels}
					itemHeightEstimate={29 * remInPixels}
					itemKey={text => text.id || text.url}
					scrollFps={12}
				/>
			</div>
		</div>
	);
};

export default BlogTexts;
