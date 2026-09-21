import {
	createFileRoute,
	useNavigate,
	useRouter,
} from '@tanstack/react-router';
import Blog from 'Components/Blog/Blog';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';
import { useCallback, useEffect } from 'react';
import { withViewTransition } from 'Utils/viewTransitionUtils';

interface BlogSearch {
	post?: string;
	media?: string;
}

export const Route = createFileRoute('/_initializer/$blogName/')({
	component: BlogRoute,
	validateSearch: (search: Record<string, unknown>): BlogSearch => ({
		post: typeof search.post === 'string' ? search.post : undefined,
		media: typeof search.media === 'string' ? search.media : undefined,
	}),
});

function BlogRoute() {
	const blogName = Route.useParams().blogName;
	const search = Route.useSearch();
	const navigate = useNavigate({ from: '/$blogName/' });
	const router = useRouter();

	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const indexFolder = folders?.find(folder => folder.name === 'Index');
	const { data: blogs, isFetching: isFetchingBlogs } = useBlogs(indexFolder);
	const blog = blogs?.find(blog => blog.metadata.Name === blogName);

	const goToBlogSelection = useCallback(() => {
		withViewTransition(() => {
			void navigate({ to: '..' });
		});
	}, [navigate]);

	useEffect(() => {
		if (blogName && blogs && !blog) {
			goToBlogSelection();
		}
	}, [blogName, blogs, blog, goToBlogSelection]);

	const zoomToPost = useCallback(
		(postId: string) => {
			withViewTransition(() => {
				void navigate({ search: prev => ({ ...prev, post: postId }) });
			});
		},
		[navigate]
	);

	const zoomOutOfPost = useCallback(() => {
		if (search.post) {
			withViewTransition(() => {
				router.history.back();
			});
		}
	}, [search.post, router]);

	const zoomToMedia = useCallback(
		(mediaName: string) => {
			void navigate({
				search: prev => ({ ...prev, media: mediaName }),
				replace: !!search.media,
			});
		},
		[navigate, search.media]
	);

	const zoomOutOfMedia = useCallback(() => {
		if (search.media) {
			router.history.back();
		}
	}, [search.media, router]);

	const isFetching = isFetchingRootFolders || isFetchingBlogs;

	if (isFetching) {
		return null;
	}

	if (!blog) {
		return null;
	}

	return (
		<Blog
			blog={blog}
			goToBlogSelection={goToBlogSelection}
			zoomedPostId={search.post}
			zoomedMediaName={search.media}
			zoomToPost={zoomToPost}
			zoomOutOfPost={zoomOutOfPost}
			zoomToMedia={zoomToMedia}
			zoomOutOfMedia={zoomOutOfMedia}
		/>
	);
}
