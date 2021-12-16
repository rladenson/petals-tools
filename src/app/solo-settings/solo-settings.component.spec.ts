import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloSettingsComponent } from './solo-settings.component';

describe('SoloSettingsComponent', () => {
  let component: SoloSettingsComponent;
  let fixture: ComponentFixture<SoloSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoloSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoloSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
