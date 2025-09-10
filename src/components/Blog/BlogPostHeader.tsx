import Icon from 'Components/Icon';
import Tooltip from 'Components/Tooltip';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import { memo, useCallback } from 'react';
import { BlogPost } from 'Types/blog';

interface BlogPostHeaderProps {
	post: BlogPost;
	params: BlogParams;
	zoomInToPost?: (postId: string) => void;
}

const BlogPostHeader = ({
	post,
	params,
	zoomInToPost,
}: BlogPostHeaderProps) => {
	const { showDate, showPostLink, showRebloggedInfo } = params;
	const { createdAt, title, url, rebloggedFrom, rebloggedRoot } =
		post.calculated ?? {};

	const showOriginalPoster = rebloggedRoot && rebloggedRoot !== rebloggedFrom;

	const zoomIn = useCallback(() => {
		zoomInToPost?.(post.id);
	}, [post.id, zoomInToPost]);

	return (
		<div className="flex items-start justify-between">
			<div className="flex flex-col gap-1 px-3 py-2">
				{showRebloggedInfo && rebloggedRoot && (
					<>
						<a
							href={`https://tumblr.com/${rebloggedRoot}`}
							target="_blank"
							rel="noreferrer noopener"
							className="[&:hover>span]:underline"
						>
							From: <span>{rebloggedRoot}</span>
						</a>
						{showOriginalPoster && (
							<a
								href={`https://tumblr.com/${rebloggedFrom}`}
								target="_blank"
								rel="noreferrer noopener"
								className="[&:hover>span]:underline"
							>
								OP: <span>{rebloggedFrom}</span>
							</a>
						)}
					</>
				)}
				{title && (
					<div className="mx-3 my-2 grid grid-cols-[auto_max-content] gap-2">
						<span className="min-w-0 overflow-clip text-sm overflow-ellipsis whitespace-nowrap">
							{title}
						</span>
					</div>
				)}
			</div>
			<div className="m-1 mx-2 flex flex-row-reverse flex-wrap items-center gap-x-2">
				<div className="flex items-center gap-1">
					{showPostLink && url && (
						<a
							href={url}
							className="fill-text [&:hover]:fill-text-highlight p-1"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon icon="link" />
						</a>
					)}
					{zoomInToPost ? (
						<button
							className="fill-text [&:hover]:fill-text-highlight scale-90 cursor-pointer p-1 transition-colors"
							onClick={zoomIn}
						>
							<Icon icon="pan-zoom" />
						</button>
					) : null}
				</div>
				<div>
					{showDate && createdAt && (
						<Tooltip content={createdAt.toLocaleString()}>
							{
								<span className="text-sm">
									{createdAt.toLocaleDateString()}
								</span>
							}
						</Tooltip>
					)}
				</div>
			</div>
		</div>
	);
};

export default memo(BlogPostHeader, (prevProps, nextProps) => {
	return (
		prevProps.post.id === nextProps.post.id &&
		prevProps.params === nextProps.params
	);
});
