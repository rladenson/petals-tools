import {Component, OnInit} from '@angular/core';
import {systemGuildSettingsModel} from "../pk-models";
import {MemberService} from "../member.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-solo-settings',
  templateUrl: './solo-settings.component.html',
  styleUrls: ['./solo-settings.component.css']
})
export class SoloSettingsComponent implements OnInit {

  model = new systemGuildSettingsModel();
  tag_toggle: boolean = false;
  submitted = false;

  submitSystem() {
    this.submitted = true;
    if(this.tag_toggle) {
      this.model.tag = null;
    } else if(this.model.tag === null || this.model.tag === '') {
      this.model.tag = undefined;
    }
    this.memberService.setSystemGuildSettings(this.model);
  }

  submitMember() {

  }

  /* error snackbar
    try {
      this.model.setGuildID('2a');
    } catch (e: any) {
      this.snackbar.open(e, 'Dismiss');
      console.log(e);
    }*/


  constructor( private memberService: MemberService, private snackbar: MatSnackBar ) { }

  ngOnInit(): void {
  }

}
