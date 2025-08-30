import classNames from 'classnames';
import UnsafeContent from 'Components/UnsafeContent';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import useTransformMediaUrl from 'Hooks/useTransformMediaUrl';
import useWindowSize from 'Hooks/useWindowSize';
import { ComponentProps, ReactNode, RefObject, useMemo, useRef } from 'react';
import { BlogEntry, BlogPost } from 'Types/blog';
import { getBlogPostProcessors } from 'Utils/blogUtils';
import BlogPostPhoto from './BlogPostPhoto';
import Collapsible from './Collapsible';

interface BlogPostBodyProps {
	params: BlogParams;
	blog: BlogEntry;
	post: BlogPost;
	blogFiles: FileSystemFileHandle[];
	imageUrlsCache: Record<string, { online?: string; local?: string }>;
	generatedObjectUrls: string[];
	forceUncollapsed?: boolean;
}

const BlogPostBody = ({
	params,
	blog,
	post,
	blogFiles,
	imageUrlsCache,
	generatedObjectUrls,
	forceUncollapsed,
}: BlogPostBodyProps) => {
	const { collapsedHeightPercent, fallbackToOnlineMedia } = params;

	const remInPixels = useRemToPixels();
	const { height: viewportHeightInPixels } = useWindowSize();

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	const { Name: blogName } = blog.metadata;

	const {
		body: dynamicBody,
		summary,
		photo,
		quote,
		answer,
		conversation,
		link,
	} = post.calculated ?? {};

	const {
		fileEntries: { Entries: imgMappingEntries },
	} = blog;

	const transformMediaUrl = useTransformMediaUrl({
		imageUrlsCache,
		fallbackToOnlineMedia,
		generatedObjectUrls,
		imgMappingEntries,
		blogFiles,
		blogName,
	});

	const blogPostProcessors = useMemo(
		() => getBlogPostProcessors(transformMediaUrl),
		[transformMediaUrl]
	);

	const renderDynamic = (
		content: string | ReactNode | ReactNode[] | undefined,
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
					'[&_video]:!w-full',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:px-2 [&_.reblog-header]:py-1',
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

	const photoBody = photo
		? renderDynamic(
				photo.urls.map(url => (
					<BlogPostPhoto
						key={url}
						url={url}
						transformMediaUrl={transformMediaUrl}
					/>
				))
			)
		: undefined;

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

	const getBody = (ref?: RefObject<HTMLElement | null>, className?: string) => (
		<div ref={ref as RefObject<HTMLDivElement>} className={className}>
			{renderDynamic(dynamicBody)}
			{photoBody ?? null}
			{quoteBody ?? null}
			{answerBody ?? null}
			{conversationBody ?? null}
			{linkBody ?? null}
			{summary && (
				<div className="text-blog-post-summary mt-2 p-2">{summary}</div>
			)}
		</div>
	);

	const topRef = useRef<HTMLDivElement | null>(null);

	const scrollToTopOfPost = () => {
		topRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<>
			<div ref={topRef} className="absolute -top-30" />
			<div>
				{forceUncollapsed ? (
					getBody()
				) : (
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
								onClick={() => {
									collapse?.();
									scrollToTopOfPost();
								}}
							>
								Collapse
							</button>
						)}
					>
						{getBody}
					</Collapsible>
				)}
			</div>
		</>
	);
};

export default BlogPostBody;
