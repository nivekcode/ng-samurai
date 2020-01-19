import {Component, Input} from '@angular/core';

@Component({
  selector: 'howdy-name',
  template: `<h1>Hello {{name}}</h1>`
})
export class HowdyNameComponent {
  @Input() name: string;
}
