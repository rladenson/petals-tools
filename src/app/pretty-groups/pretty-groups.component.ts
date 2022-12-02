import { Component, OnInit } from '@angular/core';
import { toHTML } from "discord-markdown";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {PKGroup} from "../pk-models";
import {LocalService} from "../local.service";
import {InternalService} from "../internal.service";

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
  }

  saveToken() {
    this.localService.set('token', this.token);
    this.internalService.updateGroups();
  }


  notInUseSelected() {
    this.inUse = null;
    this.currentlySelected = this.notInUse;
  }

  inUseSelected() {
    this.notInUse = null;
    this.currentlySelected = this.inUse;
  }

  incrementIndents() {
    this.currentlySelected.indents++;
  }

  decrementIndents() {
    this.currentlySelected.indents--;
  }
}
