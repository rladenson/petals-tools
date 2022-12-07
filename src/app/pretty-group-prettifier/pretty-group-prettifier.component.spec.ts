import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrettyGroupPrettifierComponent } from './pretty-group-prettifier.component';

describe('PrettyGroupPrettifierComponent', () => {
  let component: PrettyGroupPrettifierComponent;
  let fixture: ComponentFixture<PrettyGroupPrettifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrettyGroupPrettifierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrettyGroupPrettifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
