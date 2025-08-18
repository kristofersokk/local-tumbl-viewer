import Link from 'Assets/icons/link.svg?react';
import classNames from 'classnames';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import { RefObject } from 'react';
import { BlogPost as BlogPostType } from 'Types/blog';
import { removeTime, transformPostUrl } from 'Utils/blogUtils';
import UnsafeContent from '../UnsafeContent';
import BlogPostCollapsible from './BlogPostCollapsible';

interface BlogPostProps {
	post: BlogPostType;
	addTagFilter: (tag: string) => void;
	params: BlogParams;
}

const BlogPost = ({ post, addTagFilter, params }: BlogPostProps) => {
	const { collapsedHeightRem, showDate, showPostUrl } = params;

	const postTitle = post['regular-title'] || post.title;
	const postUrl = transformPostUrl(
		post.url || post['url-with-slug'] || post.post_url
	);
	const postBody =
		post['regular-body'] ||
		post.body ||
		post.post_html ||
		post['photo-caption'] ||
		post.caption ||
		'';
	const postSummary = post.summary;

	const rebloggedFromName =
		post['reblogged-from-name'] || post.reblogged_from_name;
	const rebloggedRootName =
		post['reblogged-root-name'] || post.reblogged_root_name;
	const showOriginalPoster =
		rebloggedRootName && rebloggedRootName !== rebloggedFromName;
	const showReblogged = true;

	return (
		<div
			className="z-blog flex w-full flex-col rounded-md bg-gray-900"
			key={post.id}
		>
			{showReblogged && rebloggedRootName && (
				<div className="flex flex-col gap-2 px-4 py-3">
					<span>Reblogged from: {rebloggedRootName}</span>
					{showOriginalPoster && (
						<span>Original poster: {rebloggedFromName}</span>
					)}
				</div>
			)}
			<div className="m-3 grid grid-cols-[auto_max-content] gap-2">
				<span className="min-w-0 overflow-clip text-sm overflow-ellipsis whitespace-nowrap">
					{postTitle}
				</span>
				<div className="flex gap-2">
					{showPostUrl && postUrl && (
						<a
							href={postUrl}
							className="fill-text"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Link />
						</a>
					)}
					{showDate && <span className="text-sm">{removeTime(post.date)}</span>}
				</div>
			</div>
			<div
				className={classNames([
					// eslint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:!w-full',
					'[&_.photoset\\_row]:!w-full',
					// eslint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:!h-auto',
					'[&_.photoset\\_row]:!h-auto',
					'[&_.tmblr-full_img]:!w-full',
					'[&_.image]:!w-full',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:p-2',
					'[&_img]:my-4 [&_img]:!h-auto',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2',
					'[&_h2]:mx-4 [&_h2]:my-2',
					'[&_h3]:mx-4 [&_h3]:my-2',
					'[&_h4]:mx-4 [&_h4]:my-2',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
					'[&_a]:transition-colors [&_a:hover]:text-gray-200',
					'[&_*]:first:mt-0 [&_*]:last:mb-0',
				])}
			>
				<BlogPostCollapsible collapsedHeightRem={collapsedHeightRem}>
					{(ref, className) => (
						<div ref={ref as RefObject<HTMLDivElement>} className={className}>
							<UnsafeContent content={postBody} />
							{postSummary && (
								<div className="text-blog-post-summary mt-2 p-2">
									{postSummary}
								</div>
							)}
						</div>
					)}
				</BlogPostCollapsible>
			</div>
			{!!post.tags?.length && (
				<div className="mx-2 mt-2 flex flex-wrap gap-2">
					{post.tags.map(tag => (
						<span
							key={tag}
							className="cursor-pointer rounded-full bg-gray-800 px-2 py-1 text-sm"
							onClick={() => addTagFilter(tag)}
						>
							#{tag}
						</span>
					))}
				</div>
			)}
			<div className="mx-4 my-2 flex"></div>
		</div>
	);
};

export default BlogPost;
