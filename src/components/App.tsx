import { skipToken, useQuery } from '@tanstack/react-query';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext, useEffect, useState } from 'react';
import { QUERY_KEYS } from 'src/constants/queryKeys';
import { BlogPost, Blog as BlogType } from 'Types/blog';
import { getBlogFolderName } from 'Utils/blogUtils';
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
						const acquiredBlogs = await Promise.all(
							files.map(file =>
								file
									.getFile()
									.then(file => file.text())
									.then(text => JSON.parse(text) as BlogType)
							)
						);
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

	const chosenBlogPostsFile = chosenBlogFiles?.find(
		file => file.name === 'texts.txt'
	);

	const { data: chosenBlogPosts, isFetching: isFetchingChosenBlogPosts } =
		useQuery({
			queryKey: [QUERY_KEYS.BLOG_TEXTS, chosenBlogPostsFile?.name],
			queryFn: chosenBlogPostsFile
				? async () =>
						chosenBlogPostsFile
							.getFile()
							.then(file => file.text())
							.then(text => JSON.parse(text) as BlogPost[])
				: skipToken,
		});

	const goToBlogSelection = () => {
		setChosenBlogName(undefined);
	};

	const selectBlog = (blogName: string) => {
		setChosenBlogName(blogName);
	};

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

	if (!chosenBlogFolderName) {
		return (
			<Center>
				<p>Blog doesn't have a folder for files, try another</p>
			</Center>
		);
	}

	if (!chosenBlogFolder || !chosenBlogFiles) {
		return null;
	}

	if (!chosenBlogPostsFile) {
		return (
			<Center>
				<p>Blog doesn't have a texts.txt file, try another</p>
			</Center>
		);
	}

	if (!chosenBlogPosts?.length) {
		return (
			<Center>
				<p>Cannot find blog texts, try another</p>
			</Center>
		);
	}

	return (
		<Blog
			blog={chosenBlog}
			texts={chosenBlogPosts}
			goToBlogSelection={goToBlogSelection}
		/>
	);
};

export default App;
