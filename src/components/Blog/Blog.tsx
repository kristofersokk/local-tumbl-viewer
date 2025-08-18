import HomeLogo from 'Assets/icons/home.svg?react';

import useBlogViewSettings from 'Hooks/useBlogViewSettings';
import useRemToPixels from 'Hooks/useRemToPixels';
import { BlogPost as BlogPostType, Blog as BlogType } from 'Types/blog';
import { Masonry } from 'masonic';
import { useMemo } from 'react';
import BlogFiltering from './BlogFiltering';
import BlogPost from './BlogPost';
import BlogSettings from './BlogSettings';
import useWindowSize from 'Hooks/useWindowSize';

interface BlogProps {
	blog: BlogType;
	posts: BlogPostType[];
	goToBlogSelection: () => void;
}

const Blog = ({ blog, posts, goToBlogSelection }: BlogProps) => {
	const remInPixels = useRemToPixels();

	const {
		sorting: { sortingField, sortingDirection },
		filter,
		params,
	} = useBlogViewSettings();
	const { height: viewportHeightInPixels } = useWindowSize();

	const { tagsForFilter, addTagFilter } = filter;
	const { collapsedHeightPercent, columnWidthRem } = params;

	const collapsedHeightRem = Math.floor(
		((collapsedHeightPercent / 100) * viewportHeightInPixels) / remInPixels
	);

	const filteredPosts = useMemo(() => {
		return posts.filter(post =>
			tagsForFilter.length
				? !!post.tags.length &&
					tagsForFilter.every(tag => post.tags.includes(tag))
				: true
		);
	}, [posts, tagsForFilter]);

	const sortedPosts = useMemo(() => {
		const getKey = (post: BlogPostType) => {
			switch (sortingField) {
				case 'createdBy':
					return post.calculated!.createdAt || 0;
				default:
					return 0;
			}
		};
		return filteredPosts.toSorted((a, b) => {
			const aValue = getKey(a);
			const bValue = getKey(b);

			if (aValue < bValue) {
				return sortingDirection === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortingDirection === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}, [filteredPosts, sortingField, sortingDirection]);

	const goHome = () => {
		goToBlogSelection();
	};

	return (
		<div className="min-h-full w-full">
			<div className="z-sticky sticky top-0 bottom-0 flex h-16 w-full items-center justify-between bg-[#111] px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-4">
						<button
							className="fill-text cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-700"
							onClick={() => goHome()}
						>
							<HomeLogo />
						</button>
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
						href={`https://tumblr.com/${blog.Name}`}
						target="_blank"
						className="text-sm text-gray-400 transition-colors [&:hover]:text-gray-300"
					>
						Visit Blog
					</a>
				</div>
				<div className="flex items-center gap-2">
					<BlogFiltering posts={sortedPosts} filter={filter} />
					<BlogSettings params={params} />
				</div>
			</div>
			<div className="w-full px-4 py-8 md:px-8 lg:px-12">
				<Masonry
					key={blog.Name + JSON.stringify(filter)}
					items={sortedPosts}
					render={({ data: post }) => (
						<BlogPost
							key={post.id}
							post={post}
							addTagFilter={addTagFilter}
							params={params}
						/>
					)}
					columnGutter={1 * remInPixels}
					rowGutter={1 * remInPixels}
					columnWidth={columnWidthRem * remInPixels}
					itemHeightEstimate={(collapsedHeightRem + 5) * remInPixels}
					itemKey={post => post.id || post.url || ''}
					scrollFps={12}
					overscanBy={5}
				/>
			</div>
		</div>
	);
};

export default Blog;
