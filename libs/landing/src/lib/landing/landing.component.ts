import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'nx-bridge-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  public initialForm: FormGroup = new FormGroup({});

  constructor(

  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.initialForm = new FormGroup({
      "username": new FormControl(
        "",
        [
          Validators.maxLength(12),
        ]
      ),
      "email": new FormControl(
        "",
        [
          Validators.email,
        ]
      )
    }, Validators.minLength(1));
  }

  // private validateRequired (formGroup: FormGroup) {
  //   if ((formGroup?.get('email') as FormGroup)?.value !== '' || (formGroup?.get('username') as FormGroup)?.value !== '') return {formValid: true};
  
  //   return null;
  // }

  onSubmit(e: Event) {
    console.log('e =', e);
  }
  
}

