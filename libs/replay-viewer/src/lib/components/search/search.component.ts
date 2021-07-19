import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { Store } from '@ngrx/store';
import {
  AppState,
  SetIsFilterSame,
  SetIsLoading,
  SetLoadingError,
} from '@nx-bridge/store';
import { ReducerNames } from '@nx-bridge/interfaces-and-types';
import {
  DISPLAY_NONE_CLASSNAME,
  LOGIN_CARD_CLASSNAME,
} from '@nx-bridge/constants';
import { Renderer } from 'three';

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
  public isNoGamesError = false;
  public LOGIN_CARD_CLASSNAME = LOGIN_CARD_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;

  get currentField(): string {
    return 'username';
  }

  get emailIsValid(): boolean | undefined {
    const email = this.initialForm.get('email');
    if (!email) return true;
    return email.valid;
  }

  get usernameIsValid(): boolean | undefined {
    const username = this.initialForm.get('username');
    if (!username) return true;
    return username.valid;
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
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLoadingErrorMessage();
    this.subscribeToIsLoading();
  }

  onInputClick() {
    this.store
      .select(ReducerNames.general)
      .pipe(
        take(1),
        map((generalState) => {
          if (generalState.loadingError) this.onReset();
        })
      )
      .subscribe();
  }

  onEmailClick() {
    const { usernameInput, emailInput } = this.getInputs();
    const form = usernameInput?.closest('form') as HTMLFormElement;
    form.reset();

    if (usernameInput) {
      (usernameInput.children[1] as HTMLInputElement).value = '';
      this.renderer.addClass(usernameInput, DISPLAY_NONE_CLASSNAME);
    }
    if (emailInput) {
      (document.querySelector('#emailCheckbox') as HTMLInputElement).checked = true;
      (emailInput.children[1] as HTMLInputElement).value = '';
      this.renderer.removeClass(emailInput, DISPLAY_NONE_CLASSNAME);
    }
  }

  onHide() {
    const search = this.elRef.nativeElement as HTMLElement;
    const subtitle = search.querySelector(`.${LOGIN_CARD_CLASSNAME}__subtitle`) as HTMLElement;
    const inputs = search.querySelector(`.${LOGIN_CARD_CLASSNAME}__inputs`) as HTMLElement;
    const submit = search.querySelector(`.${LOGIN_CARD_CLASSNAME}__submit`) as HTMLElement;
    const button = search.querySelector(`.${LOGIN_CARD_CLASSNAME}__hide`) as HTMLElement;

    if (subtitle?.classList.contains(DISPLAY_NONE_CLASSNAME)) {
      this.renderer.removeClass(subtitle, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(inputs, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(submit, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = "Hide";
    } else {
      this.renderer.addClass(subtitle, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(inputs, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(submit, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = "Show";
    }
  }

  onReset() {
    this.resetForm();
    this.store.dispatch(new SetIsLoading(false));
    this.store.dispatch(new SetLoadingError(''));
  }

  onSubmit() {
    this.store.dispatch(new SetIsFilterSame(false));
    this.store.dispatch(new SetIsLoading(true));
    const email = this.initialForm.get('email');
    const username = this.initialForm.get('username');
    const emailValue = email?.value;
    const usernameValue = username?.value;

    const response = this.searchService.startRequest(usernameValue, emailValue);
    this.error = response ? response : '';
    this.resetForm();

    this.searchService.shouldNavigateToGames = true;
  }

  getInputs() {
    const loginCard = this.elRef.nativeElement;
    const usernameInput = loginCard?.querySelector(
      `.${LOGIN_CARD_CLASSNAME}__username`
    ) as HTMLInputElement;
    const emailInput = loginCard?.querySelector(
      `.${LOGIN_CARD_CLASSNAME}__email`
    ) as HTMLInputElement;
    if (!emailInput || !usernameInput)
      return { usernameInput: null, emailInput: null };

    return { usernameInput, emailInput };
  }

  resetForm() {
    this.initializeForm();
  }

  onUsernameClick() {
    const { usernameInput, emailInput } = this.getInputs();
    const form = usernameInput?.closest('form') as HTMLFormElement;
    form.reset();

    if (usernameInput) {
      (document.querySelector('#usernameCheckbox') as HTMLInputElement).checked = true;
      (usernameInput.children[1] as HTMLInputElement).value = '';
      this.renderer.removeClass(usernameInput, DISPLAY_NONE_CLASSNAME);
    }
    if (emailInput) {
      (emailInput.children[1] as HTMLInputElement).value = '';
      this.renderer.addClass(emailInput, DISPLAY_NONE_CLASSNAME);
    }
  }

  private initializeForm() {
    this.initialForm = new FormGroup(
      {
        username: new FormControl(null, [
          Validators.maxLength(12),
          SearchService.noEmpty,
        ]),
        email: new FormControl(null, [Validators.email, SearchService.noEmpty]),
      },
      SearchService.numberRequired(1)
    );
  }

  private subscribeToLoadingErrorMessage() {
    this.store.select(ReducerNames.general).subscribe((generalState) => {
      const errorMessageWhole = generalState.loadingError;
      const termToHighlight = errorMessageWhole.match(/'.+'/i);
      const punctuation = errorMessageWhole.match(/[.?]$/i);

      if (errorMessageWhole.match(/yet/i)) this.isNoGamesError = true;
      else this.isNoGamesError = false;

      if (termToHighlight) {
        let term = termToHighlight[0];
        let errorWithoutTerm = errorMessageWhole.replace(term, '');

        if (punctuation) {
          if (!this.isNoGamesError) {
            term += punctuation[0];
            errorWithoutTerm = errorWithoutTerm.replace(
              new RegExp(punctuation[0] + '$'),
              ''
            );
          }
        }

        this.error = errorWithoutTerm;
        this.errorHighlightedValue = term;
      } else {
        this.error = errorMessageWhole;
      }
    });
  }

  private subscribeToIsLoading() {
    this.store.select(ReducerNames.general).subscribe((generalState) => {
      this.isLoading = generalState.isLoading;
    });
  }
}
