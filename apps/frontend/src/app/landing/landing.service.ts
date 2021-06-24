import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LandingService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  static noEmpty = (formControl: AbstractControl) => {
    if (formControl.value === '') return {isEmpty: true};
    return null;
  }

  //NOTE: this is how you write an ValidatorFn that accepts params
  static numberRequired (numberRequired: number): ValidatorFn {
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
}
