import classNames from 'classnames';
import Loader from 'Components/Loader';
import UnsafeContent from 'Components/UnsafeContent';
import { useEffect, useState } from 'react';

interface BlogPostPhotoProps {
	photo: {
		urls: string[];
		layoutSpan?: number;
		caption?: string;
	};
	transformMediaUrl: (
		urls: string[]
	) => Promise<{ original: string; transformed: string }>;
}

const BlogPostPhoto = ({ photo, transformMediaUrl }: BlogPostPhotoProps) => {
	const [mediaInfo, setMediaInfo] = useState<{
		original: string;
		transformed: string;
	} | null>(null);

	useEffect(() => {
		transformMediaUrl(photo.urls).then(mediaInfo => {
			setMediaInfo(mediaInfo);
		});
	}, [photo.urls, transformMediaUrl]);

	return mediaInfo ? (
		<div
			className={classNames({
				'w-full': !photo.layoutSpan || photo.layoutSpan === 1,
				'w-1/2': photo.layoutSpan === 2,
				'w-1/3': photo.layoutSpan === 3,
				'w-1/4': photo.layoutSpan === 4,
			})}
		>
			<img
				key={photo.urls[0]}
				className={classNames('w-full py-1', {
					'px-1': photo.layoutSpan && photo.layoutSpan > 1,
				})}
				data-src={mediaInfo?.original}
				src={mediaInfo?.transformed || mediaInfo?.original}
			/>
			{photo.caption && <UnsafeContent content={photo.caption} />}
		</div>
	) : (
		<div className="flex h-20 w-full items-center justify-center">
			<Loader type="spinner" size={20} />
		</div>
	);
};

export default BlogPostPhoto;
