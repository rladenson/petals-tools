import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MemberService } from '../member.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {

  @Input() templates: [string, string][] = [];
  @Output() templatesChange = new EventEmitter<[string, string][]>();


  constructor(private memberService: MemberService) { }

  ngOnInit(): void {

  }

  newTemplate(): void {
    this.templates.push(['', '']);
    this.saveTemplates();
  }

  saveTemplates(): void {
    this.templatesChange.emit(this.templates);
    this.memberService.save('templates', JSON.stringify(this.templates));
  }

  removeTemplate(index: number): void {
    this.templates.splice(index, 1);
    this.saveTemplates();
  }

}
