import { createFileRoute, useNavigate } from '@tanstack/react-router';
import BlogSelector from 'Components/BlogSelector';
import Loader from 'Components/Loader';
import RootDirResetButton from 'Components/RootDirResetButton';
import Center from 'Components/utils/Center';
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
				<Loader type="pacman" size={60} />
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
		document.startViewTransition(() => {
			navigate({ to: blogName });
		});
	};

	return <BlogSelector blogs={blogs!} selectBlog={selectBlog} />;
}
