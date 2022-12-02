import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrettyGroupsComponent } from './pretty-groups.component';

describe('PrettyGroupsComponent', () => {
  let component: PrettyGroupsComponent;
  let fixture: ComponentFixture<PrettyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrettyGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrettyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
