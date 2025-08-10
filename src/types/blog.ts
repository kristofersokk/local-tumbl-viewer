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

export interface BlogPost {
	date: string; // "Thu, 30 Jan 2025 11:07:36"
	'date-gmt': string; // "2025-01-30 16:07:36 GMT"
	'downloaded-media-files': string[]; // ["39d13eca6f8dfb01247c08be45ae4bcd8b04468c.jpg"]
	format?: string; // "html"
	id: string; // "774114646189867009"
	'reblog-key': string; // "G9pbwBu5"
	'regular-body': string; // pure HTML
	'regular-title': string; // ""
	slug: string; // "joel-had-always-felt-like-a-shadow-in-the-world"
	tags: string[]; // []
	type: string; // "regular"
	'unix-timestamp': number; // 1738253256
	url: string; // "https://gay-transformation.tumblr.com/post/774114646189867009"
	'url-with-slug': string;
}
