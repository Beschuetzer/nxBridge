import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { ReducerNames } from '@nx-bridge/interfaces-and-types';
import { rootCertificates } from 'node:tls';
import { rootRoute } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  constructor(
    private searchService: SearchService,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscribeToUsers();
  }

  private subscribeToUsers() {
    this.store.select(ReducerNames.users).subscribe((usersState) => {
      if (!usersState?.currentlyViewingUser?.games) return;
      if (
        usersState.currentlyViewingUser.games.length > 0 &&
        this.searchService.shouldNavigateToGames
      ) {
        this.router.navigate([rootRoute, 'games']);
        this.searchService.shouldNavigateToGames = false;
      }
    });
  }
}
