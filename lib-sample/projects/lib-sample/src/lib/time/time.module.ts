import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeComponent } from './time.component';

@NgModule({
  declarations: [TimeComponent],
  exports: [TimeComponent],
  imports: [
    CommonModule
  ]
})
export class TimeModule { }
