import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Page0Component } from './page-0/page-0.component';
import { Page1Component } from './page-1/page-1.component';
import { Page2Component } from './page-2/page-2.component';
import { Page3Component } from './page-3/page-3.component';
import { Page4Component } from './page-4/page-4.component';
import settings from 'src/assets/config/site-links.json';

const routes: Routes = [
  { path: settings.siteLinks[0].link, component: Page0Component},
  { path: settings.siteLinks[1].link, component: Page1Component},
  { path: settings.siteLinks[2].link, component: Page2Component},
  { path: settings.siteLinks[3].link, component: Page3Component},
  { path: settings.siteLinks[4].link, component: Page4Component},
  { path: '', redirectTo: settings.siteLinks[0].link, pathMatch: 'full'},
  { path: '**', redirectTo: settings.siteLinks[0].link}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
