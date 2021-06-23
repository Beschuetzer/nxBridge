import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import { LandingService } from './landing.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSliderModule],
  providers: [LandingService],
  exports: [LandingComponent],
})
export class LandingModule {}
