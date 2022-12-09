import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { PKGroup } from "../pk-models";
import { LocalService } from "../local.service";
import { InternalService } from "../internal.service";
import { MatDialog } from "@angular/material/dialog";
import { PrettyGroupPrettifierComponent } from "../pretty-group-prettifier/pretty-group-prettifier.component";
import {PluralKitService} from "../pluralkit.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-pretty-groups',
  templateUrl: './pretty-groups.component.html',
  styleUrls: ['./pretty-groups.component.css']
})
export class PrettyGroupsComponent implements OnInit {
  myriadDisable: boolean = false;
  token: string = "";
  inUseArr: PKGroup[] = [];
  notInUseArr: PKGroup[] = [];
  inUse: any;
  notInUse: any;
  currentlySelected?: any;
  advancedToggle: boolean = false;
  systemName: string | null = null;
  unicode: string[] = [',', ';', ':', '!', '?', '.', "'", '"', '(', ')', '[', ']', '{', '}', '@', '/', '&', '#', '%', '^', '<', '=', '>', '~']
  newGroupName: string = '';
  newGroupDN: string = '';
  createdGroupsArr: PKGroup[] = [];
  createdGroups: any;


  constructor(private localService: LocalService, private internalService: InternalService, private snackbar: MatSnackBar,
              public dialog: MatDialog, private pluralKitService: PluralKitService ) {

    this.internalService.groups$.subscribe(res => {
      this.notInUseArr = res;
      this.inUseArr = [];
      this.notInUseArr.forEach((_, i, arr) => {
        arr[i].indents = 0;
      })
    });

  }

  ngOnInit(): void {
    this.myriadDisable = this.localService.get("myriadDisable") === "true";
    this.token = this.localService.get('token');
    this.internalService.updateGroups();
    this.pluralKitService.getSystem().then(s => this.systemName = s.name);
  }

  makeNewGroup() {
    this.createdGroupsArr.push(new PKGroup('no id', this.newGroupName, this.newGroupDN, [], 0));
  }

  drop(event: CdkDragDrop<PKGroup[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
      );
    }

    if(event.container.id === "cdk-drop-list-0") {
      this.notInUseSelected(event.container.data[event.currentIndex]);
    } else {
      this.inUseSelected(event.container.data[event.currentIndex]);
    }
  }

  saveToken() {
    this.localService.set('token', this.token);
    this.internalService.updateGroups();
    this.pluralKitService.getSystem().then(s => this.systemName = s.name);
  }

  errorSnackbar(error: string): void {
      this.snackbar.open(error, 'Dismiss', {
        panelClass: ['mat-toolbar', 'mat-warn']
      });
  }


  notInUseSelected(selected?: PKGroup) {
    this.inUse = null;

    if(selected) {
      this.notInUse = new Array(selected);
    }

    switch (this.notInUse.length) {
      case 0:
        this.currentlySelected = undefined;
        break;
      case 1:
        this.currentlySelected = this.notInUse[0];
        break;
      default:
        this.currentlySelected = this.notInUse[1];
        this.notInUse = new Array(this.notInUse[1]);
        break;
    }

  }

  inUseSelected(selected?: PKGroup) {
    this.notInUse = null;

    if(selected) {
      this.inUse = new Array(selected);
    }

    switch (this.inUse.length) {
      case 0:
        this.currentlySelected = undefined;
        break;
      case 1:
        this.currentlySelected = this.inUse[0];
        break;
      default:
        this.currentlySelected = this.inUse[1];
        this.inUse = new Array(this.inUse[1]);
        break;
    }
  }

  incrementIndents() {
    this.currentlySelected.indents++;
  }

  decrementIndents() {
    this.currentlySelected.indents--;
  }

  moveAllToNotInUse() {
    this.notInUse = null;
    this.inUse = null;

    this.notInUseArr = [...this.notInUseArr, ...this.inUseArr];
    this.inUseArr = [];
  }

  moveAllToInUse() {
    this.notInUse = null;
    this.inUse = null;

    this.inUseArr = [...this.inUseArr, ...this.notInUseArr];
    this.notInUseArr = [];
  }

  parse() {
    let maxIndent = this.checkIfValid();
    if(maxIndent === -3) {
      this.errorSnackbar("Please add groups to the Group Organizer list.");
      return;
    } else if(maxIndent === -2) {
      this.errorSnackbar("Please make sure your first group is not indented.");
      return;
    } else if(maxIndent === -4){
      let numCats = 0;
      this.inUseArr.forEach(g => {
        if(g.indents === 0)
          numCats++;
      })
      this.errorSnackbar("You have more groups than we have available unicode characters! Please contact me in" +
          "the third-party-discussions channel of the PluralKit server and say you have " + numCats + " categories.")
    }else if(maxIndent < 0) {
      this.errorSnackbar("Something went wrong.")
      return;
    }
    let sort = Array.from({length: maxIndent + 1}, _ => 0);


    this.inUseArr.forEach((group, i, arr) => {
      group.sortOrder = Array.from({length: group.indents! + 1}, _ => 0);
      group.sortOrder.forEach((tierValue, tier, sortOrder) => {
        sortOrder[tier] = sort[tier];
      })
      if(arr.length > i + 1) {
        if(arr[i+1].indents === group.indents) {
          sort[group.indents!] = sort[group.indents!] + 1;
        } else if(arr[i+1].indents! < group.indents!) {
          sort.forEach((m, n, sortinner) => {
            if(n > arr[i+1].indents!) {
              sortinner[n] = 0;
            } else if(n === arr[i+1].indents) {
              sortinner[n] = m + 1;
            }
          })
        } else if(arr[i+1].indents! > group.indents!) {
          //nothing?
        }
      }
    })

    this.openDialog();

  }

  checkIfValid() {
    let numCategories = 0;
    if(this.inUseArr.length === 0) {
      return -3;
    }
    let maxIndent = -1;
    this.inUseArr.forEach(group => {
      if(group.indents! > maxIndent + 1) {
        maxIndent = -2;
        return;
      } else if(group.indents! > maxIndent) {
        maxIndent = group.indents!;
      }
      if(group.indents === 0)
        numCategories++;
    })
    if(numCategories > this.unicode.length - 1) {
      return -4;
    }
    return maxIndent;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PrettyGroupPrettifierComponent, {
      width: '100%',
      data: this.inUseArr
    });

    dialogRef.afterClosed().subscribe(settings => {
      console.log('The dialog was closed');
      this.makeExport(settings);
    });
  }

  flattenIndents(maxIndents: number) {
    this.inUseArr.forEach((g, i, arr) => {
      if(g.indents! > maxIndents) {
        arr[i].indents = maxIndents;
      }
    })
    this.notInUseArr.forEach((g, i, arr) => {
      if(g.indents! > maxIndents) {
        arr[i].indents = maxIndents;
      }
    })
  }

  makeExport(settings?: any) {
    let arr: PKGroup[] = JSON.parse(JSON.stringify(this.inUseArr))
    let prevIndent = 1;
    let unicodeIndex = -1;
    arr.forEach((g: PKGroup, i, arr) => { //TODO GENERALIZE FOR MORE INDENT AMOUNTS
      let newDN = '';
      let newName = '';
      if(g.indents === 0) {
        if(prevIndent === 1) {
          newDN = newDN.concat('\n')
        }
        unicodeIndex++;
        newName = newName.concat(this.unicode[unicodeIndex], this.unicode[unicodeIndex], g.name);
        newDN = newDN.concat(settings?.categoryPrefix, (g.display_name && g.display_name.length > 0) ? g.display_name : g.name, settings?.categorySuffix, '\n> ');
      } else if(g.indents === 1) {
        newName = newName.concat(this.unicode[unicodeIndex], g.name);
        newDN = newDN.concat(settings?.groupPrefix, (g.display_name && g.display_name.length > 0) ? g.display_name : g.name, settings?.groupSuffix);
      }
      prevIndent = g.indents!;
      arr[i] = new PKGroup(g.id, newName, newDN, [], undefined);
    })
    unicodeIndex++;
    arr.push(new PKGroup('_____', this.unicode[unicodeIndex] + this.unicode[unicodeIndex] + 'Spacer', '\n.', [], undefined));
    let str = JSON.stringify(arr);

    let download = new File(['{"version": 2, "switches": [], "members": [], "groups": ', str, ', ' +
        '"name": ', this.systemName ? '"' + this.systemName + '"' : 'null', '}'],
        'groupImport.json', {type: 'text/json'});
    let link = document.createElement('a');
    let url = URL.createObjectURL(download);
    link.href = url;
    link.download = download.name;
    document.body.appendChild(link)
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  }
}

/*
TODO what happens if too many groups?
TODO make it recognize when you've used the tool before
TODO should turning advancedtoggle off get rid of all extra indents? maybe just visually?
TODO ask if they want to make all names on newlines
TODO more advanced drag and drop (includes dropping onto other groups to go into them and auto-indenting if dropped between two indented groups)
 */
