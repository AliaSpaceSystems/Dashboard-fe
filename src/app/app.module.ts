import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Page0Component } from './page-0/page-0.component';
import { Page1Component } from './page-1/page-1.component';
import { Page2Component } from './page-2/page-2.component';
import { Page3Component } from './page-3/page-3.component';
import { Page4Component } from './page-4/page-4.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppConfig } from './services/app.config';
import { HeaderComponent } from './header/header.component';
import { DashboardItemComponent } from './dashboard-item/dashboard-item.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    Page0Component,
    Page1Component,
    Page2Component,
    Page3Component,
    Page4Component,
    Page0Component,
    HeaderComponent,
    DashboardItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    AppConfig
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
