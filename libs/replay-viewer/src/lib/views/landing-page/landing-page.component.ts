import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState} from '@nx-bridge/store';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../services/search.service';


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
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.subscribeToGames();
  }

  private subscribeToGames() {
    this.store.select('users').subscribe(usersState => {
      if (!usersState?.currentlyViewingUser?.games) return;
      if (usersState.currentlyViewingUser.games.length > 0 && this.searchService.shouldNavigateToGames) {
        this.router.navigate(['games'], {relativeTo: this.route});
        this.searchService.shouldNavigateToGames = false;
      }
    });
  }
  
}
