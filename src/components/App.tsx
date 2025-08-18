import { skipToken, useQuery } from '@tanstack/react-query';
import ArrowLeft from 'Assets/icons/arrow-left.svg?react';
import { QUERY_KEYS } from 'Constants/queryKeys';
import InitializationContext from 'Contexts/InitializationContext';
import { jsonrepair } from 'jsonrepair';
import { useContext, useEffect, useState } from 'react';
import { BlogPost, Blog as _Blog } from 'Types/blog';
import {
	getBlogFolderName,
	processBlog,
	processBlogPost,
} from 'Utils/blogUtils';
import Blog from './Blog/Blog';
import BlogSelector from './BlogSelector';
import Center from './Center';
import TitleScreen from './TitleScreen';

const App = () => {
	const { rootDirHandle, initialized } = useContext(InitializationContext);

	const { data: folders, isFetching: isFetchingRootFolders } = useQuery({
		queryKey: [QUERY_KEYS.ROOT_FOLDERS, rootDirHandle?.name],
		queryFn: rootDirHandle
			? async () =>
					Array.fromAsync(rootDirHandle.values()).then(handles =>
						handles.filter(
							(handle): handle is FileSystemDirectoryHandle =>
								handle.kind === 'directory'
						)
					)
			: skipToken,
	});

	const indexFolder = folders?.find(folder => folder.name === 'Index');

	const { data: blogs, isFetching: isFetchingBlogs } = useQuery({
		queryKey: [QUERY_KEYS.BLOGS, indexFolder?.name],
		queryFn: indexFolder
			? async () =>
					Array.fromAsync(
						indexFolder.values() as AsyncIterable<FileSystemHandle>
					).then(async handles => {
						const files = handles
							.filter(
								(handle): handle is FileSystemFileHandle =>
									handle.kind === 'file'
							)
							.filter(file => !file.name.includes('_files'));
						const acquiredBlogs = (
							await Promise.all(
								files.map(file =>
									file
										.getFile()
										.then(file => file.text())
										.then(text => JSON.parse(text) as _Blog)
										.then(processBlog)
										.catch(() => undefined)
								)
							)
						).filter(blog => blog !== undefined);
						return acquiredBlogs;
					})
			: skipToken,
	});

	const [chosenBlogName, setChosenBlogName] = useState<string>();
	const chosenBlog = blogs?.find(blog => blog.Name === chosenBlogName);

	useEffect(() => {
		if (chosenBlogName && !chosenBlog) {
			setChosenBlogName(undefined);
		}
	}, [chosenBlogName, chosenBlog]);

	const chosenBlogFolderName = getBlogFolderName(chosenBlog);
	const chosenBlogFolder = folders?.find(
		folder => folder.name === chosenBlogFolderName
	);

	const { data: chosenBlogFiles, isFetching: isFetchingChosenBlogFiles } =
		useQuery({
			queryKey: [QUERY_KEYS.BLOG_FILES, chosenBlogFolder?.name],
			queryFn: chosenBlogFolder
				? async () =>
						Array.fromAsync(
							chosenBlogFolder.values() as AsyncIterable<FileSystemHandle>
						).then(handles =>
							handles.filter(
								(handle): handle is FileSystemFileHandle =>
									handle.kind === 'file'
							)
						)
				: skipToken,
		});

	const chosenBlogTextsFile = chosenBlogFiles?.find(
		file => file.name === 'texts.txt'
	);
	const chosenBlogImagesFile = chosenBlogFiles?.find(
		file => file.name === 'images.txt'
	);
	const chosenBlogVideosFile = chosenBlogFiles?.find(
		file => file.name === 'videos.txt'
	);
	const chosenBlogConversationsFile = chosenBlogFiles?.find(
		file => file.name === 'conversations.txt'
	);
	const chosenBlogAnswersFile = chosenBlogFiles?.find(
		file => file.name === 'answers.txt'
	);

	const { data: chosenBlogPosts, isFetching: isFetchingChosenBlogPosts } =
		useQuery({
			queryKey: [QUERY_KEYS.BLOG_POSTS, chosenBlogFolder?.name],
			queryFn: chosenBlogFiles
				? async () => {
						const [texts, images, videos, conversations, answers] =
							await Promise.all([
								chosenBlogTextsFile
									?.getFile()
									.then(file => file.text())
									.then(text => jsonrepair(text))
									.then(text => JSON.parse(text) as BlogPost[])
									.then(blogs => blogs.map(processBlogPost))
									.catch(() => console.log('Error parsing texts.txt')),
								chosenBlogImagesFile
									?.getFile()
									.then(file => file.text())
									.then(text => jsonrepair(text))
									.then(text => JSON.parse(text) as BlogPost[])
									.then(blogs => blogs.map(processBlogPost))
									.catch(() => console.log('Error parsing images.txt')),
								chosenBlogVideosFile
									?.getFile()
									.then(file => file.text())
									.then(text => jsonrepair(text))
									.then(text => JSON.parse(text) as BlogPost[])
									.then(blogs => blogs.map(processBlogPost))
									.catch(() => console.log('Error parsing videos.txt')),
								chosenBlogConversationsFile
									?.getFile()
									.then(file => file.text())
									.then(text => jsonrepair(text))
									.then(text => JSON.parse(text) as BlogPost[])
									.then(blogs => blogs.map(processBlogPost))
									.catch(() => console.log('Error parsing conversations.txt')),
								chosenBlogAnswersFile
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
		});

	if (!initialized) {
		return (
			<Center>
				<TitleScreen />
			</Center>
		);
	}

	const isFetching =
		isFetchingRootFolders ||
		isFetchingBlogs ||
		isFetchingChosenBlogFiles ||
		isFetchingChosenBlogPosts;

	if (isFetching) {
		return (
			<Center>
				<p>Loading...</p>
			</Center>
		);
	}

	if (!blogs?.length) {
		return (
			<Center>
				<p>No blogs found in the index folder.</p>
			</Center>
		);
	}

	const selectBlog = (blogName: string) => {
		setChosenBlogName(blogName);
	};

	if (!chosenBlogName) {
		return (
			<Center>
				<BlogSelector blogs={blogs} selectBlog={selectBlog} />
			</Center>
		);
	}

	if (!chosenBlog) {
		return null;
	}

	const goToBlogSelection = () => {
		setChosenBlogName(undefined);
	};

	const returnToBlogSelectionButton = (
		<button
			className="fill-text flex cursor-pointer gap-2 rounded-xl bg-gray-800 p-2 transition-colors [&:hover]:bg-gray-700"
			onClick={goToBlogSelection}
		>
			<ArrowLeft />
			<p>Back to Blog Selection</p>
		</button>
	);

	if (!chosenBlogFolderName) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a folder for files, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!chosenBlogFolder || !chosenBlogFiles) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a folder for files, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!chosenBlogTextsFile) {
		return (
			<Center className="flex-col gap-6">
				<p>Blog doesn't have a texts.txt file, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	if (!chosenBlogPosts?.length) {
		return (
			<Center className="flex-col gap-6">
				<p>Cannot find blog posts, try another</p>
				{returnToBlogSelectionButton}
			</Center>
		);
	}

	return (
		<Blog
			blog={chosenBlog}
			posts={chosenBlogPosts}
			goToBlogSelection={goToBlogSelection}
		/>
	);
};

export default App;
