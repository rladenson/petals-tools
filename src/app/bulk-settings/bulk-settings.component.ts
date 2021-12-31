import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MemberService } from "../member.service";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-bulk-settings',
  templateUrl: './bulk-settings.component.html',
  styleUrls: ['./bulk-settings.component.css']
})
export class BulkSettingsComponent implements AfterViewInit {

  data: MatTableDataSource<any> = new MatTableDataSource();
  recentMember: any;
  progress: number = -1;
  inProgress: boolean = false;
  membersLeft: number = -1;

  viewAll(): void {
    this.data.data = [];
    this.inProgress = true;
    this.memberService.getServerSettingsBulk();
  }

  clearAll() {
    this.data.data = [];
    this.inProgress = true;
    this.memberService.clearServerSettingsBulk();
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'id', 'display_name', 'avatar_url'];

  constructor(private memberService: MemberService, private snackbar: MatSnackBar) { }

  ngAfterViewInit() {
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
    this.memberService.memberEmitter.subscribe(member => this.gotMember(member));
    this.memberService.progressEmitter.subscribe(progress => this.updateProgress(progress));
  }

  gotMember(member: any): void {
    //MatTableDataSource push method was broken, this is workaround.
    const data = this.data.data;
    data.push(member);
    this.data.data = data;
  }

  updateProgress(progress: any): void {
    this.progress = progress.progress;
    if(progress.membersLeft === 0) {
      this.inProgress = false;
      this.snackbar.open('Done!', 'Dismiss')
    } else {
      this.membersLeft = progress.membersLeft;
    }
  }

}
