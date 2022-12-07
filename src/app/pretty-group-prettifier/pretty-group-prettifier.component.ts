import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PKGroup } from "../pk-models";
import { toHTML } from "discord-markdown";

@Component({
  selector: 'app-pretty-group-prettifier',
  templateUrl: './pretty-group-prettifier.component.html',
  styleUrls: ['./pretty-group-prettifier.component.css']
})
export class PrettyGroupPrettifierComponent implements OnInit {

  formattedData: string = '';
  categoryPrefix: string = '';
  categorySuffix: string = '';
  groupPrefix: string = '';
  groupSuffix: string = '';

  constructor(
      public dialogRef: MatDialogRef<PrettyGroupPrettifierComponent>,
      @Inject(MAT_DIALOG_DATA) public data: PKGroup[]) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.format();
  }

  format() {
    let str = '';
    let prevIndent = 1;
    this.data.forEach(g => {
      if(g.indents === 0) {
        if(prevIndent === 1) {
          str = str.concat('\n, ');
        }
        str = str.concat(this.categoryPrefix, g.name, this.categorySuffix);
        prevIndent = 0;
      } else if(g.indents === 1) {
        if(prevIndent === 0) {
          str = str.concat('\n> , ');
        }
        str = str.concat(this.groupPrefix, g.name, this.groupSuffix);
        prevIndent = 1
      } else {
        //TODO use max indent and make these the last two levels of indent
      }
      str = str.concat(', ');
    })
    str = str.slice(0,-2);
    this.formattedData = toHTML(str);
  }

  //TODO ALLOW FOR CHANGING DISPLAYNAMES HERE
  //TODO ADD EXTRA NEWLINE SETTINGS

}
