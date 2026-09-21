import {
	JsonView,
	allExpanded,
	darkStyles,
	defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

import { ProcessedBlogPost, RawBlogPost } from 'Types/blog';
import useTheme from 'Hooks/useTheme';

interface BlogPostDebugProps {
	post: ProcessedBlogPost;
	rawPost: RawBlogPost;
}

const BlogPostDebug = ({ post, rawPost }: BlogPostDebugProps) => {
	const { theme } = useTheme();
	const jsonViewStyles = theme === 'dark' ? darkStyles : defaultStyles;

	return (
		<div>
			<h2 className="m-3 text-lg font-bold">Raw post</h2>
			<JsonView
				data={rawPost}
				shouldExpandNode={allExpanded}
				style={{
					...jsonViewStyles,
					container: 'text-xs',
				}}
			/>
			<h2 className="m-3 text-lg font-bold">Calculated post</h2>
			<JsonView
				data={post}
				shouldExpandNode={allExpanded}
				style={{
					...jsonViewStyles,
					container: 'text-xs',
				}}
			/>
		</div>
	);
};

export default BlogPostDebug;
