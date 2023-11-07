import { AfterViewInit, Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from 'src/app/services/app.config';
import settings from 'src/assets/config/site-links.json';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit{
  public sidebarMenuLinks = settings.siteLinks;
  public version = AppConfig.settings.version;

  constructor (router: Router) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        document.querySelectorAll('.sidebar-nav-link').forEach((item) => item.classList.remove('current'));
        document.querySelectorAll('.sidebar-nav-link[href="/'+document.URL.split('/').slice(-1)+'"]')
          .forEach((link) => link.classList.add('current'));
      }
    });
  }

  ngAfterViewInit(): void {
  }
}
