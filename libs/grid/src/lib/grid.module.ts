import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { HeaderModule } from '@nx-bridge/header';

@NgModule({
  imports: [CommonModule, HeaderModule],
  declarations: [
    GridComponent
  ],
  exports: [
    GridComponent,
  ]
})
export class GridModule {}
