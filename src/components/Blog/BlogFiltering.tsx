import { Popover, Switch } from 'radix-ui';
import { useMemo, useState } from 'react';

import IconButton from 'Components/IconButton';
import TextInput from 'Components/TextInput';
import Tooltip from 'Components/Tooltip';
import Counter from 'Components/utils/Counter';
import { BlogFiltering as BlogFilteringType } from 'Hooks/useBlogViewSettings';
import { CombinedBlogPost, ProcessedBlogPost } from 'Types/blog';
import { countAllTags } from 'Utils/blogUtils';

interface BlogFilteringProps {
	filteredPosts: CombinedBlogPost[] | undefined;
	allPostsCount: number | undefined;
	filter: BlogFilteringType;
}

const BlogFiltering = ({
	filteredPosts = [],
	allPostsCount,
	filter: {
		tagsForFilter,
		removeTagFilter,
		addTagFilter,
		blogPostTypes,
		setBlogPostType,
		fuzzySearchString,
		setFuzzySearchString,
	},
}: BlogFilteringProps) => {
	const filterCount = tagsForFilter.length;

	const countedRemainingTags = useMemo(
		() => countAllTags(filteredPosts),
		[filteredPosts]
	);
	// sort descendingly by count, map to tags
	const notUsedTags = useMemo(
		() =>
			countedRemainingTags
				.filter(({ tag }) => !tagsForFilter.includes(tag))
				.toSorted((a, b) => b.count - a.count)
				.map(tag => tag.tag),
		[countedRemainingTags, tagsForFilter]
	);

	const [open, setOpen] = useState(false);

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Tooltip content={<p>Filtering</p>}>
				<Popover.Trigger asChild>
					<IconButton icon="filter" className="relative">
						<Counter count={filterCount || undefined} />
					</IconButton>
				</Popover.Trigger>
			</Tooltip>
			<Popover.Content
				align="end"
				sideOffset={5}
				className="z-popover shadow-popover-shadow/70 w-80 max-w-[90vw] shadow-2xl"
			>
				<div className="bg-popover-background rounded-lg px-3 py-4">
					<div className="flex justify-between">
						<p className="mb-4 text-lg">Filtering</p>
						<p className="text-sm">
							{filteredPosts.length} / {allPostsCount ?? 'unknown'}
						</p>
					</div>
					<TextInput
						type="text"
						placeholder="Search..."
						value={fuzzySearchString}
						onChange={e => setFuzzySearchString(e.target.value)}
						className="mb-2"
					/>
					<div className="flex items-center gap-2">
						{!countedRemainingTags.length && (
							<p className="text-text-tag text-sm">No tags</p>
						)}
						{!!countedRemainingTags.length && (
							<div className="flex flex-col items-start gap-4">
								<div className="flex items-start gap-2">
									<span className="text-text-tag mt-1 text-sm">Tags: </span>
									<div className="flex flex-wrap gap-2">
										{tagsForFilter.map(tag => (
											<span
												key={tag}
												className="bg-control-bg flex items-center gap-0.5 rounded-full px-2 py-1"
											>
												<p className="text-sm">#{tag}</p>
												{
													<button
														// On hover, change background drop-shadow instead of text color
														className="text-text-tag [&:hover]:bg-control-bg-strong size-4 cursor-pointer rounded-sm p-1 align-middle text-sm leading-0.5 transition-colors"
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
											className="bg-control-bg-subtle [&:hover]:bg-control-bg cursor-pointer rounded-full px-2 py-1 transition-colors"
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
											setBlogPostType(type as ProcessedBlogPost['type'], value)
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
