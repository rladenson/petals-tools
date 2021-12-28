export interface PKMember {
  id: string;
  uuid: string;
  name: string;
  display_name: string | null;
}

export class systemGuildSettingsModel {
  constructor(
    public proxying_enabled?: boolean,
    public autoproxy_mode?: string,
    public autoproxy_member?: string,
    public tag?: string | null,
    public tag_enabled?: boolean
  ) {  }
}

export class memberGuildSettingsModel {
  constructor(
    display_name?: string,
    avatar_url?: string
  ) { }
}
