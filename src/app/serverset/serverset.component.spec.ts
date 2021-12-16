import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServersetComponent } from './serverset.component';

describe('ServersetComponent', () => {
  let component: ServersetComponent;
  let fixture: ComponentFixture<ServersetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServersetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServersetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
