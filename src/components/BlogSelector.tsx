import classNames from 'classnames';
import { BlogEntry } from 'Types/blog';
import PlatformLogo from './Blog/PlatformLogo';
import RootDirResetButton from './RootDirResetButton';

interface BlogSelectorProps {
	blogs: BlogEntry[];
	selectBlog: (name: string) => void;
}

const BlogSelector = ({ blogs, selectBlog }: BlogSelectorProps) => {
	return (
		<div className="flex flex-col items-start gap-4 p-2">
			<RootDirResetButton className="fixed top-4 right-4" />
			<p>Select a blog</p>
			<div className="flex flex-col gap-0.5">
				{blogs.map(blog => {
					const isSupported = blog.metadata.platform === 'tumblr';
					return (
						<div
							className={classNames(
								'flex items-center gap-4 rounded-md px-2 py-1.5 transition-colors [&:hover]:bg-gray-900',
								{
									'cursor-pointer': isSupported,
									'cursor-not-allowed opacity-50': !isSupported,
								}
							)}
							onClick={
								isSupported ? () => selectBlog(blog.metadata.Name) : undefined
							}
							key={blog.metadata.Name}
						>
							<PlatformLogo platform={blog.metadata.platform} />
							<div className="flex flex-col items-start justify-between text-sm">
								<p className="text-white">{blog.metadata.Name}</p>
								<p>{blog.metadata.Title}</p>
							</div>
							{!isSupported && (
								<p className="text-xs text-red-500">Not supported</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default BlogSelector;
