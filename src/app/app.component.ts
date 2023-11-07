import { Component } from '@angular/core';
import { AppConfig } from './services/app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = AppConfig.settings.title;
}
