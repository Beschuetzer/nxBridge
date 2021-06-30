import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealPlayerComponent } from './deal-player/deal-player.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    DealPlayerComponent
  ],
  exports: [
    DealPlayerComponent,
  ]
})
export class DealPlayerModule {}
