import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from 'src/app/services/app.config';
import settings from 'src/assets/config/site-links.json';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public sidebarMenuLinks = settings.siteLinks;
  public pageName: string = '';
  public lastUpdateTime = new Date().toISOString();

  constructor (router: Router) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.pageName = this.sidebarMenuLinks.filter((item) => item.link == document.URL.split('/').slice(-1)[0])[0].name;
      }
    });
  }
}
