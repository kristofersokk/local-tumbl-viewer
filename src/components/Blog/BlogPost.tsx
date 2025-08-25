import Link from 'Assets/icons/link.svg?react';
import classNames from 'classnames';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useWindowSize from 'Hooks/useWindowSize';
import { Tooltip } from 'radix-ui';
import { ComponentProps, memo, ReactNode, RefObject, useState } from 'react';
import { BlogPost as BlogPostType } from 'Types/blog';
import { blogPostProcessors, countCollapsedTags } from 'Utils/blogUtils';
import UnsafeContent from '../UnsafeContent';
import Collapsible from './Collapsible';

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
		title,
		url,
		body: dynamicBody,
		summary,
		quote,
		answer,
		conversation,
		link,
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
					'mb-2',
					// eslint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:!h-auto [&_.photoset\_row]:!w-full [&_.photoset\_row_img]:!w-full',
					'[&_.photoset\\_row]:!h-auto [&_.photoset\\_row]:!w-full [&_.photoset\\_row_img]:!w-full',
					'[&_.tmblr-full_img]:!w-full',
					'[&_.image]:!w-full',
					'[&_figure_img]:!w-full',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:p-2',
					'[&_img]:my-4 [&_img]:!h-auto',
					// eslint-disable-next-line no-useless-escape
					'[&_.npf\_chat]:font-Tinos [&_.npf\_chat_*]:font-Tinos [&_.npf\_chat]:!my-0 [&_.npf\_chat]:text-lg [&_.npf\_chat:has(br)]:h-3',
					'[&_.npf\\_chat]:font-Tinos [&_.npf\\_chat_*]:font-Tinos [&_.npf\\_chat]:!my-0 [&_.npf\\_chat]:text-lg [&_.npf\\_chat:has(br)]:h-3',
					// eslint-disable-next-line no-useless-escape
					'[&_.npf\_quote]:font-Tinos [&_.npf\_quote]:text-2xl',
					'[&_.npf\\_quote]:font-Tinos [&_.npf\\_quote]:text-2xl',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2 [&_h1]:text-3xl',
					'[&_h2]:mx-4 [&_h2]:my-2 [&_h2]:text-2xl',
					'[&_h3]:mx-4 [&_h3]:my-2 [&_h3]:text-xl',
					'[&_h4]:mx-4 [&_h4]:my-2 [&_h4]:text-lg',
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
					<UnsafeContent
						content={dynamicBody || ''}
						domProcessors={blogPostProcessors}
					/>
				) : (
					content
				)}
			</div>
		);
	};

	const quoteFontSize = quote
		? (() => {
				const length = quote.quote.length;
				if (length > 250) return 'text-xl';
				if (length > 120) return 'text-2xl';
				if (length > 70) return 'text-3xl';
				return 'text-4xl';
			})()
		: undefined;
	const quoteBody = quote ? (
		<div className="px-4">
			<UnsafeContent
				tag="h1"
				content={quote.quote}
				className={classNames('font-Tinos', {
					'text-4xl': quoteFontSize === 'text-4xl',
					'text-3xl': quoteFontSize === 'text-3xl',
					'text-2xl': quoteFontSize === 'text-2xl',
					'text-xl': quoteFontSize === 'text-xl',
				})}
				domProcessors={blogPostProcessors}
			/>
			<UnsafeContent
				tag="p"
				className="mt-2 py-2"
				content={quote.source}
				domProcessors={blogPostProcessors}
			/>
		</div>
	) : undefined;

	const answerBody = answer ? (
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
					content={answer.question}
					domProcessors={blogPostProcessors}
				/>
			</div>
			{renderDynamic(
				<UnsafeContent
					tag="div"
					content={answer.answer}
					domProcessors={blogPostProcessors}
				/>,
				{
					className: 'pt-4',
				}
			)}
		</div>
	) : undefined;

	const conversationBody = conversation ? (
		<div className="[&_*]:font-Tinos mx-4">
			{conversation.title && (
				<h2 className="mb-4 text-2xl font-bold">{conversation.title}</h2>
			)}
			{conversation.utterances.map((utterance, index) => (
				<div key={index} className="mb-4 text-lg">
					{utterance.label && (
						<span className="pr-2 font-bold">
							<strong className="">{utterance.label}</strong>
						</span>
					)}
					<UnsafeContent
						tag="span"
						className="mt-2 [&_*:not(:first-child)]:mt-2"
						content={utterance.phrase}
						domProcessors={blogPostProcessors}
					/>
				</div>
			))}
		</div>
	) : undefined;

	const linkBody = link ? (
		<div className="mx-4">
			<div className="border-blog-post-link-border rounded-lg border-1 transition-colors [&:hover]:bg-gray-700/50">
				<a
					className="cursor-pointer"
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
				>
					<h2 className="px-2 py-3 text-2xl font-bold">{link.text}</h2>
				</a>
			</div>
			<UnsafeContent
				className="mt-2 py-2"
				content={link.description}
				domProcessors={blogPostProcessors}
			/>
		</div>
	) : undefined;

	const showOriginalPoster = rebloggedRoot && rebloggedRoot !== rebloggedFrom;

	const tagsCollapsedCount = countCollapsedTags(post, 100);
	const tagsNeedCollapsing = post.tags.length > tagsCollapsedCount;
	const [tagsCollapsed, setTagsCollapsed] = useState(true);
	const tagsShown =
		tagsNeedCollapsing && tagsCollapsed
			? post.tags.slice(0, tagsCollapsedCount)
			: post.tags;

	return (
		<div
			className="z-blog bg-blog-post-card flex w-full flex-col rounded-md"
			key={post.id}
		>
			{showRebloggedInfo && rebloggedRoot && (
				<div className="flex flex-col gap-2 px-4 pt-3">
					<span>Reblogged from: {rebloggedRoot}</span>
					{showOriginalPoster && <span>Original poster: {rebloggedFrom}</span>}
				</div>
			)}
			<div className="mx-3 my-2 grid grid-cols-[auto_max-content] gap-2">
				<span className="min-w-0 overflow-clip text-sm overflow-ellipsis whitespace-nowrap">
					{title}
				</span>
				<div className="flex items-center gap-2">
					{showPostUrl && url && (
						<a
							href={url}
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
				<Collapsible
					collapsedHeightRem={collapsedHeightRem}
					expandButton={expand => (
						<button
							className="bg-blog-collapse-color/50 [&:hover]:bg-blog-collapse-color-hover/50 absolute right-0 bottom-0 left-0 cursor-pointer p-2 transition-colors"
							onClick={expand}
						>
							Expand
						</button>
					)}
					collapseButton={collapse => (
						<button
							className="mt-2 w-full cursor-pointer bg-gray-700/40 p-2 transition-colors [&:hover]:bg-gray-700/70"
							onClick={collapse}
						>
							Collapse
						</button>
					)}
				>
					{(ref, className) => (
						<div ref={ref as RefObject<HTMLDivElement>} className={className}>
							{renderDynamic(dynamicBody)}
							{quoteBody ?? null}
							{answerBody ?? null}
							{conversationBody ?? null}
							{linkBody ?? null}
							{summary && (
								<div className="text-blog-post-summary mt-2 p-2">{summary}</div>
							)}
						</div>
					)}
				</Collapsible>
			</div>
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
		</div>
	);
};

export default memo(BlogPost, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.params === nextProps.params
	);
});
