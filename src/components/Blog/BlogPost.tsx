import classNames from 'classnames';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { HTMLAttributes, lazy, Ref, Suspense, useState } from 'react';
import { BlogEntry, CombinedBlogPost } from 'Types/blog';
import BlogPostBody from './BlogPostBody';
import BlogPostFooter from './BlogPostFooter';
import BlogPostHeader from './BlogPostHeader';

const BlogPostDebug = lazy(() => import('./BlogPostDebug'));

interface BlogPostProps {
	Ref?: Ref<HTMLElement | null>;
	containerProps?: HTMLAttributes<HTMLDivElement>;
	post: CombinedBlogPost;
	blog: BlogEntry;
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	sortedMedia: {
		name: string;
		type: 'video' | 'image';
		post: CombinedBlogPost;
	}[];
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	blogKey: number;
	onLoad?: () => void;
	zoomInToPost?: (postId: string) => void;
	zoomInToMedia?: (media: { name: string; type: 'image' | 'video' }) => void;
	forceUncollapsed?: boolean;
	zoomedIn?: boolean;
}

const BlogPost = ({
	Ref,
	containerProps,
	post,
	blog,
	blogFiles,
	sortedMedia,
	addTagFilter,
	params,
	blogKey,
	onLoad,
	zoomInToPost,
	zoomInToMedia,
	forceUncollapsed,
	zoomedIn = false,
}: BlogPostProps) => {
	const [isDebugging, setIsDebugging] = useState(false);

	return (
		<div
			ref={Ref as Ref<HTMLDivElement>}
			{...containerProps}
			className={classNames(
				'z-blog bg-blog-post-card border-blog-post-card-border relative flex w-full flex-col border md:rounded-md',
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
				<Suspense fallback={null}>
					<BlogPostDebug post={post.processed} rawPost={post.raw} />
				</Suspense>
			) : (
				<BlogPostBody
					params={params}
					blog={blog}
					post={post.processed}
					blogFiles={blogFiles}
					sortedMedia={sortedMedia}
					blogKey={blogKey}
					onLoad={onLoad}
					forceUncollapsed={forceUncollapsed}
					zoomedIn={zoomedIn}
					zoomInToMedia={zoomInToMedia}
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
