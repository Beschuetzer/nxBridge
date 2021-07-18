import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSpinnerComponent } from './line-spinner.component';

describe('LineSpinnerComponent', () => {
  let component: LineSpinnerComponent;
  let fixture: ComponentFixture<LineSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
