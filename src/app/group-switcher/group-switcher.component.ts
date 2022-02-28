import { Component, OnInit } from '@angular/core';
import {PluralKitService} from "../pluralkit.service";

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

  constructor(private memberService: PluralKitService) { }

  ngOnInit(): void {
    this.token = this.memberService.get('token');
    this.memberService.progressEmitter.subscribe(progress => this.writeProgress(progress));
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
    this.memberService.set('token', this.token);
  }

  go(): void {
    this.started = true;
    this.memberService.groupSwitch();
  }

}
