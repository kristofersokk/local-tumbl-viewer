import classNames from 'classnames';
import UnsafeContent from 'Components/UnsafeContent';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import useTransformMediaUrl from 'Hooks/useTransformMediaUrl';
import useWindowSize from 'Hooks/useWindowSize';
import {
	ComponentProps,
	CSSProperties,
	memo,
	MouseEvent,
	ReactNode,
	RefObject,
	useMemo,
	useRef,
} from 'react';
import { BlogEntry, CombinedBlogPost, ProcessedBlogPost } from 'Types/blog';
import { getBlogPostProcessors } from 'Utils/blogPostUtils';

import BlogPostPhoto from './BlogPostPhoto';
import Collapsible from './Collapsible';
import { EventCollector } from 'Helpers/eventCollector';

interface BlogPostBodyProps {
	params: BlogDeferredParams;
	blog: BlogEntry;
	post: ProcessedBlogPost;
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	sortedMedia: {
		name: string;
		type: 'video' | 'image';
		post: CombinedBlogPost;
	}[];
	blogKey: number;
	onLoad?: () => void;
	forceUncollapsed?: boolean;
	zoomedIn?: boolean;
	zoomInToMedia?: (media: { name: string; type: 'image' | 'video' }) => void;
}

const BlogPostBody = ({
	params,
	blog,
	post,
	blogFiles,
	sortedMedia,
	onLoad,
	forceUncollapsed,
	zoomedIn = false,
	zoomInToMedia,
}: BlogPostBodyProps) => {
	const { collapsedHeightPercent, fallbackToOnlineMedia } = params;

	const { height: viewportHeightInPixels } = useWindowSize();

	const collapsedHeightPx = Math.floor(
		(collapsedHeightPercent / 100) * viewportHeightInPixels
	);

	const { Name: blogName } = blog.metadata;

	const { body, summary, photo, video, quote, answer, conversation, link } =
		post ?? {};

	const {
		fileEntries: { Entries: imgMappingEntries },
	} = blog;

	const onLoadCollector = useMemo(() => new EventCollector(), []);
	onLoadCollector.setOutput(onLoad);

	const transformMediaUrl = useTransformMediaUrl({
		fallbackToOnlineMedia,
		imgMappingEntries,
		blogFiles,
		blogName,
		sortedMedia,
	});

	const blogPostProcessors = useMemo(
		() => getBlogPostProcessors(transformMediaUrl),
		[transformMediaUrl]
	);

	const renderDynamic = (
		id: string,
		content: string | ReactNode | ReactNode[] | undefined,
		{ className, ...rest }: ComponentProps<'div'> = {}
	) => {
		if (!content) return null;

		return (
			<div
				className={classNames(
					className,
					'mb-2',
					// oxlint-disable-next-line no-useless-escape
					'[&_.photoset\_row]:h-auto! [&_.photoset\_row]:w-full! [&_.photoset\_row_img]:w-full!',
					'[&_.photoset\\_row]:h-auto! [&_.photoset\\_row]:w-full! [&_.photoset\\_row_img]:w-full!',
					'[&_.tmblr-full_img]:w-full!',
					'[&_.image]:w-full!',
					'[&_figure_img]:w-full!',
					'[&_video]:w-full!',
					'[&_.reblog-header]:flex [&_.reblog-header]:items-center [&_.reblog-header]:gap-3 [&_.reblog-header]:px-2 [&_.reblog-header]:py-1',
					'[&_img]:my-4 [&_img]:h-auto!',
					// oxlint-disable-next-line no-useless-escape
					'[&_.npf\_chat]:font-Tinos [&_.npf\_chat_*]:font-Tinos [&_.npf\_chat]:my-0! [&_.npf\_chat]:text-lg [&_.npf\_chat:has(br)]:h-3',
					'[&_.npf\\_chat]:font-Tinos [&_.npf\\_chat_*]:font-Tinos [&_.npf\\_chat]:my-0! [&_.npf\\_chat]:text-lg [&_.npf\\_chat:has(br)]:h-3',
					// oxlint-disable-next-line no-useless-escape
					'[&_.npf\_quote]:font-Tinos [&_.npf\_quote]:text-2xl',
					'[&_.npf\\_quote]:font-Tinos [&_.npf\\_quote]:text-2xl',
					// oxlint-disable-next-line no-useless-escape
					'[&_.npf\_row]:my-2',
					'[&_.npf\\_row]:my-2',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2 [&_h1]:text-3xl',
					'[&_h2]:mx-4 [&_h2]:my-2 [&_h2]:text-2xl',
					'[&_h3]:mx-4 [&_h3]:my-2 [&_h3]:text-xl',
					'[&_h4]:mx-4 [&_h4]:my-2 [&_h4]:text-lg',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
					'[&_blockquote]:border-b-blog-post-separator [&_blockquote]:border-b [&_blockquote]:py-2',
					'[&_figure]:my-2',
					'[&_audio]:my-2',
					'[&_ul]:my-2 [&_ul]:mr-4 [&_ul]:ml-10 [&_ul]:list-outside [&_ul]:list-disc',
					'[&_ol]:my-2 [&_ol]:mr-4 [&_ol]:ml-10 [&_ol]:list-inside [&_ol]:list-decimal',
					'[&_a]:underline [&_a]:transition-colors [&_a:hover]:text-text-highlight',
					'**:first:mt-0 **:last:mb-0',
					{
						'[&_.reblog-header]:hidden': !params.showRebloggedInfo,
						'[&_p]:text-lg': zoomedIn,
					}
				)}
				{...rest}
			>
				{typeof content === 'string' ? (
					<UnsafeContent
						content={content || ''}
						domProcessors={blogPostProcessors}
						onLoad={onLoadCollector.registerInput(id)}
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
				onLoad={onLoadCollector.registerInput('quote')}
			/>
			<UnsafeContent
				tag="p"
				className="mt-2 py-2"
				content={quote.source}
				domProcessors={blogPostProcessors}
				onLoad={onLoadCollector.registerInput('quoteSource')}
			/>
		</div>
	) : undefined;

	const photoBody = photo
		? renderDynamic(
				'photos',
				photo.photos.map(photo => (
					<BlogPostPhoto
						key={photo.urls[0]}
						photo={photo}
						transformMediaUrl={transformMediaUrl}
						blogPostProcessors={blogPostProcessors}
						onLoad={onLoadCollector.registerInput(`photo-${photo.urls[0]}`)}
					/>
				)),
				{ className: 'flex flex-wrap justify-center' }
			)
		: undefined;

	const handleMediaClick = (event: MouseEvent<HTMLDivElement>) => {
		if (!zoomInToMedia) return;
		const target = event.target as HTMLElement;
		const mediaEl = target.closest<HTMLElement>('[data-zoomable-media]');
		const name = mediaEl?.getAttribute('data-zoomable-media');
		if (!name) return;
		zoomInToMedia({ name, type: 'image' });
	};

	const videoBody = video
		? renderDynamic(
				'video',
				<>
					<UnsafeContent
						tag="div"
						content={video.caption ?? ''}
						domProcessors={blogPostProcessors}
						onLoad={onLoadCollector.registerInput('videoCaption')}
					/>
					<UnsafeContent
						tag="div"
						content={video.source ?? ''}
						domProcessors={blogPostProcessors}
						allowIframes
						onLoad={onLoadCollector.registerInput('videoSource')}
					/>
				</>
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
					onLoad={onLoadCollector.registerInput('question')}
				/>
			</div>
			{renderDynamic(
				'answer',
				<UnsafeContent
					tag="div"
					content={answer.answer}
					domProcessors={blogPostProcessors}
					onLoad={onLoadCollector.registerInput('answer')}
				/>,
				{
					className: 'pt-4',
				}
			)}
		</div>
	) : undefined;

	const conversationBody = conversation ? (
		<div className="**:font-Tinos mx-4">
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
						onLoad={onLoadCollector.registerInput(`conversation-${index}`)}
					/>
				</div>
			))}
		</div>
	) : undefined;

	const linkBody = link ? (
		<div className="mx-4">
			<div className="border-blog-post-link-border [&:hover]:bg-control-bg-strong/50 rounded-lg border transition-colors">
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
				onLoad={onLoadCollector.registerInput('linkDescription')}
			/>
		</div>
	) : undefined;

	const mediaFilesBody = body?.showMediaFiles ? (
		<UnsafeContent
			domProcessors={blogPostProcessors}
			className="flex flex-col gap-2"
			content={post.mediaFiles
				.map(media =>
					media.type === 'image'
						? `<img data-src="${media.name}" />`
						: `<video data-src="${media.name}" />`
				)
				.join('')}
			onLoad={onLoadCollector.registerInput('mediaFiles')}
		/>
	) : null;

	const getBody = (
		ref?: RefObject<HTMLElement | null>,
		className?: string,
		style?: CSSProperties
	) => (
		<div
			ref={ref as RefObject<HTMLDivElement>}
			className={className}
			style={style}
			onClick={zoomInToMedia ? handleMediaClick : undefined}
		>
			{renderDynamic('body-content', body?.content)}
			{photoBody ?? null}
			{videoBody ?? null}
			{quoteBody ?? null}
			{answerBody ?? null}
			{conversationBody ?? null}
			{linkBody ?? null}
			{mediaFilesBody ?? null}
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
				{forceUncollapsed || params.layoutMode === 'list' ? (
					getBody()
				) : (
					<Collapsible
						collapsedHeightPx={collapsedHeightPx}
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
								className="bg-control-bg-strong/40 [&:hover]:bg-control-bg-strong/70 mt-2 w-full cursor-pointer p-2 transition-colors"
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

export default memo(BlogPostBody, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.blogKey === nextProps.blogKey &&
		prevProps.params === nextProps.params
	);
});
