import { Popover, Switch } from 'radix-ui';

import IconButton from 'Components/IconButton';
import Counter from 'Components/utils/Counter';
import InterceptCallbacks from 'Components/utils/InterceptCallbacks';
import { BlogViewSettings } from 'Hooks/useBlogViewSettings';
import { useState } from 'react';
import { BlogPost } from 'Types/blog';
import { countAllTags } from 'Utils/blogUtils';

type Filter = BlogViewSettings['filter'];

interface BlogFilteringProps {
	filteredPosts: BlogPost[];
	allPostsCount: number;
	filter: Filter;
}

const BlogFiltering = ({
	filteredPosts,
	allPostsCount,
	filter: {
		tagsForFilter,
		removeTagFilter,
		addTagFilter,
		blogPostTypes,
		setBlogPostType,
	},
}: BlogFilteringProps) => {
	const filterCount = tagsForFilter.length;

	const countedRemainingTags = countAllTags(filteredPosts);
	// sort descendingly by count, map to tags
	const notUsedTags = countedRemainingTags
		.filter(({ tag }) => !tagsForFilter.includes(tag))
		.toSorted((a, b) => b.count - a.count)
		.map(tag => tag.tag);

	const [open, setOpen] = useState(false);

	return (
		<Popover.Root
			open={open}
			onOpenChange={newOpen => {
				document.startViewTransition(() => {
					setOpen(newOpen);
				});
			}}
		>
			<Popover.Trigger asChild>
				<InterceptCallbacks
					intercept={{
						onClick: (prevCb, args) => {
							document.startViewTransition(() => {
								prevCb(...args);
							});
						},
					}}
					render={props => (
						<IconButton icon="filter" {...props}>
							<Counter count={filterCount || undefined} />
						</IconButton>
					)}
				/>
			</Popover.Trigger>
			<Popover.Content align="end" sideOffset={5} className="w-80 max-w-[90vw]">
				<div className="bg-popover-background rounded-lg px-3 py-4">
					<div className="flex justify-between">
						<p className="mb-4 text-lg">Filtering</p>
						<p className="text-sm">
							{filteredPosts.length} / {allPostsCount}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{!countedRemainingTags.length && (
							<p className="text-sm text-gray-400">No tags</p>
						)}
						{!!countedRemainingTags.length && (
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
														className="size-4 cursor-pointer rounded-sm p-1 align-middle text-sm leading-0.5 text-gray-400 transition-colors [&:hover]:bg-gray-700"
														onClick={() => removeTagFilter(tag)}
													>
														x
													</button>
												}
											</span>
										))}
									</div>
								</div>
								<div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
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
					<p className="my-2">Filter by type:</p>
					<div className="grid grid-cols-[auto_auto_auto_auto] gap-4">
						{Object.entries(blogPostTypes).map(([type, isActive]) => (
							<>
								<span className="text-sm">{type}:</span>
								<div className="flex items-center gap-2">
									<Switch.Root
										className="SwitchRoot"
										checked={isActive}
										onCheckedChange={value =>
											setBlogPostType(type as BlogPost['type'], value)
										}
									>
										<Switch.Thumb className="SwitchThumb" />
									</Switch.Root>
								</div>
							</>
						))}
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default BlogFiltering;
