import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealPlayerComponent } from './deal-player/deal-player.component';
import {PipesModule} from '@nx-bridge/pipes';

@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [
    DealPlayerComponent
  ],
  exports: [
    DealPlayerComponent,
  ]
})
export class DealPlayerModule {}
