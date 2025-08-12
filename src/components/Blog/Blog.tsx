import HomeLogo from 'Assets/icons/home.svg?react';
import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import { BlogPost as BlogPostType, Blog as BlogType } from 'Types/blog';
import { Masonry } from 'masonic';
import { Slider } from 'radix-ui';
import { useMemo } from 'react';
import BlogPost from './BlogPost';

interface BlogProps {
	blog: BlogType;
	texts: BlogPostType[];
	goToBlogSelection: () => void;
}

const Blog = ({ blog, texts, goToBlogSelection }: BlogProps) => {
	const remInPixels = useRemToPixels();

	const {
		params: { columnWidthRem, filter, sortingField, sortingDirection },
		setters: {
			setColumnWidthRem,
			addTagFilter,
			removeTagFilter,
			setSortingField,
			setSortingDirection,
		},
	} = useBlogViewSettings();

	const filteredTexts = useMemo(() => {
		return texts.filter(text =>
			filter.tagsForFilter.length
				? !!text.tags.length &&
					filter.tagsForFilter.every(tag => text.tags.includes(tag))
				: true
		);
	}, [texts, filter]);

	const sortedTexts = useMemo(() => {
		const getKey = (text: BlogPostType) => {
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

	const goHome = () => {
		goToBlogSelection();
	};

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky sticky top-0 bottom-0 flex h-16 w-full items-center justify-between bg-[#111] px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-4">
						<button
							className="cursor-pointer drop-shadow-[0_0_3px_4px] drop-shadow-gray-400 transition-shadow hover:drop-shadow-gray-600"
							onClick={() => goHome()}
						>
							<HomeLogo />
						</button>
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
						target="_blank"
						className="text-sm text-gray-400 transition-colors hover:text-white"
					>
						Visit Blog
					</a>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm">Column width:</span>
						<Slider.Root
							className="SliderRoot"
							min={10}
							max={60}
							step={1}
							value={[columnWidthRem]}
							onValueChange={value => setColumnWidthRem(value[0])}
						>
							<Slider.Track className="SliderTrack">
								<Slider.Range className="SliderRange" />
							</Slider.Track>
							<Slider.Thumb className="SliderThumb" />
						</Slider.Root>
						<span className="text-sm">{columnWidthRem}rem</span>
					</div>
					{!!filter.tagsForFilter.length && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-400">Filtering by: </span>
							{filter.tagsForFilter.map(tag => (
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
					key={blog.Name + JSON.stringify(filter)}
					items={sortedTexts}
					render={({ data: text }) => (
						<BlogPost
							key={text.id}
							text={text}
							addTagFilter={addTagFilter}
							columnWidthRem={columnWidthRem}
						/>
					)}
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={columnWidthRem * remInPixels}
					itemHeightEstimate={(columnWidthRem + 5) * remInPixels}
					itemKey={text => text.id || text.url}
					scrollFps={12}
				/>
			</div>
		</div>
	);
};

export default Blog;
