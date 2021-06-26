import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoinNamesPipe } from './join-names.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JoinNamesPipe
  ],
  exports: [
    JoinNamesPipe,
  ]
})
export class PipesModule {}
