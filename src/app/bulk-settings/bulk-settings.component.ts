import { OnInit, Component, ViewChild } from '@angular/core';
import { PluralKitService } from "../pluralkit.service";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn } from "@angular/forms";
import { InternalService } from "../internal.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { PKGroup } from "../pk-models";

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
  groups!: Array<PKGroup>;
  filteredGroups!: Observable<PKGroup[]>;

  constructor(private pluralKitService: PluralKitService, private snackbar: MatSnackBar, private internalService: InternalService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
    this.pluralKitService.memberEmitter.subscribe(member => this.gotMember(member));
    this.pluralKitService.progressEmitter.subscribe(progress => this.updateProgress(progress));
    this.internalService.groups$.subscribe(res => {
      this.groups = res;
      this.groupForm.controls["groupOverride"].enable();
    });
    this.filteredGroups = this.groupForm.controls["groupOverride"].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
    );
    this.internalService.updateGroups();
  }

  private _filter(value: string): PKGroup[] {
    const filterValue = value.toLowerCase();
    return this.groups.filter(group => group.display_name?.toLowerCase().includes(filterValue)
        || group.name?.toLowerCase().includes(filterValue)
        || group.id?.toLowerCase().includes(filterValue)
    );
  }

  resetProgress() {
    this.data.data = [];
    this.inProgress = true;
    this.progress = -1;
    this.membersLeft = -1;
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

  viewAll(): void {
    this.resetProgress();
    if(this.groupOverride.valid && this.groupOverride.value) {
      this.pluralKitService.getServerSettingsBulk(
          this.groups.find(g => g.name === this.groupOverride.value ||
              g.display_name === this.groupOverride.value ||
              g.id === this.groupOverride.value ||
              g.toString() === this.groupOverride.value)!.id)
          .catch(error => this.handleError(error));

    } else {
      this.pluralKitService.getServerSettingsBulk();
    }
  }

  clearAll() {
    this.resetProgress();
    if(this.groupOverride.valid && this.groupOverride.value) {
      this.pluralKitService.clearServerSettingsBulk(
          this.groups.find(g => g.name === this.groupOverride.value || g.display_name === this.groupOverride.value
              || g.id === this.groupOverride.value)!.id)
          .catch(error => this.handleError(error));

    } else {
      this.pluralKitService.clearServerSettingsBulk();
    }
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

  get groupOverride() {
    return this.groupForm.controls['groupOverride'];
  }

  groupForm = this.formBuilder.group({
    groupOverride: ['', {
      validators: [
        this.createIsOptionValidator()
      ],
      updateOn: 'change'
    }]
  })

  createIsOptionValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value;
      if(!value) {
        return null;
      }
      return this.groups.find(g =>
          g.name === value ||
          g.display_name === value ||
          g.id === value ||
          g.toString() === value
      ) ? null : {isOption: false};
    }
  }

}
