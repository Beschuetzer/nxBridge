import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { Store } from '@ngrx/store';
import { AppState, SetIsLoading, SetLoadingError } from '@nx-bridge/store';

@Component({
  selector: 'nx-bridge-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @HostBinding('class.search') get classname() {
    return true;
  }
  @Input() titleMsg = 'Search';
  @Input() isLandingPage = false;

  public isLoading = false;
  public initialForm: FormGroup = new FormGroup({});
  public error = '';
  public errorHighlightedValue = '';
  public errorSub = Subscription;
  public isEmailError = false;

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

  get stringToSearchUsing(): { pre: string; post: string } | undefined {
    const preStringUsername = 'Search for user with username of ';
    const preStringEmail = 'Search for user with email of ';

    const email = this.initialForm.get('email')?.value;
    const username = this.initialForm.get('username')?.value;

    const usernameString = `'${username}'`;
    const emailString = `'${email}'`;

    if (!username && !email) return undefined;
    else if (username && !email)
      return { pre: preStringUsername, post: usernameString };
    else if (!username && email)
      return { pre: preStringEmail, post: emailString };
    else return { pre: preStringUsername, post: usernameString };
  }

  constructor(
    private searchService: SearchService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLoadingErrorMessage();
    this.subscribeToIsLoading();
  }

  onInputClick() {
    this.store
      .select('general')
      .pipe(
        take(1),
        map((generalState) => {
          if (generalState.loadingError) this.onReset();
        })
      )
      .subscribe();
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

    this.searchService.startRequest(usernameValue, emailValue);
    this.resetForm();
    this.searchService.shouldNavigateToGames = true;
  }

  public resetForm() {
    this.initializeForm();
  }

  private initializeForm() {
    this.initialForm = new FormGroup(
      {
        username: new FormControl(null, [
          Validators.maxLength(12),
          SearchService.noEmpty,
        ]),
        email: new FormControl(null, [
          Validators.email,
          SearchService.noEmpty,
        ]),
      },
      SearchService.numberRequired(1)
    );
  }

  private subscribeToLoadingErrorMessage() {
    this.store.select('general').subscribe(generalState => {
      const errorMessageWhole = generalState.loadingError;
      const termToHighlight = errorMessageWhole.match(/'.+'/i);
      const punctuation = errorMessageWhole.match(/[.?]$/i);

      if (errorMessageWhole.match(/email/i)) this.isEmailError = true;

      if (termToHighlight) {
        let term = termToHighlight[0];
        let errorWithoutTerm = errorMessageWhole.replace(term, '')
       
        if (punctuation) {
          if (this.isEmailError) {
            term += punctuation[0];
            errorWithoutTerm = errorWithoutTerm.replace(punctuation[0], '');
          }
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
}
