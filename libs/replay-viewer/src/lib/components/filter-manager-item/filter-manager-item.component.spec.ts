import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterManagerItemComponent } from './filter-manager-item.component';

describe('FilterManagerItemComponent', () => {
  let component: FilterManagerItemComponent;
  let fixture: ComponentFixture<FilterManagerItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterManagerItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterManagerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
