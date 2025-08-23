import Link from 'Assets/icons/link.svg?react';
import classNames from 'classnames';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import { Tooltip } from 'radix-ui';
import { ComponentProps, memo, ReactNode, RefObject } from 'react';
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
		postBody: dynamicPostBody,
		postSummary,
		postQuote,
		postAnswer,
		rebloggedFrom,
		rebloggedRoot,
	} = post.calculated ?? {};

	const renderDynamic = (
		content: string | ReactNode | undefined,
		{ className, ...rest }: ComponentProps<'div'> = {}
	) => {
		if (!content) return null;

		return (
			<div
				className={classNames(
					className,
					// eslint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:!h-auto [&_.photoset\_row]:!w-full [&_.photoset\_row_img]:!w-full',
					'[&_.photoset\\_row]:!h-auto [&_.photoset\\_row]:!w-full [&_.photoset\\_row_img]:!w-full',
					'[&_.tmblr-full_img]:!w-full',
					'[&_.image]:!w-full',
					'[&_figure_img]:!w-full',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:p-2',
					'[&_img]:my-4 [&_img]:!h-auto',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2',
					'[&_h2]:mx-4 [&_h2]:my-2',
					'[&_h3]:mx-4 [&_h3]:my-2',
					'[&_h4]:mx-4 [&_h4]:my-2',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
					'[&_ul]:my-2 [&_ul]:mr-4 [&_ul]:ml-10 [&_ul]:list-outside [&_ul]:list-disc',
					'[&_ol]:my-2 [&_ol]:mr-4 [&_ol]:ml-10 [&_ol]:list-inside [&_ol]:list-decimal',
					'[&_a]:underline [&_a]:transition-colors [&_a:hover]:text-gray-200',
					'[&_*]:first:mt-0 [&_*]:last:mb-0'
				)}
				{...rest}
			>
				{typeof content === 'string' ? (
					<UnsafeContent content={dynamicPostBody || ''} />
				) : (
					content
				)}
			</div>
		);
	};

	const postQuoteFontSize = postQuote
		? (() => {
				const length = postQuote.quote.length;
				if (length > 250) return 'text-xl';
				if (length > 120) return 'text-2xl';
				if (length > 70) return 'text-3xl';
				return 'text-4xl';
			})()
		: undefined;
	const postQuoteBody = postQuote ? (
		<div className="px-4">
			<UnsafeContent
				tag="h1"
				content={postQuote.quote}
				className={classNames('font-Tinos', {
					'text-4xl': postQuoteFontSize === 'text-4xl',
					'text-3xl': postQuoteFontSize === 'text-3xl',
					'text-2xl': postQuoteFontSize === 'text-2xl',
					'text-xl': postQuoteFontSize === 'text-xl',
				})}
			/>
			<UnsafeContent tag="p" className="mt-2 py-2" content={postQuote.source} />
		</div>
	) : undefined;

	const postAnswerBody = postAnswer ? (
		<div>
			<div className="bg-blog-post-question-bg mx-4 p-4">
				<p className="text-text-tag font-light">
					<strong className="text-text-tag">
						{'<'}Unknown{'>'}
					</strong>{' '}
					asked:
				</p>
				<UnsafeContent
					tag="p"
					className="mt-4 [&_*:not(:first-child)]:mt-4"
					content={postAnswer.question}
				/>
			</div>
			{renderDynamic(<UnsafeContent tag="div" content={postAnswer.answer} />, {
				className: 'pt-4',
			})}
		</div>
	) : undefined;

	const showOriginalPoster = rebloggedRoot && rebloggedRoot !== rebloggedFrom;

	return (
		<div
			className="z-blog bg-blog-post-card flex w-full flex-col rounded-md"
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
			<div>
				<BlogPostCollapsible collapsedHeightRem={collapsedHeightRem}>
					{(ref, className) => (
						<div ref={ref as RefObject<HTMLDivElement>} className={className}>
							{renderDynamic(dynamicPostBody)}
							{postQuoteBody ?? null}
							{postAnswerBody ?? null}
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
							className="text-text-tag cursor-pointer px-2 py-0.5 text-sm [&:hover]:underline"
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
