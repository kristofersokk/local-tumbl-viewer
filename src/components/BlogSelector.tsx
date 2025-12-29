import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { useMemo } from 'react';

import { QUERY_KEYS } from 'Constants/queryKeys';
import { BlogEntry, Platform } from 'Types/blog';

import PlatformLogo from './Blog/PlatformLogo';
import IconButton from './IconButton';
import RootDirResetButton from './RootDirResetButton';
import Tooltip from './Tooltip';

interface BlogSelectorProps {
	blogs: BlogEntry[];
}

const BlogSelector = ({ blogs }: BlogSelectorProps) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate({ from: '/' });

	const sortedBlogs = useMemo(() => {
		return [...blogs].sort(
			(a, b) =>
				a.metadata.platform.localeCompare(b.metadata.platform) ||
				a.metadata.Name.localeCompare(b.metadata.Name)
		);
	}, [blogs]);

	const navigateToAbout = () => {
		document.startViewTransition(() => {
			navigate({ to: '/about' });
		});
	};

	const selectBlog = (blogName: string) => {
		document.startViewTransition(() => {
			navigate({ to: encodeURIComponent(blogName) });
		});
	};

	const refreshBlogs = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOT_FOLDERS] });
		queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
	};

	return (
		<div className="grid h-dvh w-dvw grid-rows-[auto_1fr]">
			<div className="bg-navbar grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5">
				<div className="flex">
					<button
						className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors"
						onClick={navigateToAbout}
					>
						About
					</button>
				</div>
				<h3 className="text-2xl">TumblViewer</h3>
				<div className="flex justify-end gap-2">
					<Tooltip content="Refresh">
						<IconButton icon="refresh" onClick={refreshBlogs} />
					</Tooltip>
					<RootDirResetButton className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg" />
				</div>
			</div>
			<div className="overflow-y-auto">
				<div className="flex flex-col items-center gap-4 px-2 py-8">
					<div className="flex flex-col gap-0.5">
						<p className="mb-2 ml-2">Select a blog</p>
						{sortedBlogs.map(blog => {
							const isSupported = (
								['tumblr', 'bluesky', 'twitter'] satisfies Platform[]
							).includes(blog.metadata.platform);
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
