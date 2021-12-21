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
    this.makeHeader();
    let list = await this.getSystemList();
    for(let member of list) {
      while(this.lock) await this.wait(1);
      this.lock = true;
      setTimeout(() => this.lock = false, 600);
      console.log(member.name);
      this.memberEmitter.emit(this.http
        .get<PKMember>(this.apiURL + '/members/' + member.id + '/guilds/' + this.get('serverID'), {'headers': this.headers})
        .pipe(map(data => data), catchError(this.handleError)));
    }
    this.memberEmitter.emit('done');
  }

  async getServerSettings(memberID: string) {
    this.makeHeader();
    while(this.lock) await this.wait(1);
    this.http
      .get<any>(this.apiURL + '/members/' + memberID + '/guilds/' + this.get('serverID'), {'headers': this.headers})
      .subscribe(data => {
        this.memberEmitter.emit(JSON.stringify({
          memberID: memberID,
          display_name: data.display_name,
          avatar_url: data.avatar_url
        }));
      }, err => {
        if(err.error.code === 20010) {
          this.memberEmitter.emit(JSON.stringify({
            memberID: memberID,
            display_name: null,
            avatar_url: null
          }));
        }
      });
  }

  makeHeader() {
    this.headers = new HttpHeaders()
      .set('Authorization', this.get('token'));
  }

  private handleError(res: HttpErrorResponse | any) {
    //TODO send to serverset and turn into snackbar
    //TODO get more error detail
    console.error(res.error || res.body.error);
    if(res.error.code === 20010) {
      this.memberEmitter.emit()
      console.log(1);
    } else {
      console.log(2);
    }
    return observableThrowError(res.error || 'Server error');
  }

  constructor( private http: HttpClient ) {}
}
