export interface User {
	username: string;
	email?: string;
	fullname?: string;
	authenticated: boolean;
}

export interface UrlData {
	domain: string;
	favicon?: string;
	thumbnail?: string;
	site_name: string;
}
export interface Content {
	id: string;
	url: string;
	description?: string;
	color: string;
	timestamp: number;
	tags: string[];
	url_data: UrlData;
	"all-children": string[];
}
export interface Tag {
	id: string;
	tagname: string;
	count: number;
}

export interface ApiResponseData {
	message: string;
	success: boolean;
	access_token?: string;
	token_type?: string;
	user?: User;
	content?: Content;
	contents?: Content[];
	count?: number;
	all_children?: string[];
	hits_count?: number;
	hits?: string[];
	tags?: Tag[];
}
