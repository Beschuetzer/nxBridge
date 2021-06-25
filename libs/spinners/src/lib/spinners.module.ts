import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BallSpinnerComponent } from './ball-spinner/ball-spinner.component';
import { LineSpinnerComponent } from './line-spinner/line-spinner.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    BallSpinnerComponent,
    LineSpinnerComponent,
  ],
  exports: [
    BallSpinnerComponent,
    LineSpinnerComponent,
  ]
})
export class SpinnersModule {}
