import { Component, Input } from '@angular/core';
import { memberGuildSettingsModel, systemGuildSettingsModel } from "../pk-models";
import { PluralKitService } from "../pluralkit.service";

@Component({
  selector: 'app-solo-settings',
  templateUrl: './solo-settings.component.html',
  styleUrls: ['./solo-settings.component.css']
})
export class SoloSettingsComponent {

  systemModel = new systemGuildSettingsModel();
  memberModel = new memberGuildSettingsModel();
  memberID: string = '';
  tag_toggle: boolean = false;
  servername_toggle: string = 'null';
  avatar_url_toggle: string = 'null';
  @Input() templates!: [string, string][];

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
    } else if (this.servername_toggle === 'null') {
      this.memberModel.display_name = undefined;
    }
    if (this.avatar_url_toggle === 'clear') {
      this.memberModel.avatar_url = null;
    } else if (this.avatar_url_toggle === 'null') {
      this.memberModel.avatar_url = undefined;
    }
    this.memberService.setMemberGuildSettings(this.memberModel, this.memberID);
  }

  loadTemplate(text: string): void {
    this.memberModel.display_name = text;
  }




  constructor(private memberService: PluralKitService) { }

}
