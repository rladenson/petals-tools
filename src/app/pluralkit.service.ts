import { EventEmitter, Injectable, Output } from '@angular/core';
import { memberGuildSettingsModel, PKGroup, PKMember, PKSystem, systemGuildSettingsModel, autoproxySettingsModel } from "./pk-models";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LocalService } from "./local.service";

@Injectable({
  providedIn: 'root'
})
export class PluralKitService {
  lock: boolean = false;
  it: number = 0;
  static headers: HttpHeaders;
  liveApiUrl: string = "https://api.pluralkit.me/v2"

  @Output() memberEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() progressEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() errorEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() doneEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpClient, private localService: LocalService) { }

  //API CALLS

  async getGroups(): Promise<Array<PKGroup>> {
    this.makeHeader();
    let apiUrl = this.getUrl();
    while(this.lock) await this.wait(1);
    this.lock = true;
    setTimeout(() => this.lock = false, 1000);
    return this.http
        .get<any>(apiUrl + '/systems/@me/groups', {'headers': PluralKitService.headers })
        .pipe(map(data => {
          let arr: PKGroup[] = [];
          data.forEach((g: any) => {
            arr.push(new PKGroup(g.id, g.name, g.display_name));
          })
          return arr;
        }), catchError(this.handleError))
        .toPromise();
  }

  async getSystemList(): Promise<PKMember[]> {
    this.makeHeader();
    let apiUrl = this.getUrl();
    while (this.lock) await this.wait(1);
    return this.http
      .get<PKMember[]>(apiUrl + '/systems/@me/members', { 'headers': PluralKitService.headers })
      .pipe(map(data => data), catchError(this.handleError))
      .toPromise();
  }

  async getSystem(): Promise<PKSystem> {
    this.makeHeader();
    let apiUrl = this.getUrl();
    while (this.lock) await this.wait(1);
    return this.http
        .get<PKSystem>(apiUrl + '/systems/@me', { 'headers': PluralKitService.headers })
        .pipe(map(data => data), catchError(this.handleError))
        .toPromise();
  }

  async getGroupList(group: string) {
    this.makeHeader();
    let apiUrl = this.getUrl();
    while(this.lock) await this.wait(1);
    this.lock = true;
    setTimeout(() => this.lock = false, 1000);
    return this.http
        .get<any>(apiUrl + '/groups/' + group + '/members', {'headers': PluralKitService.headers})
        .pipe(map(data => data), catchError(this.handleError))
        .toPromise();
  }

  async getServerSettingsBulk(groupOverride?: string) {
    let list = await this.getList(groupOverride);
    for (let member of list) {
      while (this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.getServerSettings(member, list.length);
    }
  }

  async getServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    let apiUrl = this.getUrl();
    this.http
      .get<any>(apiUrl + '/members/' + member.id + '/guilds/' + PluralKitService.normalizeGuildID(this.localService.get('guildID')), { 'headers': PluralKitService.headers })
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
        } else {
          this.handleError(err);
        }
      });
  }

  async clearServerSettingsBulk(groupOverride?: string) {
    let list = await this.getList(groupOverride);
    for (let member of list) {
      while (this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.clearServerSettings(member, list.length);
    }
  }

  async clearServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    let apiUrl = this.getUrl();
    this.http
      .patch<any>(apiUrl + '/members/' + member.id + '/guilds/' + PluralKitService.normalizeGuildID(this.localService.get('guildID')),
        { display_name: null, avatar_url: null },
        { 'headers': PluralKitService.headers }
      ).subscribe(data => console.log(data),
          error => {
        if(error.error.code === 20010) {
          console.log(error);
        } else {
          this.handleError(error);
        }
          });
    this.it++;
    this.progressEmitter.emit({ progress: this.it / totalMembers * 100, membersLeft: totalMembers - this.it });
  }

  setSystemGuildSettings(model: systemGuildSettingsModel) {
    this.doneEmitter.emit({message: 'Loading...'});
    this.makeHeader();
    let apiUrl = this.getUrl();
    let json = JSON.stringify(model);
    if (json.length === 2) {
      this.errorEmitter.emit('You must change some settings');
      throw('You must change some settings');
    }
    let guildID: string = '';
    try {
      guildID = PluralKitService.normalizeGuildID(this.localService.get('guildID'));
    } catch (error: any) {
      this.errorEmitter.emit(error);
    }
    this.http
      .patch<any>(apiUrl + '/systems/@me/guilds/' + guildID,
        <JSON>model,
        { 'headers': PluralKitService.headers }
      ).pipe(map(data => data), catchError(this.handleError))
      .subscribe(data => this.doneEmitter.emit({
        message: `Finished patching system settings for guild ${guildID}!`,
        data: data
      }));
  }

  setAutoproxyGuildSettings(model: autoproxySettingsModel) {
    this.doneEmitter.emit({message: 'Loading...'});
    this.makeHeader();
    let apiUrl = this.getUrl();
    let json = JSON.stringify(model);
    if (json.length === 2) {
      this.errorEmitter.emit('You must change some settings');
      throw('You must change some settings');
    }
    let guildID: string = '';
    try {
      guildID = PluralKitService.normalizeGuildID(this.localService.get('guildID'));
    } catch (error: any) {
      this.errorEmitter.emit(error);
    }
    this.http
        .patch<any>(apiUrl + '/systems/@me/autoproxy?guild_id=' + guildID,
            <JSON>model,
            { 'headers': PluralKitService.headers }
        ).pipe(map(data => data), catchError(this.handleError))
        .subscribe(data => this.doneEmitter.emit({
          message: `Finished patching autoproxy settings for guild ${guildID}!`,
          data: data
        }));
  }

  setMemberGuildSettings(model: memberGuildSettingsModel, memberID: string) {
    this.doneEmitter.emit({message: 'Loading...'});
    this.makeHeader();
    let apiUrl = this.getUrl();
    let json = JSON.stringify(model);
    if (json.length === 2) {
      this.errorEmitter.emit('You must change some settings');
      throw('You must change some settings');
    }
    let guildID: string = '';
    try {
      guildID = PluralKitService.normalizeGuildID(this.localService.get('guildID'));
    } catch (error: any) {
      this.errorEmitter.emit(error);
    }
    this.http
      .patch<any>(apiUrl + '/members/' + memberID + '/guilds/' + guildID,
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
    let apiUrl = this.getUrl();
    this.http
        .get<any>(apiUrl + '/systems/@me/groups',
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
                .patch<any>(apiUrl + `/groups/${group.id}`,
                    json,
                    {'headers': PluralKitService.headers}
                ).pipe(map(data => data), catchError(this.handleError))
                .subscribe(() => {
                  this.progressEmitter.emit({total: list.length});
                });
          }


        });
  }

  //UTILITY FUNCTIONS

  async getList(groupOverride?: string): Promise<any> {
    let list;
    if(!groupOverride) {
      list = await this.getSystemList()
    } else {
      list = await this.getGroupList(groupOverride!);
    }
    this.it = 0;
    return list;
  }

  getUrl(): string {
    let apiOverride = this.localService.get('apiOverride');
    return apiOverride !== null ? apiOverride : this.liveApiUrl;
  }

  makeHeader() {
    PluralKitService.headers = new HttpHeaders()
        .set('Authorization', this.localService.get('token'));
  }

  public static normalizeGuildID(guild: string): string {

    let ids: Array<string> | null = guild.match(/\d+/g);
    if(!ids) {
      return "-1";
    } else {
      return ids[0];
    }
  }

  wait(time: number): Promise<any> {
    return new Promise(res => setTimeout(res, time));
  }

  //ERROR HANDLING

  private handleError = (res: HttpErrorResponse | any) => {
   if(res.error.code === 20010) {
     this.errorEmitter.emit({ errorMessage: "20010: Cannot set servername. In order to set a servername this member must either have a prior servername set in designated server or must have had their member card pulled up in designated server."} )
   } else {
     this.errorEmitter.emit({error: res.error});
   }
    return observableThrowError(res.error || 'Server error');
  }
}
