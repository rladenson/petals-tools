import { Component, OnInit } from '@angular/core';
import {PluralKitService} from "../pluralkit.service";
import {LocalService} from "../local.service";

@Component({
  selector: 'app-group-switcher',
  templateUrl: './group-switcher.component.html',
  styleUrls: ['./group-switcher.component.css']
})
export class GroupSwitcherComponent implements OnInit {

  token: string = '';
  started: boolean = false;
  numCompleted: number = -1;
  totalNum: number = -1;

  constructor(private pluralKitService: PluralKitService, private localService: LocalService) { }

  ngOnInit(): void {
    this.token = this.localService.get('token');
    this.pluralKitService.progressEmitter.subscribe(progress => this.writeProgress(progress));
  }

  writeProgress(progress: any) {
    if(progress.done === 0) {
      this.started = true;
      this.numCompleted = 0;
      this.totalNum = progress.total;
    } else {
      this.numCompleted++;
      console.log(this.numCompleted + '/' + this.totalNum);
    }
  };

  saveToken() {
    this.localService.set('token', this.token);
  }

  go(): void {
    this.started = true;
    this.pluralKitService.groupSwitch();
  }

}
