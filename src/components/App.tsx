import { skipToken, useQuery } from '@tanstack/react-query';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext, useEffect, useState } from 'react';
import { QUERY_KEYS } from 'src/constants/queryKeys';
import { Blog, BlogText } from 'Types/blog';
import { getBlogFolderName } from 'Utils/blogUtils';
import BlogSelector from './BlogSelector';
import BlogTexts from './BlogText/BlogTexts';
import Center from './Center';
import TitleScreen from './TitleScreen';

const App = () => {
	const { rootDirHandle, initialized } = useContext(InitializationContext);

	const { data: folders, isLoading: isLoadingRootFolders } = useQuery({
		queryKey: [QUERY_KEYS.ROOT_FOLDERS, rootDirHandle],
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

	const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
		queryKey: [QUERY_KEYS.BLOGS, indexFolder],
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
									.then(text => JSON.parse(text) as Blog)
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

	const { data: chosenBlogFiles, isLoading: isLoadingChosenBlogFiles } =
		useQuery({
			queryKey: [QUERY_KEYS.BLOG_FILES, chosenBlogFolder],
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

	const { data: chosenBlogTexts, isLoading: isLoadingChosenBlogTexts } =
		useQuery({
			queryKey: [QUERY_KEYS.BLOG_TEXTS, chosenBlogTextsFile],
			queryFn: chosenBlogTextsFile
				? async () =>
						chosenBlogTextsFile
							.getFile()
							.then(file => file.text())
							.then(text => JSON.parse(text) as BlogText[])
				: skipToken,
		});

	if (!initialized) {
		return (
			<Center>
				<TitleScreen />
			</Center>
		);
	}

	const isLoading =
		isLoadingRootFolders ||
		isLoadingBlogs ||
		isLoadingChosenBlogFiles ||
		isLoadingChosenBlogTexts;

	if (isLoading) {
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
				<BlogSelector blogs={blogs} setChosenBlogName={setChosenBlogName} />
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

	if (!chosenBlogTextsFile) {
		return (
			<Center>
				<p>Blog doesn't have a texts.txt file, try another</p>
			</Center>
		);
	}

	if (!chosenBlogTexts?.length) {
		return (
			<Center>
				<p>Cannot find blog texts, try another</p>
			</Center>
		);
	}

	return <BlogTexts blog={chosenBlog} texts={chosenBlogTexts} />;
};

export default App;
