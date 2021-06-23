import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import { LandingService } from './landing.service';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [CommonModule],
  providers: [LandingService],
  exports: [
    LandingComponent
  ],
})
export class LandingModule {}
