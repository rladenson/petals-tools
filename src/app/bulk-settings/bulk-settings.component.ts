import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import { PKMember } from "../PKMember";
import { MemberService } from "../member.service";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-bulk-settings',
  templateUrl: './bulk-settings.component.html',
  styleUrls: ['./bulk-settings.component.css']
})
export class BulkSettingsComponent implements AfterViewInit {

  data: MatTableDataSource<PKMember> = new MatTableDataSource();
  recentMember: any;

  viewAll(): void {
    this.getList();
  }

  clearAll() {
    this.memberService.doAnEmit(1);
  }

  getList(): void {
    this.memberService.waitFetch()
      .subscribe(data => this.data.data = data);
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'id', 'displayname'];

  constructor(private memberService: MemberService) { }

  ngAfterViewInit() {
    this.data.sort = this.sort;
    this.memberService.memberEmitter.subscribe(member => this.gotMember(member));
    this.data.paginator = this.paginator;
  }

  gotMember(member: any): void {
    this.recentMember = member;
    console.log(member);
  }

}
