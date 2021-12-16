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



  switchTo(page: string): void {
    this.selectedPage = page;
    return;
  }

  constructor(private membersService: MemberService) { }

  ngOnInit(): void {
    //TODO
  }

}
