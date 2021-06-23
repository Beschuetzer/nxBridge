import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import { LandingService } from './landing.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [LandingService],
  exports: [LandingComponent],
})
export class LandingModule {}
