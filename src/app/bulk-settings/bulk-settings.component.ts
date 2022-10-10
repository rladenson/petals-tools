import { OnInit, Component, ViewChild } from '@angular/core';
import { PluralKitService } from "../pluralkit.service";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-bulk-settings',
  templateUrl: './bulk-settings.component.html',
  styleUrls: ['./bulk-settings.component.css']
})
export class BulkSettingsComponent implements OnInit {

  data: MatTableDataSource<any> = new MatTableDataSource();
  progress: number = -1;
  inProgress: boolean = false;
  membersLeft: number = -1;
  groupOverride = new FormControl("");

  constructor(private pluralKitService: PluralKitService, private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
    this.pluralKitService.memberEmitter.subscribe(member => this.gotMember(member));
    this.pluralKitService.progressEmitter.subscribe(progress => this.updateProgress(progress));
  }

  viewAll(): void {
    this.data.data = [];
    this.inProgress = true;
    if(this.groupOverride.valid) {
      this.pluralKitService.getServerSettingsBulk(this.groupOverride.value).catch(error => this.handleError(error));
    } else {
      this.pluralKitService.getServerSettingsBulk();
    }
  }

  handleError(error: any) {
    if(error.error) {
      this.snackbar.open(error.error.code + ": " + error.error.message, 'Dismiss', {
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    } else {
      this.snackbar.open(error.message, 'Dismiss', {
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }

  clearAll() {
    this.data.data = [];
    this.inProgress = true;
    this.pluralKitService.clearServerSettingsBulk();
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'id', 'display_name', 'avatar_url'];

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
