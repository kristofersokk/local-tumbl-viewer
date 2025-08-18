import { Blog, BlogType, Platform } from 'Types/blog';

export function getBlogFolderName(blog: Blog | undefined) {
	if (!blog) return undefined;

	const lastIndexOfBackSlash = blog?.FileDownloadLocation?.lastIndexOf('\\');
	const lastIndexOfSlash = blog?.FileDownloadLocation?.lastIndexOf('/');
	if (lastIndexOfBackSlash === undefined || lastIndexOfSlash === undefined)
		return blog.Name;

	const lastIndexOfSeparator = Math.max(lastIndexOfBackSlash, lastIndexOfSlash);
	return blog?.FileDownloadLocation?.substring(lastIndexOfSeparator + 1);
}

export const removeTime = (date: string) => {
	const firstSpace = date.indexOf(' ');

	if (date.endsWith(' GMT')) {
		return date.slice(0, firstSpace);
	}

	const lastSpace = date.lastIndexOf(' ');
	return firstSpace !== -1 && lastSpace !== -1
		? date.slice(firstSpace + 1, lastSpace)
		: date;
};

export const transformPostUrl = (url: string | undefined) => {
	if (!url) return url;

	const regex = /https:\/\/(.+?)\.tumblr\.com\/post\/(.+)/;
	const match = url.match(regex);
	if (match) {
		const blogName = match[1];
		const postId = match[2];
		return `https://tumblr.com/${blogName}/${postId}`;
	}
	return url;
};

export const getPlatformFromBlogType = (blogType: BlogType): Platform =>
	(
		[
			'tumblr',
			'tumblr',
			'instagram',
			'twitter',
			'tumblr',
			'tumblr',
			'tumblr',
			'newtumbl',
			'bluesky',
			'unknown',
		] as Platform[]
	)[blogType] || 'unknown';
