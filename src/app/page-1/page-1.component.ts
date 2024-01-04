import { Component, OnInit } from '@angular/core';
import jsonData from 'src/assets/test/page_1_data.json';
import { ServiceTable } from '../service-table';
import { ImageUrl } from '../image-url';

import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-1',
  templateUrl: './page-1.component.html',
  styleUrls: ['./page-1.component.scss']
})

export class Page1Component implements OnInit {
  public serviceList: Array<ServiceTable> = [];
  public serviceListFiltered: Array<ServiceTable> = [];
  public categoryList: Array<string> = [];
  public filterList: Array<string> = [
    'all', 'popular', 'latest'
  ];

  public serviceTableHeaderValues: Array<string> = [];

  public imageList: ImageUrl = {
    "iam": "/assets/images/services_icons/iam.svg",
    "planet_rocket": "/assets/images/services_icons/planet_rocket.svg",
    "satellite": "/assets/images/services_icons/satellite.svg",
    "globe_earth": "/assets/images/services_icons/globe_earth.svg",
    "gps_receiving": "/assets/images/services_icons/gps_receiving.svg",
  }

  private selectAllInput!: HTMLInputElement;
  private categoriesInputs: any;

  constructor (
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.serviceList = jsonData.serviceList;
    this.serviceListFiltered = this.serviceList;
    for (let service of this.serviceList) {
      if (!(this.categoryList.includes(service.category))) {
        this.categoryList.push(service.category);
      }
    }
    this.serviceTableHeaderValues = (Object.keys(this.serviceList[0]) as (keyof ServiceTable)[]);
    this.selectAllInput = <HTMLInputElement>document.getElementById('select-all');
    this.categoriesInputs = document.getElementsByClassName('service-categories')[0].getElementsByClassName('category-filter-input');
  }

  onSelectAllCategories(event:any) {
    if (event.target.checked) {
      for (let item of this.categoriesInputs) {
        item.checked = true;
      }
    } else {
      for (let item of this.categoriesInputs) {
        item.checked = false;
      }
    }
    this.onCategoriesChanged(event);
  }

  onSelectOneCategory(event:any) {
    let allSelected: boolean = true;
    for (let item of this.categoriesInputs) {
      if (item.checked == false) allSelected = false;
    }
    if (allSelected) this.selectAllInput.checked = true;
    else this.selectAllInput.checked = false;

    this.onCategoriesChanged(event);
  }

  onCategoriesChanged(event:any) {
    let filterArray: Array<string> = [];
    for (let item of this.categoriesInputs) {
      if (item.checked) filterArray.push(item.value);
    }
    this.serviceListFiltered = this.serviceList.filter((service:any) => filterArray.includes(service.category));
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onServiceClicked(serviceName:any) {
    //console.log("Clicked event: ", serviceName);
    this.router.navigate([serviceName], {relativeTo: this.activatedRoute});
  }
}
