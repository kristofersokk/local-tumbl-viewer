import classNames from 'classnames';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { HTMLAttributes, Ref, useState } from 'react';
import { BlogEntry, CombinedBlogPost } from 'Types/blog';
import BlogPostBody from './BlogPostBody';
import BlogPostDebug from './BlogPostDebug';
import BlogPostFooter from './BlogPostFooter';
import BlogPostHeader from './BlogPostHeader';

interface BlogPostProps {
	Ref?: Ref<HTMLElement | null>;
	containerProps?: HTMLAttributes<HTMLDivElement>;
	post: CombinedBlogPost;
	blog: BlogEntry;
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	blogKey: number;
	zoomInToPost?: (postId: string) => void;
	forceUncollapsed?: boolean;
	zoomedIn?: boolean;
}

const BlogPost = ({
	Ref,
	containerProps,
	post,
	blog,
	blogFiles,
	addTagFilter,
	params,
	blogKey,
	zoomInToPost,
	forceUncollapsed,
	zoomedIn = false,
}: BlogPostProps) => {
	const [isDebugging, setIsDebugging] = useState(false);

	return (
		<div
			ref={Ref as Ref<HTMLDivElement>}
			{...containerProps}
			className={classNames(
				'z-blog bg-blog-post-card relative flex w-full flex-col md:rounded-md',
				containerProps?.className
			)}
			key={post.processed.id}
		>
			<BlogPostHeader
				post={post.processed}
				params={params}
				zoomInToPost={zoomInToPost}
				isDebugging={isDebugging}
				setIsDebugging={setIsDebugging}
			/>
			{isDebugging ? (
				<BlogPostDebug post={post.processed} rawPost={post.raw} />
			) : (
				<BlogPostBody
					params={params}
					blog={blog}
					post={post.processed}
					blogFiles={blogFiles}
					blogKey={blogKey}
					forceUncollapsed={forceUncollapsed}
					zoomedIn={zoomedIn}
				/>
			)}
			<BlogPostFooter
				post={post.processed}
				params={params}
				addTagFilter={addTagFilter}
			/>
		</div>
	);
};

export default BlogPost;
