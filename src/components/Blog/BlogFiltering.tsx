import { Popover } from 'radix-ui';

import FilterLogo from 'Assets/icons/filter.svg?react';
import Counter from 'Components/utils/Counter';
import { BlogViewSettings } from 'Hooks/useBlogViewSettings';
import { BlogPost } from 'Types/blog';
import { countAllTags } from 'Utils/blogUtils';

type Filter = BlogViewSettings['filter'];

interface BlogFilteringProps {
	posts: BlogPost[];
	filter: Filter;
}

const BlogFiltering = ({
	posts,
	filter: { tagsForFilter, removeTagFilter, addTagFilter },
}: BlogFilteringProps) => {
	const filterCount = tagsForFilter.length;

	const countedTags = countAllTags(posts);
	// sort descendingly by count, map to tags
	const notUsedTags = countedTags
		.toSorted((a, b) => b.count - a.count)
		.map(tag => tag.tag);

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button className="fill-text relative cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-700">
					<FilterLogo />
					<Counter count={filterCount || undefined} />
				</button>
			</Popover.Trigger>
			<Popover.Content align="end" sideOffset={5} className="w-80 max-w-[90vw]">
				<div className="bg-popover-background rounded-lg px-3 py-4">
					<p className="mb-4">Filtering</p>
					<div className="mt-3 flex items-center gap-2">
						{!!countedTags.length && (
							<div className="flex flex-col items-start gap-4">
								<div className="flex items-start gap-2">
									<span className="mt-1 text-sm text-gray-400">Tags: </span>
									<div className="flex flex-wrap gap-2">
										{tagsForFilter.map(tag => (
											<span
												key={tag}
												className="flex items-center gap-0.5 rounded-full bg-gray-800 px-2 py-1"
											>
												<p className="text-sm">#{tag}</p>
												{
													<button
														// On hover, change background drop-shadow instead of text color
														className="h-4 w-4 cursor-pointer rounded-sm p-1 align-middle text-sm leading-0.5 text-gray-400 transition-colors [&:hover]:bg-gray-700"
														onClick={() => removeTagFilter(tag)}
													>
														x
													</button>
												}
											</span>
										))}
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									{notUsedTags.map(tag => (
										<button
											key={tag}
											className="cursor-pointer rounded-full bg-gray-900 px-2 py-1 transition-colors [&:hover]:bg-gray-800"
											onClick={() => addTagFilter(tag)}
										>
											<p className="text-sm">#{tag}</p>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default BlogFiltering;
