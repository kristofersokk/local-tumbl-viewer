import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { QUERY_KEYS } from 'Constants/queryKeys';
import { BlogEntry, Platform } from 'Types/blog';
import { withViewTransition } from 'Utils/viewTransitionUtils';

import PlatformLogo from './Blog/PlatformLogo';
import HeaderPill from './HeaderPill';
import IconButton from './IconButton';
import RootDirResetButton from './RootDirResetButton';
import ThemeToggle from './ThemeToggle';
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
		withViewTransition(() => {
			void navigate({ to: '/about' });
		});
	};

	const selectBlog = (blogName: string) => {
		withViewTransition(() => {
			void navigate({ to: encodeURIComponent(blogName) });
		});
	};

	const refreshBlogs = () => {
		void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOT_FOLDERS] });
		void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
	};

	const {
		needRefresh: [appHasUpdate],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<div className="h-dvh w-dvw">
			<div className="z-sticky max-md:bg-navbar max-md:border-navbar-border max-md:shadow-header fixed top-0 right-0 left-0 flex h-16 justify-between max-md:border-b md:right-3">
				<HeaderPill side="left" className="gap-3">
					<h3 className="text-text-highlight text-xl">TumblViewer</h3>
					<button
						className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors"
						onClick={navigateToAbout}
					>
						About
					</button>
				</HeaderPill>
				<HeaderPill side="right">
					<ThemeToggle />
					{appHasUpdate && (
						<Tooltip content="Update available">
							<IconButton
								icon="download"
								className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
								onClick={() => updateServiceWorker(true)}
							/>
						</Tooltip>
					)}
					<Tooltip content="Refresh">
						<IconButton icon="refresh" onClick={refreshBlogs} />
					</Tooltip>
					<RootDirResetButton className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg" />
				</HeaderPill>
			</div>
			<div className="h-dvh overflow-y-auto pt-16">
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
										'flex items-center gap-4 rounded-md px-2 py-1.5 transition-colors [&:hover]:bg-control-bg-subtle',
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
										<p className="text-text-highlight">{blog.metadata.Name}</p>
										<p>{blog.metadata.Title}</p>
									</div>
									{!isSupported && (
										<p className="text-danger text-xs">Not supported</p>
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
