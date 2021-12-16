import { Component, OnInit } from '@angular/core';
import { PKMember } from "../PKMember";
import { MemberService } from "../member.service";

@Component({
  selector: 'app-bulk-settings',
  templateUrl: './bulk-settings.component.html',
  styleUrls: ['./bulk-settings.component.css']
})
export class BulkSettingsComponent implements OnInit {

  list: PKMember[] = [];
  temp?: any;

  viewAll(): void {
    this.getList();
  }

  clearAll() {
    console.log('temp');
    console.log(this.temp);
    console.log('list');
    console.log(this.list);
  }

  getList(): void {
    this.memberService.waitFetch()
      .subscribe(list => this.list = list);
    this.memberService.waitFetch()
      .subscribe(temp => this.temp = temp);
  }

  displayedColumns: string[] = ['name', 'id', 'displayname'];

  constructor( private memberService: MemberService) { }

  ngOnInit(): void {
  }

}
