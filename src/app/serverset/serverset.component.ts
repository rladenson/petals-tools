import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { MemberService } from "../member.service";

@Component({
  selector: 'app-serverset',
  templateUrl: './serverset.component.html',
  styleUrls: ['./serverset.component.css']
})
export class ServersetComponent implements AfterViewInit {

  selectedPage: string = "solo";
  lock: boolean = false;
  @ViewChild('token') token!: ElementRef;
  @ViewChild('guildID') guildID!: ElementRef;

  saveToken(event: any) {
    this.memberService.set('token', event.originalTarget.value);
  }
  saveGuildID(event: any) {
    this.memberService.set('guildID', event.originalTarget.value);
  }



  switchTo(page: string): void {
    this.selectedPage = page;
    return;
  }

  constructor(private memberService: MemberService) { }

  ngAfterViewInit(): void {
    this.token.nativeElement.value = this.memberService.get('token');
    this.guildID.nativeElement.value = this.memberService.get('guildID');
  }

}
