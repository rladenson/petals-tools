import { Component, OnInit } from '@angular/core';
import { PluralKitService } from "../pluralkit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Title } from "@angular/platform-browser";
import { LocalService } from "../local.service";
import { InternalService } from "../internal.service";

@Component({
  selector: 'app-serverset',
  templateUrl: './serverset.component.html',
  styleUrls: ['./serverset.component.css']
})
export class ServersetComponent implements OnInit {

  token: string = '';
  guildID: string = '';
  templates: [string, string][] = [];
  myriadDisable: boolean = false;

  saveToken() {
    this.localService.set('token', this.token);
    this.internalService.updateGroups();
  }
  saveGuildID() {
    if(this.guildID.match(/\d+/)) {
      this.localService.set('guildID', this.guildID);
    }
  }

  constructor(private pluralKitService: PluralKitService, private snackbar: MatSnackBar, private titleService: Title,
              private localService: LocalService, private internalService: InternalService) { }

  ngOnInit(): void {
    this.token = this.localService.get('token');
    this.guildID = this.localService.get('guildID');
    this.templates = JSON.parse(this.localService.get('templates'));
    if (this.templates === null) {
      this.templates = [];
    }
    this.pluralKitService.errorEmitter.subscribe(error => this.errorSnackbar(error));
    this.pluralKitService.doneEmitter.subscribe(data => this.doneSnackbar(data));
    this.titleService.setTitle('Petals Tools | Serverset')
    this.myriadDisable = this.localService.get("myriadDisable") === "true";
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
