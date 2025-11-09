import ClickOutside from 'Components/ClickOutside';
import { BlogDeferredParams } from 'Hooks/useBlogViewSettings';
import { BlogEntry, BlogPost as BlogPostType } from 'Types/blog';
import BlogPost from './BlogPost';

interface ZoomedInPostProps {
	zoomedInPost: BlogPostType | undefined;
	blog: BlogEntry;
	blogFiles: FileSystemFileHandle[];
	addTagFilter: (tag: string) => void;
	params: BlogDeferredParams;
	imageUrlsCache: Record<
		string,
		{
			online?: string;
			local?: string;
		}
	>;
	generatedObjectUrls: string[];
	zoomOut: () => void;
}

const ZoomedInPost = ({
	zoomedInPost,
	blog,
	blogFiles,
	addTagFilter,
	params,
	imageUrlsCache,
	generatedObjectUrls,
	zoomOut,
}: ZoomedInPostProps) => {
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
												blogFiles={blogFiles}
												addTagFilter={addTagFilter}
												params={params}
												imageUrlsCache={imageUrlsCache}
												generatedObjectUrls={generatedObjectUrls}
												forceUncollapsed
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
