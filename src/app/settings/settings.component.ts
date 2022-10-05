import { Component, OnInit } from '@angular/core';
import {LocalService} from "../local.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  myriadDisable: boolean = false;
  apiUrl: string = "live";
  altUrl: string = "";

  constructor(private localService: LocalService) { }

  ngOnInit(): void {
    let prevURL: string = this.localService.get("apiOverride");
    if (prevURL !== null) {
      this.altUrl = prevURL;
      this.apiUrl = "other";
    }
    console.log(prevURL);
  }

  //TODO CHANGE ALL INSTANCES OF "API URL" TO "API OVERRIDE" AND FIX BEHAVIOR ACCORDINGLY

  save() {
    switch(this.apiUrl) {
      case "live":
        this.localService.set("apiOverride", null);
        break;
      case "other":
        if(this.altUrl !== "") {
          this.localService.set("apiOverride", this.altUrl);
        }
        break;
      default:
        this.localService.set("apiOverride", this.apiUrl);
    }
    this.localService.set("myriadDisable", this.myriadDisable)
  }
}
