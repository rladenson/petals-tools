import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSettingsComponent } from './bulk-settings.component';

describe('BulkSettingsComponent', () => {
  let component: BulkSettingsComponent;
  let fixture: ComponentFixture<BulkSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
