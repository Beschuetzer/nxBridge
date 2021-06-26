import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoinNamesPipe } from './join-names.pipe';
import { SuitToStringPipe } from './suit-to-string.pipe';
import { GetHtmlEntityFromSuitPipe } from './get-html-entity-from-suit.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe
  ],
  exports: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe
  ]
})
export class PipesModule {}
