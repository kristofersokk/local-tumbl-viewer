import { createFileRoute, useNavigate } from '@tanstack/react-router';
import BlogSelector from 'Components/BlogSelector';
import Center from 'Components/Center';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';

export const Route = createFileRoute('/')({
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
		navigate({ to: blogName });
	};

	return (
		<Center>
			<BlogSelector blogs={blogs} selectBlog={selectBlog} />
		</Center>
	);
}
