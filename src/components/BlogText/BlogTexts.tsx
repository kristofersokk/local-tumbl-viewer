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
		return texts.toSorted((a, b) => {
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
	}, [texts, sortingField, sortingDirection]);

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky sticky top-0 bottom-0 flex h-16 w-full items-center bg-[#111] px-6">
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
			</div>
			<div className="w-full px-4 py-8 md:px-8 lg:px-12">
				<Masonry
					items={sortedTexts}
					render={({ data: text }) => <BlogText key={text.id} text={text} />}
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={24 * remInPixels}
					itemHeightEstimate={29 * remInPixels}
					itemKey={text => text.id}
					scrollFps={12}
				/>
			</div>
		</div>
	);
};

export default BlogTexts;
