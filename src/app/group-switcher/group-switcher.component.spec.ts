import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSwitcherComponent } from './group-switcher.component';

describe('GroupSwitcherComponent', () => {
  let component: GroupSwitcherComponent;
  let fixture: ComponentFixture<GroupSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupSwitcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
