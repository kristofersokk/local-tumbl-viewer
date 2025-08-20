import { skipToken, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ArrowLeft from 'Assets/icons/arrow-left.svg?react';
import Blog from 'Components/Blog/Blog';
import Center from 'Components/Center';
import { QUERY_KEYS } from 'Constants/queryKeys';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';
import { jsonrepair } from 'jsonrepair';
import { useCallback, useEffect } from 'react';
import { BlogPost } from 'Types/blog';
import { getBlogFolderName, processBlogPost } from 'Utils/blogUtils';

export const Route = createFileRoute('/$blogName/')({
	component: RouteComponent,
});

function RouteComponent() {
	const blogName = Route.useParams().blogName;
	const navigate = useNavigate({ from: '/$blogName' });

	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const indexFolder = folders?.find(folder => folder.name === 'Index');
	const { data: blogs, isFetching: isFetchingBlogs } = useBlogs(indexFolder);
	const blog = blogs?.find(blog => blog.Name === blogName);

	const goToBlogSelection = useCallback(() => {
		navigate({ to: '..' });
	}, [navigate]);

	useEffect(() => {
		if (blogName && blogs && !blog) {
			goToBlogSelection();
		}
	}, [blogName, blogs, blog, goToBlogSelection]);

	const blogFolderName = getBlogFolderName(blog);
	const blogFolder = folders?.find(folder => folder.name === blogFolderName);

	const { data: blogFiles, isFetching: isFetchingBlogFiles } = useQuery({
		queryKey: [QUERY_KEYS.BLOG_FILES, blogFolder?.name],
		queryFn: blogFolder
			? async () =>
					Array.fromAsync(
						blogFolder.values() as AsyncIterable<FileSystemHandle>
					).then(handles =>
						handles.filter(
							(handle): handle is FileSystemFileHandle => handle.kind === 'file'
						)
					)
			: skipToken,
		staleTime: Infinity,
	});

	const blogTextsFile = blogFiles?.find(file => file.name === 'texts.txt');
	const blogImagesFile = blogFiles?.find(file => file.name === 'images.txt');
	const blogVideosFile = blogFiles?.find(file => file.name === 'videos.txt');
	const blogConversationsFile = blogFiles?.find(
		file => file.name === 'conversations.txt'
	);
	const blogAnswersFile = blogFiles?.find(file => file.name === 'answers.txt');

	const { data: blogPosts, isFetching: isFetchingBlogPosts } = useQuery({
		queryKey: [QUERY_KEYS.BLOG_POSTS, blogFolder?.name],
		queryFn: blogFiles
			? async () => {
					const [texts, images, videos, conversations, answers] =
						await Promise.all([
							blogTextsFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing texts.txt')),
							blogImagesFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing images.txt')),
							blogVideosFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing videos.txt')),
							blogConversationsFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing conversations.txt')),
							blogAnswersFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing answers.txt')),
						]);

					return [
						...(texts || []),
						...(images || []),
						...(videos || []),
						...(conversations || []),
						...(answers || []),
					];
				}
			: skipToken,
		staleTime: Infinity,
	});

	const isFetching =
		isFetchingRootFolders ||
		isFetchingBlogs ||
		isFetchingBlogFiles ||
		isFetchingBlogPosts;

	if (isFetching) {
		return (
			<Center>
				<p>Loading...</p>
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

	if (!blogFolderName) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a folder for files, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!blogFolder || !blogFiles) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a folder for files, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!blogTextsFile) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a texts.txt file, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!blogPosts?.length) {
		return (
			<Center className="flex-col gap-6">
				<p>Cannot find blog posts, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	return (
		<Blog blog={blog} posts={blogPosts} goToBlogSelection={goToBlogSelection} />
	);
}
