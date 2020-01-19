import {Component, Input} from '@angular/core';

@Component({
  selector: 'lib-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.css']
})
export class GreetingComponent {

  @Input() name: string;
}
