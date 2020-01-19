import {Component, OnInit} from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'lib-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit {

  now;

  ngOnInit() {
    this.now = moment().format('DD.MM.YYYY');
  }

}
