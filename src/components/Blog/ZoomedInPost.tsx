import ClickOutside from 'Components/ClickOutside';
import useBlogFiles from 'Hooks/api/useBlogFiles';
import useRootFolders from 'Hooks/api/useRootFolders';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { BlogEntry, CombinedBlogPost } from 'Types/blog';
import { getBlogFolderName } from 'Utils/blogUtils';
import BlogPost from './BlogPost';

interface ZoomedInPostProps {
	zoomedInPost: CombinedBlogPost | undefined;
	blog: BlogEntry;
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	zoomOut: () => void;
	blogKey: number;
}

const ZoomedInPost = ({
	zoomedInPost,
	blog,
	addTagFilter,
	params,
	zoomOut,
	blogKey,
}: ZoomedInPostProps) => {
	const { data: folders, isPending: isPendingRootFolders } = useRootFolders();
	const blogFolderName = getBlogFolderName(blog?.metadata);
	const blogFolderHandle = folders?.find(
		folder => folder.name === blogFolderName
	);
	const { data: blogFiles, isPending: isPendingBlogFiles } =
		useBlogFiles(blogFolderHandle);

	if (isPendingRootFolders || isPendingBlogFiles) {
		return null;
	}

	return (
		<>
			{zoomedInPost && (
				<div>
					<div className="z-zoomed-post fixed top-0 right-0 bottom-0 left-0 flex justify-center overflow-y-auto overscroll-none [&::-webkit-scrollbar]:hidden">
						<div className="min-h-[calc(100dvh+1px)]">
							<div className="h-fit py-10 pb-16 lg:py-16">
								<div className="h-fit w-160 max-w-[90vw]">
									<ClickOutside onClickOutside={zoomOut}>
										{ref => (
											<BlogPost
												Ref={ref}
												blog={blog}
												post={zoomedInPost}
												blogFiles={blogFiles!}
												addTagFilter={addTagFilter}
												params={params}
												blogKey={blogKey}
												forceUncollapsed
												zoomedIn
											/>
										)}
									</ClickOutside>
								</div>
							</div>
						</div>
					</div>
					<div className="z-zoomed-post-backdrop fixed top-0 right-0 bottom-0 left-0 backdrop-blur-xl backdrop-brightness-75" />
				</div>
			)}
		</>
	);
};

export default ZoomedInPost;
