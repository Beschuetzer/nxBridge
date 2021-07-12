import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoinNamesPipe } from './join-names.pipe';
import { SuitToStringPipe } from './suit-to-string.pipe';
import { GetHtmlEntityFromSuitPipe } from './get-html-entity-from-suit.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { ReplacePipe } from './replace.pipe';
import { CardAsNumberToCardHtmlEntityStringPipe } from './card-as-number-to-card-html-entity-string.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe,
    SafeHtmlPipe,
    ReplacePipe,
    CardAsNumberToCardHtmlEntityStringPipe
  ],
  exports: [
    JoinNamesPipe,
    SuitToStringPipe,
    GetHtmlEntityFromSuitPipe,
    SafeHtmlPipe,
    ReplacePipe,
    CardAsNumberToCardHtmlEntityStringPipe,
  ]
})
export class PipesModule {}
