import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ArrowLeft from 'Assets/icons/arrow-left.svg?react';
import Blog from 'Components/Blog/Blog';
import Loader from 'Components/Loader';
import Center from 'Components/utils/Center';
import useBlogFiles from 'Hooks/api/useBlogFiles';
import useBlogPosts from 'Hooks/api/useBlogPosts';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';
import { useCallback, useEffect } from 'react';
import { getBlogFolderName } from 'Utils/blogUtils';

export const Route = createFileRoute('/_initializer/$blogName/')({
	component: BlogRoute,
});

function BlogRoute() {
	const blogName = Route.useParams().blogName;
	const navigate = useNavigate({ from: '/$blogName' });

	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const indexFolder = folders?.find(folder => folder.name === 'Index');
	const { data: blogs, isFetching: isFetchingBlogs } = useBlogs(indexFolder);
	const blog = blogs?.find(blog => blog.metadata.Name === blogName);
	const blogFolderName = getBlogFolderName(blog?.metadata);
	const blogFolderHandle = folders?.find(
		folder => folder.name === blogFolderName
	);
	const { data: blogFiles, isFetching: isFetchingBlogFiles } =
		useBlogFiles(blogFolderHandle);
	const {
		foundBlogPostsFiles,
		query: { data: blogPosts, isFetching: isFetchingBlogPosts },
	} = useBlogPosts(blogFolderHandle, blogFiles);

	const goToBlogSelection = useCallback(() => {
		document.startViewTransition(() => {
			navigate({ to: '..' });
		});
	}, [navigate]);

	useEffect(() => {
		if (blogName && blogs && !blog) {
			goToBlogSelection();
		}
	}, [blogName, blogs, blog, goToBlogSelection]);

	const isFetching =
		isFetchingRootFolders ||
		isFetchingBlogs ||
		isFetchingBlogFiles ||
		isFetchingBlogPosts;

	if (isFetching) {
		return (
			<Center>
				<Loader />
			</Center>
		);
	}

	if (!blog) {
		return null;
	}

	const returnToBlogSelectionButton = (
		<button
			className="fill-text flex cursor-pointer gap-2 rounded-xl bg-gray-800 p-2 transition-colors [&:hover]:bg-gray-700"
			onClick={goToBlogSelection}
		>
			<ArrowLeft />
			<p>Back to Blog Selection</p>
		</button>
	);

	const error =
		!blogFolderName || !blogFolderHandle || !blogFiles
			? "Blog doesn't have a folder for files, try another"
			: !foundBlogPostsFiles.length
				? "Blog doesn't have any post files, try another"
				: !blogPosts?.length
					? "Blog doesn't have any posts, try another"
					: undefined;

	if (error) {
		return (
			<Center className="flex-col gap-6">
				<p>{error}</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	return (
		<Blog
			blog={blog}
			blogFiles={blogFiles!}
			posts={blogPosts!}
			goToBlogSelection={goToBlogSelection}
		/>
	);
}
