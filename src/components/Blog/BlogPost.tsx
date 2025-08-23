import Link from 'Assets/icons/link.svg?react';
import classNames from 'classnames';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import { Tooltip } from 'radix-ui';
import { memo, RefObject } from 'react';
import { BlogPost as BlogPostType } from 'Types/blog';
import UnsafeContent from '../UnsafeContent';
import BlogPostCollapsible from './BlogPostCollapsible';

interface BlogPostProps {
	post: BlogPostType;
	addTagFilter: (tag: string) => void;
	params: BlogParams;
}

const BlogPost = ({ post, addTagFilter, params }: BlogPostProps) => {
	const {
		collapsedHeightPercent,
		showDate,
		showPostUrl,
		showRebloggedInfo,
		showTags,
	} = params;

	const remInPixels = useRemToPixels();
	const { height: viewportHeightInPixels } = useWindowSize();

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	const {
		createdAt,
		postTitle,
		postUrl,
		postBody,
		postSummary,
		rebloggedFrom,
		rebloggedRoot,
		postQuote,
	} = post.calculated ?? {};

	const postQuoteBody = postQuote
		? `<div class="quote">
									<h1>${postQuote.quote}</h1>
									<p>${postQuote.source}</p>
								</div>`
		: undefined;
	const postQuoteFontSize = postQuote
		? (() => {
				const length = postQuote.quote.length;
				if (length > 250) return 'text-xl';
				if (length > 120) return 'text-2xl';
				if (length > 70) return 'text-3xl';
				return 'text-4xl';
			})()
		: undefined;

	const showOriginalPoster = rebloggedRoot && rebloggedRoot !== rebloggedFrom;

	return (
		<div
			className="z-blog flex w-full flex-col rounded-md bg-gray-900"
			key={post.id}
		>
			{showRebloggedInfo && rebloggedRoot && (
				<div className="flex flex-col gap-2 px-4 py-3">
					<span>Reblogged from: {rebloggedRoot}</span>
					{showOriginalPoster && <span>Original poster: {rebloggedFrom}</span>}
				</div>
			)}
			<div className="m-3 grid grid-cols-[auto_max-content] gap-2">
				<span className="min-w-0 overflow-clip text-sm overflow-ellipsis whitespace-nowrap">
					{postTitle}
				</span>
				<div className="flex items-center gap-2">
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
					{showDate && createdAt && (
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<span className="text-sm">
										{createdAt.toLocaleDateString()}
									</span>
								</Tooltip.Trigger>
								<Tooltip.Portal>
									<Tooltip.Content className="TooltipContent" sideOffset={5}>
										{createdAt.toLocaleString()}
										<Tooltip.Arrow className="TooltipArrow" />
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip.Root>
						</Tooltip.Provider>
					)}
				</div>
			</div>
			<div
				className={classNames(
					// eslint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:!h-auto [&_.photoset\_row]:!w-full [&_.photoset\_row_img]:!w-full',
					'[&_.photoset\\_row]:!h-auto [&_.photoset\\_row]:!w-full [&_.photoset\\_row_img]:!w-full',
					'[&_.tmblr-full_img]:!w-full',
					'[&_.image]:!w-full',
					'[&_figure_img]:!w-full',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:p-2',
					'[&_img]:my-4 [&_img]:!h-auto',
					'[&_.quote_h1]:font-Tinos',
					'[&_.quote_p]:py-2',
					{
						'[&_.quote_h1]:text-4xl': postQuoteFontSize === 'text-4xl',
						'[&_.quote_h1]:text-3xl': postQuoteFontSize === 'text-3xl',
						'[&_.quote_h1]:text-2xl': postQuoteFontSize === 'text-2xl',
						'[&_.quote_h1]:text-xl': postQuoteFontSize === 'text-xl',
					},
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2',
					'[&_h2]:mx-4 [&_h2]:my-2',
					'[&_h3]:mx-4 [&_h3]:my-2',
					'[&_h4]:mx-4 [&_h4]:my-2',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
					'[&_a]:transition-colors [&_a:hover]:text-gray-200',
					'[&_*]:first:mt-0 [&_*]:last:mb-0'
				)}
			>
				<BlogPostCollapsible collapsedHeightRem={collapsedHeightRem}>
					{(ref, className) => (
						<div ref={ref as RefObject<HTMLDivElement>} className={className}>
							{<UnsafeContent content={postBody || postQuoteBody || ''} />}
							{postSummary && (
								<div className="text-blog-post-summary mt-2 p-2">
									{postSummary}
								</div>
							)}
						</div>
					)}
				</BlogPostCollapsible>
			</div>
			{!!post.tags?.length && showTags && (
				<div className="mx-2 mt-2 flex flex-wrap">
					{post.tags.map(tag => (
						<span
							key={tag}
							className="text-text-tag cursor-pointer px-2 py-1 text-sm [&:hover]:underline"
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

export default memo(BlogPost, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.params === nextProps.params
	);
});
