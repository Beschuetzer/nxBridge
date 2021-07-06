import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LandingPageService } from '../../services/landing-page.service';
import { User } from '@nx-bridge/interfaces-and-types';
import { HelpersService } from '@nx-bridge/helpers';
import { Subscription } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { AppState, SetIsLoading, SetLoadingError } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'nx-bridge-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  constructor(
    private helpersService: HelpersService,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private landingPageService: LandingPageService,
  ) {}

  public isLoading = false;
  public error = '';
  public errorHighlightedValue = '';
  public initialForm: FormGroup = new FormGroup({});
  errorSub = Subscription;
  public shouldNavigateToGames = false;

  get emailIsValid(): boolean | undefined {
    const email = this.initialForm.get('email');
    if (!email) return true;
    return email.touched && email.value !== '' && email.valid;
  }

  get usernameIsValid(): boolean | undefined {
    const username = this.initialForm.get('username');
    if (!username) return true;
    return username.touched && username.value !== '' && username.valid;
  }

  get stringToSearchUsing(): {pre: string, post: string} | undefined {
    const preStringUsername = 'Search for user with username of ';
    const preStringEmail = 'Search for user with email of ';

    const email = this.initialForm.get('email')?.value;
    const username = this.initialForm.get('username')?.value;

    const usernameString = `'${username}'`;
    const emailString = `'${email}'`;

    if (!username && !email) return undefined;
    else if (username && !email) return {pre: preStringUsername, post: usernameString};
    else if (!username && email) return {pre: preStringEmail, post: emailString};
    else return {pre: preStringUsername, post: usernameString};
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLoadingErrorMessage();
    this.subscribeToIsLoading();
    this.subscribeToGames();
  }

  public resetForm() {
    this.initializeForm();
  }

  onInputClick() {
    console.log('this.error =', this.error);
    this.store.select('general').pipe(
      take(1),
      map(generalState => {
        if (generalState.loadingError) this.onReset();
      })
    ).subscribe();
  }

  onReset() {
    this.resetForm();
    this.store.dispatch(new SetIsLoading(false));
    this.store.dispatch(new SetLoadingError(''));
  }

  onSubmit() {
    this.store.dispatch(new SetIsLoading(true));
    const email = this.initialForm.get('email');
    const username = this.initialForm.get('username');
    const emailValue = email?.value;
    const usernameValue = username?.value;

    this.landingPageService.startRequest(usernameValue, emailValue);
    this.resetForm();
    this.shouldNavigateToGames = true;
  }

  private initializeForm() {
    this.initialForm = new FormGroup(
      {
        username: new FormControl(null, [
          Validators.maxLength(12),
          LandingPageService.noEmpty,
        ]),
        email: new FormControl(null, [
          Validators.email,
          LandingPageService.noEmpty,
        ]),
      },
      LandingPageService.numberRequired(1)
    );
  }

  private subscribeToLoadingErrorMessage() {
    this.store.select('general').subscribe(generalState => {
      const errorMessageWhole = generalState.loadingError;
      const termToHighlight = errorMessageWhole.match(/'.+'/i);
      const punctuation = errorMessageWhole.match(/[.?]$/i);

      if (termToHighlight) {
        let term = termToHighlight[0];
        let errorWithoutTerm = errorMessageWhole.replace(term, '')
       
        if (punctuation) {
          term += punctuation[0];
          errorWithoutTerm = errorWithoutTerm.replace(punctuation[0], '');
        }

        this.error = errorWithoutTerm;
        this.errorHighlightedValue = term;

      } else {
        this.error = errorMessageWhole;
      }
    })
  }

  private subscribeToIsLoading() {
    this.store.select('general').subscribe(generalState => {
      this.isLoading = generalState.isLoading;
    })
  }

  private subscribeToGames() {
    this.store.select('games').subscribe(gamesState => {
      if (gamesState.games.length > 0 && this.shouldNavigateToGames) {
        console.log('navigating------------------------------------------------');
        this.router.navigate(['games'], {relativeTo: this.route});
        this.shouldNavigateToGames = false;
      }
    });
  }
}
