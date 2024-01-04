import { AfterViewInit, Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from 'src/app/services/app.config';
import settings from 'src/assets/config/site-links.json';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public sidebarMenuLinks = settings.siteLinks;
  public version = AppConfig.settings.version;
  public currentUrlList: Array<string> = [];
  public isChildLink: boolean = false;
  public childLink: string = '';

  constructor (router: Router) {
    // Check current URL to set sidebar css
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        document.querySelectorAll('.sidebar-nav-link').forEach((item) => item.classList.remove('current'));
        this.currentUrlList = document.URL.split('/');
        let tempArrayIndex: number = -1;
        this.sidebarMenuLinks.forEach((item:any, index:number) => {
          if (this.currentUrlList.lastIndexOf(item.link) > -1) tempArrayIndex = this.currentUrlList.lastIndexOf(item.link);
        });
        if (tempArrayIndex < 0) {
          //console.log("ERROR, link not present");
        } else if (tempArrayIndex == this.currentUrlList.length - 1) {
          //console.log("LAST element");
          this.isChildLink = false;
          this.childLink = '';
          document.querySelectorAll('.sidebar-nav-link[href="/'+this.currentUrlList[tempArrayIndex]+'"]')[0].classList.add('current');
        } else if (tempArrayIndex == this.currentUrlList.length - 2) {
          //console.log("PENULTIMO element");
          this.isChildLink = true;
          this.childLink = this.currentUrlList[this.currentUrlList.length-1];
          //console.log("CHILD link: " + this.childLink);
          document.querySelectorAll('.sidebar-nav-link[href="/'+this.currentUrlList[tempArrayIndex]+'"]')[0].classList.add('current');
        } else {
          //console.log("OTHER element");
        }
      }
    });
  }
}
