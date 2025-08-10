import classNames from 'classnames';
import { BlogPost as BlogPostType } from 'Types/blog';
import UnsafeContent from '../UnsafeContent';
import BlogPostCollapsible from './BlogPostCollapsible';

const removeTime = (date: string) => {
	const firstSpace = date.indexOf(' ');
	const lastSpace = date.lastIndexOf(' ');
	return firstSpace !== -1 && lastSpace !== -1
		? date.slice(firstSpace + 1, lastSpace)
		: date;
};

interface BlogPostProps {
	text: BlogPostType;
	addTagFilter: (tag: string) => void;
	columnWidthRem: number;
}

const BlogPost = ({ text, addTagFilter, columnWidthRem }: BlogPostProps) => {
	return (
		<div
			className="z-blog flex w-full flex-col rounded-md bg-gray-900"
			key={text.id}
		>
			<div className="m-3 grid grid-cols-[auto_max-content] gap-2">
				<span className="min-w-0 overflow-clip text-sm overflow-ellipsis whitespace-nowrap">
					{text['regular-title'] || text.slug}
				</span>
				<span className="text-sm">{removeTime(text.date)}</span>
			</div>
			<div
				className={classNames([
					'[&_img]:my-4',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2',
					'[&_h2]:mx-4 [&_h2]:my-2',
					'[&_h3]:mx-4 [&_h3]:my-2',
					'[&_h4]:mx-4 [&_h4]:my-2',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
					'[&_*]:first:mt-0 [&_*]:last:mb-0',
				])}
			>
				<BlogPostCollapsible columnWidthRem={columnWidthRem}>
					{(ref, className) => (
						<UnsafeContent
							Ref={ref}
							className={className}
							content={text['regular-body']}
						/>
					)}
				</BlogPostCollapsible>
			</div>
			{!!text.tags?.length && (
				<div className="mx-2 mt-2 flex flex-wrap gap-2">
					{text.tags.map(tag => (
						<span
							key={tag}
							className="cursor-pointer rounded-full bg-gray-800 px-2 py-1 text-sm"
							onClick={() => addTagFilter(tag)}
						>
							#{tag}
						</span>
					))}
				</div>
			)}
			<div className="mx-4 my-2 flex"></div>
		</div>
	);
};

export default BlogPost;
