import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'nx-bridge-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
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

  constructor(

  ) {}

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
          noEmpty
        ]
      ),
      "email": new FormControl(
        null,
        [
          Validators.email,
          noEmpty
        ]
      )
    }, numberRequired(1));
  }

  // private validateRequired (formGroup: FormGroup) {
  //   if ((formGroup?.get('email') as FormGroup)?.value !== '' || (formGroup?.get('username') as FormGroup)?.value !== '') return {formValid: true};
  
  //   return null;
  // }

  onSubmit(e: Event) {
    console.log('e =', e);
    console.log('this.initialForm email', this.initialForm.get('email')?.value.length);
  }
  
}

export const noEmpty = (formControl: AbstractControl) => {
  if (formControl.value === '') return {isEmpty: true};
  return null;
}

//NOTE: this is how you write an ValidatorFn that accepts params
export function numberRequired (numberRequired: number): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {

    let haveInputCount = 0;
    const controlKeys = Object.keys((formGroup as FormGroup).controls);

    for (let i = 0; i < controlKeys.length; i++) {
      const key = controlKeys[i];
      const control = (formGroup as FormGroup).controls[key];
      if (control.value !== '' && control.value !== null && control.value !== undefined) haveInputCount++;
    }

    if (haveInputCount < numberRequired) return {numberRequired: false}
    return null;
  }
}