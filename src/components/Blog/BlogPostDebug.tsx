import { JsonView, allExpanded, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

import { BlogPost } from 'Types/blog';

interface BlogPostDebugProps {
	post: BlogPost;
}

const BlogPostDebug = ({ post }: BlogPostDebugProps) => {
	return (
		<div>
			<h2 className="m-3 text-lg font-bold">Post Info</h2>
			<JsonView
				data={post}
				shouldExpandNode={allExpanded}
				style={{
					...darkStyles,
					container: 'text-xs',
				}}
			/>
		</div>
	);
};

export default BlogPostDebug;
