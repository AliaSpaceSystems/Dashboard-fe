import { Component } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-page-1',
  templateUrl: './page-1.component.html',
  styleUrls: ['./page-1.component.scss']
})
export class Page1Component {
  constructor (private locationStrategy: PathLocationStrategy) {}

  hideUrl() {
    this.locationStrategy.replaceState(null, 'page-1', 'executive', '');
  }
}
