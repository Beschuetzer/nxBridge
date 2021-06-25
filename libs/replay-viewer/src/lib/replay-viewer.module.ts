import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LandingPageComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: LandingPageComponent} 
    ]),
  ],
})
export class ReplayViewerModule {}
