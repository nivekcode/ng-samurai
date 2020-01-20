import {Component, Input, OnInit} from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'howdy-time',
  template: `<h1>Hello today is the {{time}}</h1>`
})
export class HowdyTimeComponent implements OnInit {
  time: string;

  ngOnInit(): void {
    this.time = moment().format('DD.MM.YYYY');
  }
}
