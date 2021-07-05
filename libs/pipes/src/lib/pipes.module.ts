import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoinNamesPipe } from './join-names.pipe';
import { SuitToStringPipe } from './suit-to-string.pipe';
import { GetHtmlEntityFromSuitPipe } from './get-html-entity-from-suit.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { ReplacePipe } from './replace.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe,
    SafeHtmlPipe,
    ReplacePipe
  ],
  exports: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe,
    SafeHtmlPipe,
    ReplacePipe,
  ]
})
export class PipesModule {}
