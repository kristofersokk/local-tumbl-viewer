import useRemToPixels from 'Hooks/useRemToPixels';
import { Blog, BlogText as BlogTextType } from 'Types/blog';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import BlogText from './BlogText';

interface BlogTextsProps {
	blog: Blog;
	texts: BlogTextType[];
}

const BlogTexts = ({ blog, texts }: BlogTextsProps) => {
	const remInPixels = useRemToPixels();

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky sticky top-0 flex h-16 w-full items-center bg-[#111] px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-4">
						<img
							src="https://assets.tumblr.com/images/default_avatar/sphere_closed_64.png"
							className="h-11 w-11 rounded"
						/>
						<div className="flex flex-col items-start justify-between text-sm">
							<p className="text-white">{blog.Name}</p>
							<p>{blog.Title}</p>
						</div>
					</div>
					<a
						href={`https://${blog.Name}.tumblr.com`}
						className="text-sm text-gray-400 transition-colors hover:text-white"
					>
						Visit Blog
					</a>
				</div>
			</div>
			<ResponsiveMasonry
				columnsCountBreakPoints={Object.fromEntries(
					// min width = 20rem
					Array.from(Array(10).keys()).map(i => [
						20 * (i + 1) * remInPixels + i * 16 + 96,
						i + 1,
					])
				)}
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				gutterBreakPoints={{ 0: 16 }}
				className="w-full px-4 py-8 md:px-8 lg:px-12"
			>
				<Masonry>
					{texts.map(text => (
						<BlogText key={text.id} text={text} />
					))}
				</Masonry>
			</ResponsiveMasonry>
		</div>
	);
};

export default BlogTexts;
