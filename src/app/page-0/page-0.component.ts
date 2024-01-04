import { Component, OnInit } from '@angular/core';
import { ChartData } from '../chart-data';
import { MetricsService } from '../services/metrics.service';
import { MetricsData } from '../metrics-data-json-interface';
import { AuxFunctionsService } from '../services/aux-functions.service';


@Component({
  selector: 'app-page-0',
  templateUrl: './page-0.component.html',
  styleUrls: ['./page-0.component.scss'],
})

export class Page0Component implements OnInit{
  private metricsData!: MetricsData;
  public jsonData!: Array<ChartData>;

  constructor(
    private metricsService: MetricsService,
    private auxFuncs: AuxFunctionsService
  ) {}

  ngOnInit(): void {
    this.getMetrics();

    var masonryEvents = ['load', 'resize'];
    Array.prototype.forEach.call(masonryEvents, (event) => {
      //window.addEventListener(event, resizeAllMasonryItems);
      window.addEventListener(event, this.auxFuncs.resizeAllMasonryItems);
    });
    setTimeout(() => {this.auxFuncs.resizeAllMasonryItems()}, 50);
  }

  getMetrics(): void {
    this.metricsData = this.metricsService.getJsonData();
    //console.log(this.metricsData);
    this.jsonData = [
      {
        "title": "Total number of users",
        "image": "user",
        "value": this.getTotalUsers(),
        "charts": [
          {
            "class": "barXChart",
            "title": "Numbers",
            "showTitle": false,
            "showLegend": true,
            "colors": ["despPurple", "despViolet"],
            "data": this.getUsersNumberArray(),
          },
          {
            "class": "donutChart",
            "title": "Percentage",
            "showTitle": true,
            "showLegend": true,
            "showPercentage": true,
            "colors": ["despPurple", "despViolet"],
            "data": this.getUsersPercentageArray(),
          }
        ]
      },
      {
        "title": "Total number of services",
        "image": "service",
        "value": this.getTotalServices(),
        "charts": [
          {
            "class": "barXChart",
            "title": "Numbers",
            "showTitle": true,
            "showLegend": true,
            "colors": ["despPurple", "despViolet"],
            "data": this.getServicesNumberArray(),
          }
        ]
      },
      {
        "title": "Total volume of accessed products per data provider",
        "image": "product",
        "value": this.getAccessedProductsTotalVolumeSum(),
        "charts": [
          {
            "class": "barYChart",
            "title": "Numbers",
            "showTitle": false,
            "showLegend": false,
            "colors": ["despBlue", "#66DEBB"],
            "data": this.getAccessedProductsTotalVolumeArray()
          }
        ]
      },
      {
        "title": "Total number of available models",
        "image": "model",
        "value": this.getTotalAvailableModels(),
        "charts": [
          {
            "class": "donutChart",
            "title": "Quantity",
            "showTitle": true,
            "showLegend": true,
            "showPercentage": true,
            "colors": ["despYellow", "despBlue"],
            "data": this.getModelsPercentageArray(),
          }
        ]
      },
      {
        "title": "Total number of available DestinE datasets (DEDL)",
        "image": "dataset",
        "value": this.getTotalDatasets(),
        "charts": []
      }
    ]
  }

  getTotalUsers(): number {
    let sum: number = 0;
    this.metricsData.users.forEach((d:any) => {sum += d.value});
    return sum;
  }

  getUsersNumberArray(): Array<any> {
    let arr: Array<any> = [];
    this.metricsData.users.forEach((d:any, i:any) => {arr.push({key: d.type, value: d.value, index: i})});
    return arr;
  }

  getUsersPercentageArray(): Array<any> {
    let arr: Array<any> = [];
    let totalUsers: number = 0;
    this.metricsData.users.forEach((d:any) => {totalUsers += d.value});
    this.metricsData.users.forEach((d:any, i:any) => {arr.push({key: d.type, percentage: (d.value * 100 / totalUsers), value: d.value, index: i})});
    console.log("ARR:",arr);

    return arr;
  }

  getTotalServices(): number {
    return this.metricsData.services.length;
  }

  getServicesNumberArray(): Array<any> {
    let serviceTypesList: Array<string> = [];
    this.metricsData.services.forEach((d:any) => {
      if(!serviceTypesList.includes(d.type)) {
        serviceTypesList.push(d.type);
      }
    });
    let arr: Array<any> = [];
    serviceTypesList.forEach((type:any, i:any) => {
      arr.push({key: type, value: this.metricsData.services.filter((d:any) => (d.type == type)).length, index: i})
    });
    return arr;
  }

  getAccessedProductsTotalVolumeSum(): number {
    let sum: number = 0;
    this.metricsData.dataProviders.forEach((d:any) => {sum += d.accessedProductsTotalVolume});
    return sum;
  }

  getAccessedProductsTotalVolumeArray(): Array<any> {
    let arr: Array<any> = [];
    this.metricsData.dataProviders.forEach((d:any, i:any) => {
      arr.push({key: d.label, value: d.accessedProductsTotalVolume, index: i});
    });
    return arr;
  }

  getTotalAvailableModels(): number {
    let sum: number = 0;
    this.metricsData.models.forEach((d:any) => {sum += d.value});
    return sum;
  }

  getModelsPercentageArray(): Array<any> {
    let arr: Array<any> = [];
    let totalModels: number = 0;
    this.metricsData.models.forEach((d:any) => {totalModels += d.value});
    this.metricsData.models.forEach((d:any, i:any) => {arr.push({key: d.type, percentage: (d.value * 100 / totalModels), value: d.value, index: i})});
    return arr;
  }

  getTotalDatasets(): number {
    return this.metricsData.datasets.totalNumber;
  }
}
