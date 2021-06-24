import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LandingService } from '../landing.service';
import { User, Game } from '@nx-bridge/interfaces-and-types';
import { Store } from '@ngrx/store';
import * as ngrxStore from '@nx-bridge/store';

@Component({
  selector: 'nx-bridge-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  constructor(
    private landingService: LandingService,
    private http: HttpClient,
    private store: Store<ngrxStore.AppState>
  ) {}

  public isLoading = false;
  public error = '';
  public errorHighlightedValue = '';
  public initialForm: FormGroup = new FormGroup({});

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
  }

  public resetForm() {
    this.initializeForm();
  }

  onInputClick() {
    console.log('this.error =', this.error);
    if (this.error) this.onReset();
  }

  onReset() {
    this.error = '';
    this.errorHighlightedValue = '';
    this.resetForm();
  }

  onSubmit() {
    this.isLoading = true;
    const email = this.initialForm.get('email');
    const username = this.initialForm.get('username');
    const emailValue = email?.value;
    const usernameValue = username?.value;

    const userInLocalStorage = localStorage.getItem('user');
    const parsed = userInLocalStorage
      ? (JSON.parse(userInLocalStorage) as User)
      : null;

    console.log('email =', emailValue);
    console.log('username =', usernameValue);
    console.log('userInLocalStorage =', userInLocalStorage);
    console.log('parsed =', parsed);
    if (!(parsed as any)?._id || parsed?.username !== usernameValue) {
      this.getUserId(parsed, usernameValue, emailValue);
    } else {
      this.getGames((parsed as any)._id);
      this.isLoading = false;
    }
    this.resetForm();
  }

  private initializeForm() {
    this.initialForm = new FormGroup(
      {
        username: new FormControl(null, [
          Validators.maxLength(12),
          LandingService.noEmpty,
        ]),
        email: new FormControl(null, [
          Validators.email,
          LandingService.noEmpty,
        ]),
      },
      LandingService.numberRequired(1)
    );
  }

  private getUserId(parsed: User | null, usernameValue: string, emailValue: string) {
    this.http
      .post<User>('/api/getUser', {
        email: emailValue,
        username: usernameValue,
      })
      .subscribe((user) => {
        console.log('user =', user);

        if (user) {
            localStorage.setItem(
              'user',
              JSON.stringify({
                ...user,
                email: null,
                salt: null,
                hash: null,
                resetPasswordExpires: null,
                resetPasswordToken: null,
              } as User)
            );
            this.getGames((user as any)._id);
        }
        else {
          localStorage.removeItem('user');

          this.setError(
            `There is no user with the ${
              usernameValue ? 'username' : 'email'
            } of `,
            `'${usernameValue ? usernameValue : emailValue}'.`
          );
        }
        this.isLoading = false;
      });
  }

  private getGames(userId: string) {
    const queryStringToUse = `userId=${userId}`;
    this.http.get<Game[]>(`/api/getGames?${queryStringToUse}`).subscribe(games => {
      console.log('games =', games);
      this.store.dispatch(new ngrxStore.SetGames(games));
      this.setDeals(games);
    })
  }

  private setError(error: string, toHightlightValue = '') {
    this.error = error;
    if (toHightlightValue) {
      this.errorHighlightedValue = toHightlightValue;
    }
  }

  private setDeals(games: Game[]) {
    const deals = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      for (let j = 0; j < game.deals.length; j++) {
        const deal = game.deals[j];
        deals.push(deal);
      }
    }

    this.store.dispatch(new ngrxStore.SetDeals(deals));
  }
}
