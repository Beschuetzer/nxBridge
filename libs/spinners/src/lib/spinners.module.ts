import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BallSpinnerComponent } from './ball-spinner/ball-spinner.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    BallSpinnerComponent,
  ],
  exports: [
    BallSpinnerComponent,
  ]
})
export class SpinnersModule {}
