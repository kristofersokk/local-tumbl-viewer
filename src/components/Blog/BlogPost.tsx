import classNames from 'classnames';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import { Ref, RefObject } from 'react';
import { BlogEntry, BlogPost as BlogPostType } from 'Types/blog';
import BlogPostBody from './BlogPostBody';
import BlogPostFooter from './BlogPostFooter';
import BlogPostHeader from './BlogPostHeader';

interface BlogPostProps {
	Ref?: RefObject<HTMLElement | null>;
	className?: string;
	post: BlogPostType;
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	addTagFilter: (tag: string) => void;
	params: BlogParams;
	imageUrlsCache: Record<string, { online?: string; local?: string }>;
	generatedObjectUrls: string[];
	zoomInToPost?: (postId: string) => void;
	forceUncollapsed?: boolean;
}

const BlogPost = ({
	Ref,
	className,
	post,
	blog,
	blogFiles,
	addTagFilter,
	params,
	imageUrlsCache,
	generatedObjectUrls,
	zoomInToPost,
	forceUncollapsed,
}: BlogPostProps) => {
	return (
		<div
			ref={Ref as Ref<HTMLDivElement>}
			className={classNames(
				'z-blog bg-blog-post-card relative flex w-full flex-col md:rounded-md',
				className
			)}
			key={post.id}
		>
			<BlogPostHeader post={post} params={params} zoomInToPost={zoomInToPost} />
			<BlogPostBody
				params={params}
				blog={blog}
				post={post}
				blogFiles={blogFiles}
				imageUrlsCache={imageUrlsCache}
				generatedObjectUrls={generatedObjectUrls}
				forceUncollapsed={forceUncollapsed}
			/>
			<BlogPostFooter post={post} params={params} addTagFilter={addTagFilter} />
		</div>
	);
};

export default BlogPost;
