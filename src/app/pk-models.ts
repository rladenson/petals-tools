export class PKMember {
  constructor(
    public id: string,
    public uuid: string,
    public name: string,
    public display_name?: string | null
  ) {}
  public toString(): string {
    return (this.display_name ? this.display_name : this.name) + " (" + this.id + ")";
  }

}

export class PKGroup {
  constructor(
      public id: string,
      public name: string,
      public display_name?: string | null,
      public members: PKMember[] = [],
      public indents?: number,
      public sortOrder?: number[]
  ) {}
  public toString(): string {
    return (this.display_name ? this.display_name : this.name) + " (" + this.id + ")"
  }
}

export class systemGuildSettingsModel {
  constructor(
    public proxying_enabled?: boolean | string,
    public tag?: string | null,
    public tag_enabled?: boolean | string
  ) {}
}

export class autoproxySettingsModel {
  constructor(
      public autoproxy_mode?: string,
      public autoproxy_member?: string,
      public readonly last_latch_timestamp?: string
  ) {
  }
}

export class memberGuildSettingsModel {
  constructor(
    public display_name?: string | null,
    public avatar_url?: string | null
  ) { }
}

export class PKSystem {
  constructor(
      public name: string | null,
  ) {
  }
}
