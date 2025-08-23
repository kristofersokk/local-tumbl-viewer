import { Blog, BlogPost, BlogType, Platform } from 'Types/blog';

export function getBlogFolderName(blog: Blog | undefined) {
	if (!blog) return undefined;

	const lastIndexOfBackSlash = blog?.FileDownloadLocation?.lastIndexOf('\\');
	const lastIndexOfSlash = blog?.FileDownloadLocation?.lastIndexOf('/');
	if (lastIndexOfBackSlash === undefined || lastIndexOfSlash === undefined)
		return blog.Name;

	const lastIndexOfSeparator = Math.max(lastIndexOfBackSlash, lastIndexOfSlash);
	return blog?.FileDownloadLocation?.substring(lastIndexOfSeparator + 1);
}

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

export const processBlog = (blog: Blog): Blog => {
	const platform = getPlatformFromBlogType(blog.BlogType);
	return { ...blog, platform } satisfies Blog;
};

const transformPostUrl = (url: string | undefined) => {
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

const calculatedCreatedAt = (post: BlogPost): Date | undefined => {
	const timestampStr =
		post.date || post['date-gmt'] || post.timestamp || post['unix-timestamp'];
	if (!timestampStr) return undefined;

	let createdAt: number | undefined = undefined;
	if (typeof timestampStr === 'number') {
		createdAt = timestampStr;
	} else if (/^\d+$/.test(timestampStr)) {
		createdAt = parseInt(timestampStr, 10);
	} else {
		const date = new Date(timestampStr);
		const year = date.getFullYear();
		if (year > 2000) {
			createdAt = date.getTime();
		}
	}
	if (createdAt && createdAt < 1_000_000_000_000) {
		createdAt = createdAt * 1000;
	}
	return createdAt ? new Date(createdAt) : undefined;
};

export const processBlogPost = (post: BlogPost): BlogPost => {
	return {
		...post,
		calculated: {
			createdAt: calculatedCreatedAt(post),
			postTitle: post['regular-title'] || post.title,
			postUrl: transformPostUrl(
				post['url-with-slug'] || post.url || post.post_url
			),
			postBody:
				post['regular-body'] ||
				post.body ||
				post.post_html ||
				post['photo-caption'] ||
				post.caption ||
				'',
			postQuote:
				post.type === 'quote'
					? {
							quote: post['quote-text'] || post.quote_text || '',
							source: post['quote-source'] || post.quote_source || '',
						}
					: undefined,
			postSummary: post.summary,
			rebloggedFrom: post['reblogged-from-name'] || post.reblogged_from_name,
			rebloggedRoot: post['reblogged-root-name'] || post.reblogged_root_name,
		},
	} satisfies BlogPost;
};

export const countAllTags = (
	posts: BlogPost[]
): { tag: string; count: number }[] => {
	const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));
	return allTags.map(tag => {
		const count = posts.filter(p => p.tags?.includes(tag)).length;
		return {
			tag,
			count,
		};
	});
};
