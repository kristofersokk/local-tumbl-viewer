import classNames from 'classnames';
import { RefObject } from 'react';
import { BlogText as BlogTextType } from 'Types/blog';
import UnsafeContent from '../UnsafeContent';
import BlogTextCollapsible from './BlogTextCollapsible';

interface BlogTextProps {
	text: BlogTextType;
}

const BlogText = ({ text }: BlogTextProps) => {
	return (
		<div
			className="z-blog w-[30rem] max-w-full rounded-md bg-gray-900"
			key={text.id}
		>
			<div className="m-2 mt-3 flex justify-end gap-2">
				<span className="text-sm">{text.date}</span>
			</div>
			<div
				className={classNames([
					'my-2',
					'[&_img]:my-4',
					'[&_p]:mx-4 [&_p]:my-2',
					'[&_h1]:mx-4 [&_h1]:my-2',
					'[&_h2]:mx-4 [&_h2]:my-2',
					'[&_h3]:mx-4 [&_h3]:my-2',
					'[&_h4]:mx-4 [&_h4]:my-2',
					'[&_h5]:mx-4 [&_h5]:my-2',
					'[&_h6]:mx-4 [&_h6]:my-2',
				])}
			>
				<BlogTextCollapsible>
					{(ref, className) =>
						text.format === 'html' ? (
							<UnsafeContent
								Ref={ref}
								className={className}
								content={text['regular-body']}
							/>
						) : (
							<p
								ref={ref as RefObject<HTMLParagraphElement | null>}
								className={className}
							>
								Error: unknown format
							</p>
						)
					}
				</BlogTextCollapsible>
			</div>
			<div className="mx-4 my-2 flex">WIP</div>
		</div>
	);
};

export default BlogText;
