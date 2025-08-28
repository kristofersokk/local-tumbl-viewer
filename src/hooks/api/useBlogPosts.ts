import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import { jsonrepair } from 'jsonrepair';
import { BlogPost } from 'Types/blog';
import { processBlogPost } from 'Utils/blogUtils';

const useBlogPosts = (
	blogFolderHandle: FileSystemDirectoryHandle | undefined,
	blogFiles: FileSystemFileHandle[] | undefined
) => {
	const blogTextsFile = blogFiles?.find(file => file.name === 'texts.txt');
	const blogImagesFile = blogFiles?.find(file => file.name === 'images.txt');
	const blogVideosFile = blogFiles?.find(file => file.name === 'videos.txt');
	const blogConversationsFile = blogFiles?.find(
		file => file.name === 'conversations.txt'
	);
	const blogAnswersFile = blogFiles?.find(file => file.name === 'answers.txt');
	const blogQuotesFile = blogFiles?.find(file => file.name === 'quotes.txt');
	const blogLinksFile = blogFiles?.find(file => file.name === 'links.txt');

	const foundBlogPostsFiles = [
		blogTextsFile,
		blogImagesFile,
		blogVideosFile,
		blogConversationsFile,
		blogAnswersFile,
		blogQuotesFile,
		blogLinksFile,
	].filter(Boolean);

	const query = useQuery({
		queryKey: [QUERY_KEYS.BLOG_POSTS, blogFolderHandle?.name],
		queryFn: blogFiles
			? async () => {
					const [texts, images, videos, conversations, answers, quotes, links] =
						await Promise.all(
							foundBlogPostsFiles.map(file =>
								file
									.getFile()
									.then(file => file.text())
									.then(text => {
										try {
											return JSON.parse(text) as BlogPost[];
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
										} catch (ignored) {
											return JSON.parse(jsonrepair(text)) as BlogPost[];
										}
									})
									.then(blogs => blogs.map(processBlogPost))
									.catch(() => console.error(`Error reading ${file.name}`))
							)
						);

					return [
						...(texts || []),
						...(images || []),
						...(videos || []),
						...(conversations || []),
						...(answers || []),
						...(quotes || []),
						...(links || []),
					];
				}
			: skipToken,
		staleTime: Infinity,
	});

	return { query, foundBlogPostsFiles };
};

export default useBlogPosts;
