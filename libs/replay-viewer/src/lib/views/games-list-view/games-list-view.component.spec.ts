import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesListViewComponent } from './games-list-view.component';

describe('GamesListViewComponent', () => {
  let component: GamesListViewComponent;
  let fixture: ComponentFixture<GamesListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamesListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
