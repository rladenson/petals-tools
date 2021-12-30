import { Component, OnInit } from '@angular/core';
import { MemberService } from "../member.service";

@Component({
  selector: 'app-serverset',
  templateUrl: './serverset.component.html',
  styleUrls: ['./serverset.component.css']
})
export class ServersetComponent implements OnInit {

  selectedPage: string = "solo";
  lock: boolean = false;
  token: string = '';
  guildID: string = '';
  templates: [string, string][] = [];

  saveToken() {
    this.memberService.set('token', this.token);
  }
  saveGuildID() {
    this.memberService.set('guildID', this.guildID);
  }



  switchTo(page: string): void {
    this.selectedPage = page;
    return;
  }

  constructor(private memberService: MemberService) { }

  ngOnInit(): void {
    this.token = this.memberService.get('token');
    this.guildID = this.memberService.get('guildID');
    this.templates = JSON.parse(this.memberService.get('templates'));
    if (this.templates === null) {
      this.templates = [];
    }
  }

}
