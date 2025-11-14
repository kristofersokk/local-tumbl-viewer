export interface BlogMetadata {
	Answers: number;
	AudioMetas: number;
	Audios: number;
	BlogType: BlogType;
	CatBoxType: number;
	CheckDirectoryForFiles: boolean;
	ChildId: string;
	CollectionId: number;
	Conversations: number;
	CreateAudioMeta: boolean;
	CreatePhotoMeta: boolean;
	CreateVideoMeta: boolean;
	DateAdded: string;
	Description: string;
	DownloadAnswer: boolean;
	DownloadAudio: boolean;
	DownloadCatBox: boolean;
	DownloadConversation: boolean;
	DownloadFrom: null | string;
	DownloadImgur: boolean;
	DownloadLink: boolean;
	DownloadPages: null | string;
	DownloadPhoto: boolean;
	DownloadQuote: boolean;
	DownloadRebloggedPosts: boolean;
	DownloadReplies: boolean;
	DownloadText: boolean;
	DownloadTo: null | string;
	DownloadUguu: boolean;
	DownloadUrlList: boolean;
	DownloadVideo: boolean;
	DownloadVideoThumbnail: boolean;
	DownloadWebmshare: boolean;
	DownloadedAnswers: number;
	DownloadedAudioMetas: number;
	DownloadedAudios: number;
	DownloadedConversations: number;
	DownloadedItemsNew: number;
	DownloadedLinks: number;
	DownloadedPhotoMetas: number;
	DownloadedPhotos: number;
	DownloadedQuotes: number;
	DownloadedTexts: number;
	DownloadedVideoMetas: number;
	DownloadedVideos: number;
	DumpCrawlerData: boolean;
	DuplicateAudios: number;
	DuplicatePhotos: number;
	DuplicateVideos: number;
	FileDownloadLocation: string | undefined;
	FilenameTemplate: string;
	ForceRescan: boolean;
	ForceSize: boolean;
	GroupPhotoSets: boolean;
	LastCompleteCrawl: string;
	LastId: number;
	LatestPost: string;
	Links: null | string;
	Location: string;
	MetadataFormat: number;
	Name: string;
	Notes: null | string;
	NumberOfLinks: number;
	Online: boolean;
	OriginalBlogType: BlogType;
	PageSize: number;
	Password: null | string;
	PhotoMetas: number;
	Photos: number;
	PnjDownloadFormat: string;
	Posts: number;
	Progress: number;
	Quotes: number;
	Rating: number;
	RegExPhotos: boolean;
	RegExVideos: boolean;
	SaveTextsIndividualFiles: boolean;
	SettingsTabIndex: number;
	SkipGif: boolean;
	States: number;
	Tags: null | string;
	Texts: number;
	Title: string;
	TotalCount: number;
	UguuType: number;
	Url: string;
	Version: string;
	VideoMetas: number;
	Videos: number;
	WebmshareType: number;
	ZipCrawlerData: boolean;

	// extra added properties
	platform: Platform;
}

export interface BlogEntry {
	metadata: BlogMetadata;
	fileEntries: BlogFileEntries;
}

export interface BlogFileEntries {
	BlogType: BlogType;
	Location: string;
	Name: string;
	Updates: unknown | null;
	Version: string; // number, eg "6"
	Entries: BlogFileEntry[];
}

export interface BlogFileEntry {
	F?: string; // File
	L?: string; // Local URL
	O?: string; // Online URL
}

export const blogTypes = {
	0: 'tumblr',
	1: 'tmblrpriv',
	2: 'instagram',
	3: 'twitter',
	4: 'tlb',
	5: 'tumblrsearch',
	6: 'tumblrtagsearch',
	7: 'newtumbl',
	8: 'bluesky',
	9: 'all',
} as const;

export const getBlogTypeIndex = (type: ValueOf<typeof blogTypes>): number => {
	return Number(
		Object.entries(blogTypes).find(([, value]) => value === type)?.[0]
	);
};

export type BlogType = keyof typeof blogTypes;

export type Platform =
	| 'tumblr'
	| 'instagram'
	| 'twitter'
	| 'newtumbl'
	| 'bluesky'
	| 'unknown';

export type RawBlogPost =
	| ({ platform: 'tumblr' } & BlogPostTumblr)
	| ({ platform: 'bluesky' } & BlogPostBlueSky)
	| {
			platform: Exclude<Platform, 'tumblr' | 'bluesky'>;
	  };

export interface ProcessedBlogPost {
	platform: Platform;
	id?: string;
	type:
		| 'regular'
		| 'text'
		| 'photo'
		| 'video'
		| 'quote'
		| 'link'
		| 'conversation'
		| 'answer';
	mediaFiles: {
		images: string[];
		videos: string[];
	};
	createdAt?: Date;
	title?: string;
	url?: string;
	tags: string[];
	body?: string;
	summary?: string;
	photo?: {
		photos: { urls: string[]; layoutSpan?: number; caption?: string }[];
	};
	video?: {
		caption?: string;
		source?: string;
	};
	quote?: {
		quote: string;
		source: string;
	};
	answer?: {
		question: string;
		answer: string;
	};
	conversation?: {
		title: string | undefined;
		utterances: {
			label: string;
			name: string;
			phrase: string;
		}[];
	};
	link?: {
		url: string;
		text: string;
		description: string;
	};
	rebloggedFrom?: string;
	rebloggedRoot?: string;
}

export type CombinedBlogPost = {
	raw: RawBlogPost;
	processed: ProcessedBlogPost;
};

// Merged from examples of private blog, likes, and public blog
export interface BlogPostTumblr {
	type:
		| 'regular'
		| 'text'
		| 'photo'
		| 'video'
		| 'conversation'
		| 'answer'
		| 'quote'
		| 'link';
	id: string; // "7741146463634667009"

	date: string; // "Thu, 30 Jan 2025 11:07:36" or "2025-05-15 18:31:07 GMT"
	'date-gmt'?: string; // "2025-01-30 16:07:36 GMT"
	timestamp?: number; // Private blog uses "timestamp"
	'unix-timestamp'?: number; // 1738253256

	'reblog-key': string; // "H34s8Fads"
	tags: string[]; // []
	format?: string; // "html" - not present in Likes
	'downloaded-media-files'?: string[]; // ["6fa382268369aa0231e2ea24.jpg"]
	downloaded_media_files?: string[]; // Private blog uses underscore format
	regular_body?: string; // Normal blog and Likes
	'regular-body'?: string; // Normal blog and Likes
	body?: string; // Private blog uses "body" instead of "regular-body"
	regular_title?: string; // ""
	'regular-title'?: string; // ""
	slug?: string; // "something-happening"
	url?: string; // "https://example-blog.tumblr.com/post/7741146463634667009"
	'url-with-slug'?: string; // Full URL with slug
	post_html?: string;
	'post-html'?: string;
	post_url?: string;
	'post-url'?: string;
	posted_on_tooltip?: string;
	reblogged_from_name?: string;
	'reblogged-from-name'?: string;
	reblogged_from_title?: string;
	'reblogged-from-title'?: string;
	reblogged_from_url?: string;
	'reblogged-from-url'?: string;
	reblogged_root_name?: string;
	'reblogged-root-name'?: string;
	reblogged_root_title?: string;
	'reblogged-root-title'?: string;
	reblogged_root_url?: string;
	'reblogged-root-url'?: string;
	summary?: string;
	title?: string;

	// type photo
	photo_caption?: string;
	'photo-caption'?: string;
	caption?: string;
	photos?: {
		caption: string;
		height: number;
		width: number;
		offset: string; // o1, o2, o3, ...
		'photo-url-75'?: string;
		'photo-url-100'?: string;
		'photo-url-250'?: string;
		'photo-url-400'?: string;
		'photo-url-500'?: string;
		'photo-url-1280'?: string;
	}[];
	'photo-url-75'?: string;
	'photo-url-100'?: string;
	'photo-url-250'?: string;
	'photo-url-400'?: string;
	'photo-url-500'?: string;
	'photo-url-1280'?: string;
	photoset_layout?: string; // 11, 1111, 222
	photoset_photos?: {
		height: number;
		width: number;
		high_res: string;
		low_res: string;
	}[];

	// type video
	video_type?: string; // "tumblr"
	video_url?: string;
	'video-caption'?: string;
	video_caption?: string;
	'video-source'?: string;
	video_source?: string;

	// type conversation
	conversation_title?: string;
	'conversation-title'?: string;
	conversation_text?: string;
	'conversation-text'?: string;
	conversation?: {
		label: string;
		name: string;
		phrase: string;
	}[];

	// type answer
	question?: string;
	answer?: string;

	// type quote
	'quote-source'?: string;
	quote_source?: string;
	'quote-text'?: string;
	quote_text?: string;

	// type link
	link_url?: string;
	'link-url'?: string;
	link_text?: string;
	'link-text'?: string;
	link_description?: string;
	'link-description'?: string;
}

export interface BlogPostBlueSky {
	id: string;
	date: string; // "2024-06-10 15:20:30Z"
	text: string;
	url: string;
}
