import Loader from 'Components/Loader';
import { useEffect, useState } from 'react';

interface BlogPostPhotoProps {
	url: string;
	transformMediaUrl: (
		url: string
	) => Promise<{ original: string; transformed: string }>;
}

const BlogPostPhoto = ({ url, transformMediaUrl }: BlogPostPhotoProps) => {
	const [mediaInfo, setMediaInfo] = useState<{
		original: string;
		transformed: string;
	} | null>(null);

	useEffect(() => {
		transformMediaUrl(url).then(mediaInfo => {
			setMediaInfo(mediaInfo);
		});
	}, [url, transformMediaUrl]);

	return mediaInfo ? (
		<img
			key={url}
			className="w-full"
			data-src={mediaInfo?.original}
			src={mediaInfo?.transformed || mediaInfo?.original}
		/>
	) : (
		<div className="flex h-20 w-full items-center justify-center">
			<Loader type="spinner" size={20} />
		</div>
	);
};

export default BlogPostPhoto;
