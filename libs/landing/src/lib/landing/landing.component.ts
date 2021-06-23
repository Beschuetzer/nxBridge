import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LandingService } from '../landing.service';
import { Game } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  constructor(
    private landingService: LandingService,
    private http: HttpClient,
  ) {}

  public initialForm: FormGroup = new FormGroup({});


  get emailIsValid(): boolean | undefined {
    const email = this.initialForm.get('email');
    if (!email) return true;
    return email.touched && email.value !== '' && email.valid
  }

  get usernameIsValid(): boolean | undefined {
    const username = this.initialForm.get('username');
    if (!username) return true;
    return username.touched && username.value !== '' && username.valid
  }

  get stringToSearchUsing(): string | undefined {
    const preStringUsername = 'Search for user with username of ';
    const preStringEmail = 'Search for user with email of ';
    
    const email = this.initialForm.get('email')?.value;
    const username = this.initialForm.get('username')?.value;

    const usernameString = `${preStringUsername}${username}?`;
    const emailString = `${preStringEmail}${email}?`;

    if (!username && !email) return '';
    else if (username && !email) return usernameString;
    else if (!username && email) return emailString;
    else return usernameString;
  }

  

  ngOnInit(): void {
    this.initializeForm();
  }

  public resetForm() {
    this.initializeForm();
  }

  private initializeForm() {
    this.initialForm = new FormGroup({
      "username": new FormControl(
        null,
        [
          Validators.maxLength(12),
          LandingService.noEmpty
        ]
      ),
      "email": new FormControl(
        null,
        [
          Validators.email,
          LandingService.noEmpty
        ]
      )
    }, LandingService.numberRequired(1));
  }

  // private validateRequired (formGroup: FormGroup) {
  //   if ((formGroup?.get('email') as FormGroup)?.value !== '' || (formGroup?.get('username') as FormGroup)?.value !== '') return {formValid: true};
  
  //   return null;
  // }

  onSubmit() {
    const email = this.initialForm.get('email');
    const username = this.initialForm.get('username');

    console.log('email =', email?.value);
    console.log('username =', username?.value);

    this.http.post<Game[]>('/api/getUser', { email: email?.value, username: username?.value}).subscribe(games => {
      console.log('games =', games);
    })

  }
  
}
