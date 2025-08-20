import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import { jsonrepair } from 'jsonrepair';
import { BlogPost } from 'Types/blog';
import { processBlogPost } from 'Utils/blogUtils';

const useBlogPosts = (
	blogFolder: FileSystemDirectoryHandle | undefined,
	blogFiles: FileSystemFileHandle[] | undefined
) => {
	const blogTextsFile = blogFiles?.find(file => file.name === 'texts.txt');
	const blogImagesFile = blogFiles?.find(file => file.name === 'images.txt');
	const blogVideosFile = blogFiles?.find(file => file.name === 'videos.txt');
	const blogConversationsFile = blogFiles?.find(
		file => file.name === 'conversations.txt'
	);
	const blogAnswersFile = blogFiles?.find(file => file.name === 'answers.txt');

	const foundBlogPostsFiles = [
		blogTextsFile,
		blogImagesFile,
		blogVideosFile,
		blogConversationsFile,
		blogAnswersFile,
	].filter(Boolean);

	const query = useQuery({
		queryKey: [QUERY_KEYS.BLOG_POSTS, blogFolder?.name],
		queryFn: blogFiles
			? async () => {
					const [texts, images, videos, conversations, answers] =
						await Promise.all([
							blogTextsFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing texts.txt')),
							blogImagesFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing images.txt')),
							blogVideosFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing videos.txt')),
							blogConversationsFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing conversations.txt')),
							blogAnswersFile
								?.getFile()
								.then(file => file.text())
								.then(text => jsonrepair(text))
								.then(text => JSON.parse(text) as BlogPost[])
								.then(blogs => blogs.map(processBlogPost))
								.catch(() => console.log('Error parsing answers.txt')),
						]);

					return [
						...(texts || []),
						...(images || []),
						...(videos || []),
						...(conversations || []),
						...(answers || []),
					];
				}
			: skipToken,
		staleTime: Infinity,
	});

	return { query, foundBlogPostsFiles };
};

export default useBlogPosts;
