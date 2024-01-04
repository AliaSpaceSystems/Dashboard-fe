import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartData } from '../chart-data';
import { MetricsService } from '../services/metrics.service';
import { MetricsData } from '../metrics-data-json-interface';
import { AuxFunctionsService } from '../services/aux-functions.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent implements OnInit{
  private metricsData!: MetricsData;
  public jsonData!: Array<ChartData>;
  public serviceId: any;
  private selectedService: any;

  constructor(
    private __ActivatedRoute: ActivatedRoute,
    private metricsService: MetricsService,
    private auxFuncs: AuxFunctionsService
  ) {}

  ngOnInit(): void {
    this.serviceId = this.__ActivatedRoute.snapshot.params['serviceId'];
    //console.log("this.serviceId: ", this.serviceId);

    this.getMetrics(this.serviceId);
    var masonryEvents = ['load', 'resize'];
    Array.prototype.forEach.call(masonryEvents, (event) => {
      //window.addEventListener(event, resizeAllMasonryItems);
      window.addEventListener(event, this.auxFuncs.resizeAllMasonryItems);
    });

    setTimeout(() => {this.auxFuncs.resizeAllMasonryItems()}, 50);
  }

  getMetrics(serviceId: string): void {
    this.metricsData = this.metricsService.getJsonData();
    this.selectedService = this.metricsData.services.filter((item:any) => item.name === serviceId)[0];
    //console.log("this.selectedService: ", this.selectedService);
    if (this.selectedService != undefined) {
      this.jsonData = [
        {
          "title": "Total number of registered users",
          "image": "user",
          "value": this.getTotalRegisteredUsers(),
          "charts": [
            {
              "class": "areaChart",
              "title": "Number of registered users",
              "showTitle": true,
              "showLegend": false,
              "colors": ["despPurple", "despViolet"],
              "data": this.getRegisteredUsersNumberArray(),
            }
          ]
        },
        {
          "title": "Total number of federated users",
          "image": "service",
          "value": this.getTotalFederatedUsers(),
          "charts": [
            {
              "class": "areaChart",
              "title": "Number of federated users",
              "showTitle": true,
              "showLegend": false,
              "colors": ["despPurple", "despViolet"],
              "data": this.getFederatedUsersNumberArray(),
            }
          ]
        },
        {
          "title": "Total Active User Sessions per time",
          "image": "service",
          "value": this.getTotalActiveUserSessionsPerTime(),
          "charts": [
            {
              "class": "areaChart",
              "title": "Active User Sessions per time",
              "showTitle": true,
              "showLegend": false,
              "colors": ["despPurple", "despViolet"],
              "data": this.getActiveUserSessionsPerTime(),
            }
          ]
        },
        {
          "title": "Number of authentication requests per time unit",
          "image": "dataset",
          "value": this.getAuthReqPerTimeUnitNumber(),
          "charts": []
        },
        {
          "title": "Service rating",
          "image": "dataset",
          "value": this.getServiceRating(),
          "charts": []
        }
      ]
    }
  }

  getTotalRegisteredUsers(): number {
    return this.selectedService.serviceMetrics.filter((item:any) => item.name === 'registered-user-number')[0].totalValue;
  }

  getTotalFederatedUsers(): number {
    return this.selectedService.serviceMetrics.filter((item:any) => item.name === 'federated-user-number')[0].totalValue;
  }

  getRegisteredUsersNumberArray(): Array<any> {
    let arr: Array<any> = [];
    this.selectedService.serviceMetrics.filter((item:any) => item.name === 'registered-user-number')[0].values.forEach((d:any, i:any) => {arr.push({key: d.date, value: d.value, index: i})});
    return arr;
  }

  getFederatedUsersNumberArray(): Array<any> {
    let arr: Array<any> = [];
    this.selectedService.serviceMetrics.filter((item:any) => item.name === 'federated-user-number')[0].values.forEach((d:any, i:any) => {arr.push({key: d.date, value: d.value, index: i})});
    return arr;
  }

  getTotalActiveUserSessionsPerTime(): number {
    return this.selectedService.serviceMetrics.filter((item:any) => item.name === 'active-user-sessions-per-time')[0].totalValue;
  }

  getActiveUserSessionsPerTime(): Array<any> {
    let arr: Array<any> = [];
    this.selectedService.serviceMetrics.filter((item:any) => item.name === 'active-user-sessions-per-time')[0].values.forEach((d:any, i:any) => {arr.push({key: d.date, value: d.value, index: i})});
    return arr;
  }

  getAuthReqPerTimeUnitNumber(): number {
    return this.selectedService.serviceMetrics.filter((item:any) => item.name === 'number-of-authentication-requests-per-time-unit')[0].totalValue;
  }

  getServiceRating(): number {
    return this.selectedService.serviceMetrics.filter((item:any) => item.name === 'service-rating')[0].totalValue;
  }
}
