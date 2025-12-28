import { memo, useState } from 'react';

import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { ProcessedBlogPost } from 'Types/blog';
import { countCollapsedTags } from 'Utils/blogPostUtils';

interface BlogPostFooterProps {
	post: ProcessedBlogPost;
	params: BlogDeferredParams;
	addTagFilter: (tag: string) => void;
}

const BlogPostFooter = ({
	post,
	params,
	addTagFilter,
}: BlogPostFooterProps) => {
	const { showTags } = params;

	const tagsCollapsedCount = countCollapsedTags(post, 100);
	const tagsNeedCollapsing = post.tags.length > tagsCollapsedCount;
	const [tagsCollapsed, setTagsCollapsed] = useState(true);
	const tagsShown =
		tagsNeedCollapsing && tagsCollapsed
			? post.tags.slice(0, tagsCollapsedCount)
			: post.tags;

	return (
		<div className="flex flex-wrap overflow-hidden px-2 pt-1 pb-3">
			{!!post.tags.length && showTags && (
				<>
					{tagsShown.map(tag => (
						<span
							key={tag}
							className="text-text-tag cursor-pointer px-2 py-0.5 text-sm [&:hover]:underline"
							onClick={() => addTagFilter(tag)}
						>
							#{tag}
						</span>
					))}
					{tagsNeedCollapsing && tagsCollapsed && (
						<button
							className="cursor-pointer pl-2 text-sm text-nowrap [&:hover]:underline"
							onClick={() => setTagsCollapsed(false)}
						>
							Show more
						</button>
					)}
					{tagsNeedCollapsing && !tagsCollapsed && (
						<button
							className="cursor-pointer pl-2 text-sm text-nowrap [&:hover]:underline"
							onClick={() => setTagsCollapsed(true)}
						>
							Show less
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default memo(BlogPostFooter, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.params === nextProps.params
	);
});
