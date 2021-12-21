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
  value: number = 0;
  inProgress: boolean = false;

  viewAll(): void {
    this.memberService.getServerSettings('aobyr');
  }

  clearAll() {
    //TODO

  }

  getList(): void {
    this.memberService.waitFetch()
      .then(data => this.data.data = data);
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'id', 'displayname'];

  constructor(private memberService: MemberService) { }

  ngAfterViewInit() {
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
    this.memberService.memberEmitter.subscribe(member => console.log(member));
    this.memberService.progressEmitter.subscribe(progress => this.updateProgress(progress));
  }

  gotMember(member: any): void {
    if(member === 'done') {
      console.log("done");
    } else {
      //member.subscribe((member: any) => console.log(member));
      console.log(member);
    }

  }

  updateProgress(progress: any): void {
    this.value = progress;
  }

}
