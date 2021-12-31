import { Component, OnInit} from '@angular/core';
import { MemberService } from "../member.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {Title} from "@angular/platform-browser";

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

  constructor(private memberService: MemberService, private snackbar: MatSnackBar, private titleService: Title) { }

  ngOnInit(): void {
    this.token = this.memberService.get('token');
    this.guildID = this.memberService.get('guildID');
    this.templates = JSON.parse(this.memberService.get('templates'));
    if (this.templates === null) {
      this.templates = [];
    }
    this.memberService.errorEmitter.subscribe(error => this.errorSnackbar(error));
    this.memberService.doneEmitter.subscribe(data => this.doneSnackbar(data));
    this.titleService.setTitle('Petals Tools | Serverset')
  }

  errorSnackbar(error: any): void {
    if(typeof error === "string") {
      this.snackbar.open(error, 'Dismiss', {
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    } else {
      this.snackbar.open(error.error.code + ': ' + error.error.message, 'Dismiss', {
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }

  doneSnackbar(data: any): void {
    this.snackbar.open(data.message, 'Dismiss', {
      panelClass: ['mat-toolbar', 'mat-primary']
    });
  }

}
