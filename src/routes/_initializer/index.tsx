import { createFileRoute } from '@tanstack/react-router';
import BlogSelector from 'Components/BlogSelector';
import RootDirResetButton from 'Components/RootDirResetButton';
import Center from 'Components/utils/Center';
import useBlogs from 'Hooks/api/useBlogs';
import useRootFolders from 'Hooks/api/useRootFolders';

export const Route = createFileRoute('/_initializer/')({
	component: Index,
});

function Index() {
	const { data: folders, isFetching: isFetchingRootFolders } = useRootFolders();
	const indexFolder = folders?.find(folder => folder.name === 'Index');
	const {
		data: blogs,
		isFetching: isFetchingBlogs,
		erroredFileNames,
	} = useBlogs(indexFolder);

	const isFetching = isFetchingRootFolders || isFetchingBlogs;

	if (isFetching) {
		return null;
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
			<Center className="flex h-full flex-col gap-3">
				<p>{error}</p>
				<RootDirResetButton />
			</Center>
		);
	}

	return (
		<>
			{erroredFileNames.length > 0 && (
				<div className="bg-counter text-counter-text z-sticky fixed top-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-center text-xs shadow-lg">
					Failed to load: {erroredFileNames.join(', ')}
				</div>
			)}
			<BlogSelector blogs={blogs!} />
		</>
	);
}
