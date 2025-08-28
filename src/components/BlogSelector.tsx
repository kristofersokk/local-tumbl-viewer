import classNames from 'classnames';
import { BlogEntry } from 'Types/blog';
import PlatformLogo from './Blog/PlatformLogo';
import RootDirResetButton from './RootDirResetButton';
import { useNavigate } from '@tanstack/react-router';

interface BlogSelectorProps {
	blogs: BlogEntry[];
	selectBlog: (name: string) => void;
}

const BlogSelector = ({ blogs, selectBlog }: BlogSelectorProps) => {
	const navigate = useNavigate({ from: '/' });

	return (
		<div className="grid h-screen w-screen grid-rows-[auto_1fr]">
			<div className="bg-navbar flex items-center justify-between px-4 py-2.5">
				<button
					className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors"
					onClick={() => navigate({ to: '/about' })}
				>
					About
				</button>
				<h3 className="text-2xl">TumblViewer</h3>
				<RootDirResetButton className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg" />
			</div>
			<div className="overflow-y-auto">
				<div className="flex flex-col items-center gap-4 px-2 py-8">
					<div className="flex flex-col gap-0.5">
						<p className="mb-2 ml-2">Select a blog</p>
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
										isSupported
											? () => selectBlog(blog.metadata.Name)
											: undefined
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
			</div>
		</div>
	);
};

export default BlogSelector;
