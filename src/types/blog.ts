export interface Blog {
	Answers: number;
	AudioMetas: number;
	Audios: number;
	BlogType: number;
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
	OriginalBlogType: number;
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
}

// TODO: add other types of posts, eg image posts, answers, conversations
export type BlogPost = BlogText;

// Merged from examples of private blog, likes, and public blog
export interface BlogText {
	// Required fields common to all types
	date: string; // "Thu, 30 Jan 2025 11:07:36" or "2025-05-15 18:31:07 GMT"
	id: string; // "7741146463634667009"
	'reblog-key': string; // "H34s8Fsad"
	tags: string[]; // []
	type: 'regular' | 'text'; // String literal types

	// Optional fields that may not be present in all types
	format?: string; // "html" - not present in Likes
	'date-gmt'?: string; // "2025-01-30 16:07:36 GMT"
	'downloaded-media-files'?: string[]; // ["6fa382268369aa0231e2ea24.jpg"]
	downloaded_media_files?: string[]; // Private blog uses underscore format
	'regular-body'?: string; // Normal blog and Likes
	body?: string; // Private blog uses "body" instead of "regular-body"
	'regular-title'?: string; // ""
	slug?: string; // "something-happening"
	'unix-timestamp'?: number; // 1738253256
	timestamp?: number; // Private blog uses "timestamp"
	url?: string; // "https://example-blog.tumblr.com/post/7741146463634667009"
	'url-with-slug'?: string; // Full URL with slug

	// Private blog specific fields
	post_html?: string;
	post_url?: string;
	posted_on_tooltip?: string;
	reblogged_from_name?: string;
	reblogged_from_title?: string;
	reblogged_from_url?: string;
	reblogged_root_name?: string;
	reblogged_root_title?: string;
	reblogged_root_url?: string;
	summary?: string;
	title?: string;
}
