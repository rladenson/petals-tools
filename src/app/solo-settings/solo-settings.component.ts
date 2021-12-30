import { Component, OnInit } from '@angular/core';
import { memberGuildSettingsModel, systemGuildSettingsModel } from "../pk-models";
import { MemberService } from "../member.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-solo-settings',
  templateUrl: './solo-settings.component.html',
  styleUrls: ['./solo-settings.component.css']
})
export class SoloSettingsComponent implements OnInit {

  systemModel = new systemGuildSettingsModel();
  memberModel = new memberGuildSettingsModel();
  memberID: string = '';
  tag_toggle: boolean = false;
  servername_toggle: string = 'null';
  avatar_url_toggle: string = 'null';

  submitSystem() {
    if (this.tag_toggle) {
      this.systemModel.tag = null;
    } else if (this.systemModel.tag === null || this.systemModel.tag === '') {
      this.systemModel.tag = undefined;
    }
    this.memberService.setSystemGuildSettings(this.systemModel);
  }

  submitMember() {
    if (this.servername_toggle === 'clear') {
      this.memberModel.display_name = null;
    } else if (this.memberModel.display_name === null || this.memberModel.display_name === '') {
      this.memberModel.display_name = undefined;
    }
    if (this.avatar_url_toggle === 'clear') {
      this.memberModel.avatar_url = null;
    } else if (this.memberModel.avatar_url === null || this.memberModel.avatar_url === '') {
      this.memberModel.avatar_url = undefined;
    }
    this.memberService.setMemberGuildSettings(this.memberModel, this.memberID);
  }

  /* error snackbar
    try {
      this.model.setGuildID('2a');
    } catch (e: any) {
      this.snackbar.open(e, 'Dismiss');
      console.log(e);
    }*/


  constructor(private memberService: MemberService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }

}
