import { Component, OnInit } from '@angular/core';
import { toHTML } from "discord-markdown";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {PKGroup} from "../pk-models";
import {LocalService} from "../local.service";
import {InternalService} from "../internal.service";
import { repeat } from "rxjs/operators";

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
  pastSelected?: PKGroup;

  constructor(private localService: LocalService, private internalService: InternalService) {

    this.internalService.groups$.subscribe(res => {
      this.notInUseArr = res;
      this.inUseArr = [];
    });

  }

  ngOnInit(): void {
    const { toHTML } = require('discord-markdown');
    this.myriadDisable = this.localService.get("myriadDisable") === "true";
    this.token = this.localService.get('token');
    this.internalService.updateGroups();
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
    if(maxIndent === -1) {
      console.log("ERROR");
      return;
    }
    let sort = Array.from({length: maxIndent + 1}, _ => 0);


    this.inUseArr.forEach((group, i, arr) => {
      group.sortOrder = Array.from({length: group.indents + 1}, _ => 0);
      group.sortOrder.forEach((tierValue, tier, sortOrder) => {
        sortOrder[tier] = sort[tier];
      })
      if(arr.length > i + 1) {
        if(arr[i+1].indents === group.indents) {
          sort[group.indents] = sort[group.indents] + 1;
        } else if(arr[i+1].indents < group.indents) {
          sort.forEach((m, n, sortinner) => {
            if(n > arr[i+1].indents) {
              sortinner[n] = 0;
            } else if(n === arr[i+1].indents) {
              sortinner[n] = m + 1;
            }
          })
        } else if(arr[i+1].indents > group.indents) {
          //nothing?
        }
      }
    })
    console.log(this.inUseArr);
  }

  checkIfValid() {
    let maxIndent = -1;
    let good = true;
    this.inUseArr.forEach(group => {
      if(group.indents > maxIndent + 1) {
        good = false;
        return;
      } else if(group.indents > maxIndent) {
        maxIndent = group.indents;
      }
    })
    return good ? maxIndent : -1;
  }
}

/*
TODO add symbols to names
TODO make it sort by name
TODO what happens if too many groups?
TODO what will it look like preview (Discord markdown!)
TODO make it into an import file
TODO make it recognize when you've used the tool before
TODO
 */
