import { Component, OnInit } from '@angular/core';
import { MemberService } from "../member.service";

@Component({
  selector: 'app-serverset',
  templateUrl: './serverset.component.html',
  styleUrls: ['./serverset.component.css']
})
export class ServersetComponent implements OnInit {

  selectedPage: string = "bulk";
  lock: boolean = false;

  saveToken(event: any) {
    this.memberService.set('token', event.originalTarget.value);
  }
  saveServerID(event: any) {
    this.memberService.set('serverID', event.originalTarget.value);
  }



  switchTo(page: string): void {
    this.selectedPage = page;
    return;
  }

  constructor(private memberService: MemberService) { }

  ngOnInit(): void {
    //TODO
  }

}
