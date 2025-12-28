export const fileExtensions = {
	image: [
		// images
		'jpeg',
		'jpg',
		'png',
		'webp',
		'gif',
		'bmp',
		'tiff',
		'svg',
		'heic',
		'avif',
		'jfif',
		'apng',
		'ico',
	],
	video: [
		// videos
		'mp4',
		'mov',
		'avi',
		'mkv',
		'flv',
		'wmv',
		'webm',
		'mpeg',
		'mpg',
		'3gp',
		'ogg',
		'm4v',
	],
};

export const allMediaExtensions = Object.values(fileExtensions).flatMap(
	it => it
);
