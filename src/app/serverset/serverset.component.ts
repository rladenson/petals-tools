import { Component, OnInit } from '@angular/core';
import { MembersService } from "../members.service";

@Component({
  selector: 'app-serverset',
  templateUrl: './serverset.component.html',
  styleUrls: ['./serverset.component.css']
})
export class ServersetComponent implements OnInit {

  selectedPage: string = "solo";

  switchTo(page: string): void {
    this.selectedPage = page;
    return;
  }

  constructor(private membersService: MembersService) { }

  ngOnInit(): void {
    //TODO
  }

}
