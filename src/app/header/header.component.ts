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
  public pageSubName: string = '';
  public lastUpdateTime = new Date().toISOString();
  public currentUrlList: Array<string> = [];
  public isChildLink: boolean = false;

  constructor (router: Router) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
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
          this.pageSubName = '';
          this.pageName = this.sidebarMenuLinks.filter((item:any) => item.link === this.currentUrlList[tempArrayIndex])[0].name;
        } else if (tempArrayIndex == this.currentUrlList.length - 2) {
          //console.log("PENULTIMO element");
          this.isChildLink = true;
          this.pageSubName = ' // ' + this.currentUrlList[this.currentUrlList.length-1].toUpperCase();
          this.pageName = this.sidebarMenuLinks.filter((item:any) => item.link === this.currentUrlList[tempArrayIndex])[0].name;
        } else {
          //console.log("OTHER element");
        }
      }
    });
  }
}
