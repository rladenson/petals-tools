export type PKMember = {
	id: string;
	uuid: string;
	name: string;
	display_name: string | null;
	server_avatar_url: string | null | undefined;
	server_display_name: string | null | undefined;
	server_keepproxy: boolean | null | undefined;
	loaded: boolean;
};
