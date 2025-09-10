import { BlogParams } from 'Hooks/useBlogViewSettings';
import { memo, useState } from 'react';
import { BlogPost } from 'Types/blog';
import { countCollapsedTags } from 'Utils/blogUtils';

interface BlogPostFooterProps {
	post: BlogPost;
	params: BlogParams;
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
		<>
			{!!post.tags?.length && showTags && (
				<div className="flex flex-wrap overflow-hidden">
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
				</div>
			)}
			<div className="mx-4 my-2 flex"></div>
		</>
	);
};

export default memo(BlogPostFooter, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.params === nextProps.params
	);
});
