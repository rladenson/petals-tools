import {EventEmitter, Injectable, Output} from '@angular/core';
import { PKMember } from "./PKMember";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  //TODO
  lock: boolean = false;
  private apiURL = 'https://api.pluralkit.me/v2';
  it: number = 0;
  headers!: HttpHeaders;

  @Output() memberEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() progressEmitter: EventEmitter<any> = new EventEmitter<any>();

  get(key: string): any {
    return localStorage.getItem(key);
  }
  set(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  doAnEmit(value: any) {
    this.it++;
    this.memberEmitter.emit(this.it);
    this.memberEmitter.emit(value);
  }

  // async getList(): PKMember[] {
  //
  //   let members = await this.waitFetch('https://api.pluralkit.me/v2/systems/@me/members', {
  //     headers: {'Authorization': 'ARJeOGMMLk5TrE1JhdtDDeDmdMnxbx08Zj/InvSELmUJ1uNgPgkRU8ej1tPw2SPy'}
  //   });
  //
  //   return Array.of(members);
  // }

  save(name: string, thing: any) {
    localStorage.setItem(name, thing);
  }

  wait(time: number): Promise<any> {
    return new Promise(res => setTimeout(res, time));
  }

  async waitFetch(/*url: string, args: any*/): Promise<PKMember[]> {
    const headers = new HttpHeaders()
      .set('Authorization', this.get('token'));
    while (this.lock) await this.wait(1);
    //TODO vvv
    //while (this.lock) await this.wait(1);
    //this.lock = true;
    //setTimeout(() => this.lock = false, 500);
    return this.http
      .get<PKMember[]>(this.apiURL, {'headers': headers})
      .pipe(map(data => data), catchError(this.handleError))
      .toPromise();
  }

  async getSystemList(): Promise<PKMember[]> {
    this.makeHeader();
    while (this.lock) await this.wait(1);
    return this.http
      .get<PKMember[]>(this.apiURL + '/systems/@me/members', {'headers': this.headers})
      .pipe(map(data => data), catchError(this.handleError))
      .toPromise();
  }

  async getServerSettingsBulk() {
    let list = await this.getSystemList();
    this.it = 0;
    for(let member of list) {
      while(this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.getServerSettings(member, list.length);
    }
  }

  async getServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    this.http
      .get<any>(this.apiURL + '/members/' + member.id + '/guilds/' + this.get('serverID'), {'headers': this.headers})
      .subscribe(data => {
        this.memberEmitter.emit({
          id: member.id,
          name: member.name,
          display_name: data.display_name,
          avatar_url: data.avatar_url
        });
        this.it++;
        this.progressEmitter.emit({progress: this.it/totalMembers*100, membersLeft: totalMembers - this.it});
      }, err => {
        if(err.error.code === 20010) {
            this.memberEmitter.emit({
            id: member.id,
            name: member.name,
            display_name: null,
            avatar_url: null
          });
          this.it++;
          this.progressEmitter.emit({progress: this.it/totalMembers*100, membersLeft: totalMembers - this.it});
        }
      });
  }

  makeHeader() {
    this.headers = new HttpHeaders()
      .set('Authorization', this.get('token'));
  }

  async clearServerSettingsBulk() {
    let list = await this.getSystemList();
    this.it = 0;
    for(let member of list) {
      while(this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 1000);
      await this.clearServerSettings(member, list.length);
    }
  }

  async clearServerSettings(member: PKMember, totalMembers: number) {
    this.makeHeader();
    this.http
      .patch<any>(this.apiURL + '/members/' + member.id + '/guilds/' + this.get('serverID'),
        {display_name: null, avatar_url: null},
        {'headers': this.headers}
      ).pipe(map(data => data), catchError(this.handleError))
      .subscribe(data => console.log(data));
    this.it++;
    this.progressEmitter.emit({progress: this.it/totalMembers*100, membersLeft: totalMembers - this.it});
  }

  private handleError(res: HttpErrorResponse | any) {
    //TODO send to serverset and turn into snackbar
    //TODO get more error detail
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server error');
  }

  constructor( private http: HttpClient ) {}
}
