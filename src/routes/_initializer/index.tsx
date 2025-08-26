import { createFileRoute, useNavigate } from '@tanstack/react-router';
import BlogSelector from 'Components/BlogSelector';
import Center from 'Components/Center';
import Loader from 'Components/Loader';
import RootDirResetButton from 'Components/RootDirResetButton';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';

export const Route = createFileRoute('/_initializer/')({
	component: Index,
});

function Index() {
	const navigate = useNavigate({ from: '/' });

	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const indexFolder = folders?.find(folder => folder.name === 'Index');
	const { data: blogs, isFetching: isFetchingBlogs } = useBlogs(indexFolder);

	const isFetching = isFetchingRootFolders || isFetchingBlogs;

	if (isFetching) {
		return (
			<Center>
				<Loader />
			</Center>
		);
	}

	const error = !folders?.length
		? 'No subfolders found.'
		: !indexFolder
			? 'No "Index" folder found.'
			: !blogs?.length
				? 'No blogs found.'
				: undefined;

	if (error) {
		return (
			<Center className="flex flex-col gap-3">
				<p>{error}</p>
				<RootDirResetButton />
			</Center>
		);
	}

	const selectBlog = (blogName: string) => {
		navigate({ to: blogName });
	};

	return (
		<>
			<Center>
				<BlogSelector blogs={blogs!} selectBlog={selectBlog} />
			</Center>
			<button
				className="fixed top-0 left-0 m-4 cursor-pointer rounded-2xl bg-gray-800 px-4 py-2 transition-colors [&:hover]:bg-gray-700"
				onClick={() => navigate({ to: '/about' })}
			>
				About
			</button>
		</>
	);
}
