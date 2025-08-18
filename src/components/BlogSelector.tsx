import classNames from 'classnames';
import { Blog } from 'Types/blog';

interface BlogSelectorProps {
	blogs: Blog[];
	selectBlog: (name: string) => void;
}

const BlogSelector = ({ blogs, selectBlog }: BlogSelectorProps) => {
	return (
		<div className="flex flex-col items-start gap-4 p-2">
			<p>Select a blog:</p>
			<div className="flex flex-col gap-0.5">
				{blogs.map(blog => {
					const isSupported = blog.platform === 'tumblr';
					return (
						<div
							className={classNames(
								'flex items-center gap-4 rounded-md px-2 py-1.5 transition-colors [&:hover]:bg-gray-900',
								{
									'cursor-pointer': isSupported,
									'cursor-not-allowed opacity-50': !isSupported,
								}
							)}
							onClick={isSupported ? () => selectBlog(blog.Name) : undefined}
							key={blog.Name}
						>
							<img
								src="https://assets.tumblr.com/images/default_avatar/sphere_closed_64.png"
								className="h-11 w-11 rounded"
							/>
							<div className="flex flex-col items-start justify-between text-sm">
								<p className="text-white">{blog.Name}</p>
								<p>{blog.Title}</p>
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
