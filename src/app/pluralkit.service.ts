import { EventEmitter, Injectable, Output } from '@angular/core';
import { memberGuildSettingsModel, PKMember, systemGuildSettingsModel } from "./pk-models";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PluralKitService {
  lock: boolean = false;
  private apiURL = 'https://api.pluralkit.me/v2';
  private betaAPIURL = 'https://api.beta.pluralkit.me/v2';
  it: number = 0;
  static headers: HttpHeaders;

  @Output() memberEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() progressEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() errorEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() doneEmitter: EventEmitter<any> = new EventEmitter<any>();

  get(key: string): any {
    return localStorage.getItem(key);
  }
  set(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  save(name: string, thing: any) {
    localStorage.setItem(name, thing);
  }

  wait(time: number): Promise<any> {
    return new Promise(res => setTimeout(res, time));
  }

  async getSystemList(): Promise<PKMember[]> {
    this.makeHeader();
    while (this.lock) await this.wait(1);
    return this.http
      .get<PKMember[]>(this.apiURL + '/systems/@me/members', { 'headers': PluralKitService.headers })
      .pipe(map(data => data), catchError(this.handleError))
      .toPromise();
  }

  async getServerSettingsBulk() {
    let list = await this.getSystemList();
    this.it = 0;
    for (let member of list) {
      while (this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.getServerSettings(member, list.length);
    }
  }

  async getServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    this.http
      .get<any>(this.apiURL + '/members/' + member.id + '/guilds/' + PluralKitService.normalizeGuildID(this.get('guildID')), { 'headers': PluralKitService.headers })
      .subscribe(data => {
        this.memberEmitter.emit({
          id: member.id,
          name: member.name,
          display_name: data.display_name,
          avatar_url: data.avatar_url
        });
        this.it++;
        this.progressEmitter.emit({ progress: this.it / totalMembers * 100, membersLeft: totalMembers - this.it });
      }, err => {
        if (err.error.code === 20010) {
          this.memberEmitter.emit({
            id: member.id,
            name: member.name,
            display_name: null,
            avatar_url: null
          });
          this.it++;
          this.progressEmitter.emit({ progress: this.it / totalMembers * 100, membersLeft: totalMembers - this.it });
        }
      });
  }

  makeHeader() {
    PluralKitService.headers = new HttpHeaders()
      .set('Authorization', this.get('token'));
  }

  async clearServerSettingsBulk() {
    let list = await this.getSystemList();
    this.it = 0;
    for (let member of list) {
      while (this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.clearServerSettings(member, list.length);
    }
  }

  async clearServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    this.http
      .patch<any>(this.apiURL + '/members/' + member.id + '/guilds/' + PluralKitService.normalizeGuildID(this.get('guildID')),
        { display_name: null, avatar_url: null },
        { 'headers': PluralKitService.headers }
      ).pipe(map(data => data), catchError(this.handleError))
      .subscribe(data => console.log(data));
    this.it++;
    this.progressEmitter.emit({ progress: this.it / totalMembers * 100, membersLeft: totalMembers - this.it });
  }

  private handleError = (res: HttpErrorResponse | any) => {
    //TODO get more error detail
    this.errorEmitter.emit({ error: res.error });
    return observableThrowError(res.error || 'Server error');
  }

  constructor(private http: HttpClient) { }

  setSystemGuildSettings(model: systemGuildSettingsModel) {
    this.doneEmitter.emit({message: 'Loading...'});
    this.makeHeader();
    let json = JSON.stringify(model);
    if (json.length === 2) {
      this.errorEmitter.emit('You must change some settings');
      throw('You must change some settings');
    }
    let guildID: string = '';
    try {
      guildID = PluralKitService.normalizeGuildID(this.get('guildID'));
    } catch (error: any) {
      this.errorEmitter.emit(error);
    }
    this.http
      .patch<any>(this.apiURL + '/systems/@me/guilds/' + guildID,
        <JSON>model,
        { 'headers': PluralKitService.headers }
      ).pipe(map(data => data), catchError(this.handleError))
      .subscribe(data => this.doneEmitter.emit({
        message: `Finished patching system settings for guild ${guildID}!`,
        data: data
      }));
  }

  public static normalizeGuildID(guild: string): string {
    let guild_id: string;
    if (!Number(guild)) {
      let l = guild.length;
      guild_id = guild.substring(l - (18 * 3) - 2, l - (18 * 2) - 2);
      if (!Number(guild_id)) {
        throw ('Server ID not valid');
      } else {
        return guild_id;
      }
    } else if(guild.length !== 18 ) {
      throw('Server ID not valid');
    } else {
      return guild;
    }
  }

  setMemberGuildSettings(model: memberGuildSettingsModel, memberID: string) {
    this.doneEmitter.emit({message: 'Loading...'});
    this.makeHeader();
    let json = JSON.stringify(model);
    if (json.length === 2) {
      this.errorEmitter.emit('You must change some settings');
      throw('You must change some settings');
    }
    let guildID: string = '';
    try {
      guildID = PluralKitService.normalizeGuildID(this.get('guildID'));
    } catch (error: any) {
      this.errorEmitter.emit(error);
    }
    this.http
      .patch<any>(this.apiURL + '/members/' + memberID + '/guilds/' + guildID,
        <JSON>model,
        {'headers': PluralKitService.headers}
      ).pipe(map(data => data), catchError(this.handleError))
      .subscribe(data => this.doneEmitter.emit({
        message: `Finished patching member ${memberID}'s settings for guild ${guildID}!`,
        data: data
      }));
  }

  async groupSwitch() {
    this.makeHeader();
    this.http
        .get<any>(this.apiURL + '/systems/@me/groups',
            {'headers': PluralKitService.headers}
        ).pipe(map(data => data), catchError(this.handleError))
        .subscribe(async list => {
          this.progressEmitter.emit({done: 0, total: list.length});
          for (let i = 0; i < list.length; i++) {
            let group = list[i];
            let json = {};
            if(group.display_name !== null) {
              json = {
                name: group.display_name,
                display_name: group.name,
                privacy: {
                  name_privacy: "private"
                }
              }
            } else {
              json = {
                privacy: {
                  name_privacy: "private"
                }
              }
            }
            while(this.lock) await this.wait(1);
            this.lock = true;
            setTimeout(() => this.lock = false, 1000);
            this.http
                .patch<any>(this.apiURL + `/groups/${group.id}`,
                    json,
                    {'headers': PluralKitService.headers}
                ).pipe(map(data => data), catchError(this.handleError))
                .subscribe(data => {
                  this.progressEmitter.emit({total: list.length});
                });
          }


        });
  }
}
