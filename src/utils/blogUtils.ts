import { Blog } from 'Types/blog';

export function getBlogFolderName(blog: Blog | undefined) {
	if (!blog) return undefined;

	const lastIndexOfBackSlash = blog?.FileDownloadLocation.lastIndexOf('\\');
	const lastIndexOfSlash = blog?.FileDownloadLocation.lastIndexOf('/');
	const lastIndexOfSeparator = Math.max(lastIndexOfBackSlash, lastIndexOfSlash);
	return blog?.FileDownloadLocation.substring(lastIndexOfSeparator + 1);
}
