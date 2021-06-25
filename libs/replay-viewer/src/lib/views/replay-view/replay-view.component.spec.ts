import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayViewComponent } from './replay-view.component';

describe('ReplayViewComponent', () => {
  let component: ReplayViewComponent;
  let fixture: ComponentFixture<ReplayViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplayViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplayViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
