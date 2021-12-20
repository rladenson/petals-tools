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
  private apiURL = 'https://api.pluralkit.me/v2/systems/@me/members';
  it: number = 0;

  @Output() memberEmitter: EventEmitter<any> = new EventEmitter<any>();

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

  waitFetch(/*url: string, args: any*/): Observable<PKMember[]> {
    const headers = new HttpHeaders()
      .set('Authorization', this.get('token'));
    //TODO vvv
    //while (this.lock) await this.wait(1);
    //this.lock = true;
    //setTimeout(() => this.lock = false, 500);
    return this.http
      .get<PKMember[]>(this.apiURL, {'headers': headers})
      .pipe(map(data => data), catchError(this.handleError));
  }

  getSystemList() {

  }

  private handleError(res: HttpErrorResponse | any) {
    //TODO send to serverset and turn into snackbar
    //TODO get more error detail
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server error');
  }

  constructor( private http: HttpClient ) {}
}
