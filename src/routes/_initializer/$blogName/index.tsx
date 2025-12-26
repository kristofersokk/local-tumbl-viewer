import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Blog from 'Components/Blog/Blog';
import Loader from 'Components/Loader';
import Center from 'Components/utils/Center';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';
import { useCallback, useEffect } from 'react';

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

	const isFetching = isFetchingRootFolders || isFetchingBlogs;

	if (isFetching) {
		return (
			<Center>
				<Loader type="pacman" size={60} />
			</Center>
		);
	}

	if (!blog) {
		return null;
	}

	return <Blog blog={blog} goToBlogSelection={goToBlogSelection} />;
}
