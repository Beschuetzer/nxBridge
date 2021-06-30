import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealPlayerComponent } from './deal-player.component';

describe('DealPlayerComponent', () => {
  let component: DealPlayerComponent;
  let fixture: ComponentFixture<DealPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
