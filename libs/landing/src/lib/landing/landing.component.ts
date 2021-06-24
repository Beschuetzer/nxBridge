import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LandingService } from '../landing.service';
import { User } from '@nx-bridge/interfaces-and-types';
import { HelpersService } from '@nx-bridge/helpers';

@Component({
  selector: 'nx-bridge-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  constructor(
    private landingService: LandingService,
    private http: HttpClient,
    private helpersService: HelpersService,

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
      this.helpersService.getUserId(parsed, usernameValue, emailValue);
    } else {
      this.helpersService.getGames((parsed as any)._id);
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

  private subscribeToError(error: string, toHightlightValue = '') {
    this.error = error;
    if (toHightlightValue) {
      this.errorHighlightedValue = toHightlightValue;
    }
  }

}
