import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  myriadDisable: boolean = false;
  APIURL: string = "https://api.pluralkit.me/v2/";

  constructor() { }

  ngOnInit(): void {
  }

}
