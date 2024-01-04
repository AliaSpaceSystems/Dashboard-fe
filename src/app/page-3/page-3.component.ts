import { Component, OnInit } from '@angular/core';
import { ChartData } from '../chart-data';
import { MetricsService } from '../services/metrics.service';
import { MetricsData } from '../metrics-data-json-interface';
import { AuxFunctionsService } from '../services/aux-functions.service';
//import * as d3 from 'd3';

@Component({
  selector: 'app-page-3',
  templateUrl: './page-3.component.html',
  styleUrls: ['./page-3.component.scss']
})
export class Page3Component {
  private metricsData!: MetricsData;
  private servicesArray: Array<any> = [];
  public jsonData!: Array<ChartData>;
  public bigChartData!: ChartData;
  public mapChartData!: ChartData;
  public granularityList: Array<any> = [
    {
      name: "lastMonth",
      label: "LAST MONTH"
    },
    {
      name: "lastThreeMonths",
      label: "LAST 3 MONTHS"
    }
  ]
  public selectedGranularity: {name:string, label:string} = this.granularityList[0];
  private categoriesArr: Array<string> = [];

  constructor(
    private metricsService: MetricsService,
    private auxFuncs: AuxFunctionsService
  ) {}

  ngOnInit(): void {
    var masonryEvents = ['load', 'resize'];
    Array.prototype.forEach.call(masonryEvents, (event) => {
      window.addEventListener(event, this.auxFuncs.resizeAllMasonryItems);
    });
    this.getMetrics();
  }

  getMetrics(): void {
    this.metricsData = this.metricsService.getJsonData();
    //console.log("this.metricsData:",this.metricsData);
    this.servicesArray = this.metricsData.services;
    this.categoriesArr = Object.keys(this.servicesArray[0].activeUsersTrend);

    setTimeout(() => {
      this.createJsonData();
    });
  }

  createJsonData() {
    this.jsonData = [
      {
        "title": "Active users trend",
        "image": "user",
        "value": this.getTotalServicesUsers(),
        "charts": [
          {
            "class": "lineChart",
            "title": "Numbers",
            "showTitle": false,
            "showLegend": true,
            "colors": ["despBlue", "despYellow"],
            "data": this.getActiveUsers(),
          }
        ]
      },
      {
        "title": "Active users trend total",
        "image": undefined,
        "value": undefined,
        "charts": [
          {
            "class": "doubleDonutSliceChart",
            "title": "Percentage",
            "showTitle": false,
            "showLegend": false,
            "showPercentage": true,
            "showTotal": true,
            "colors": ["despBlue", "despYellow"],
            "data": this.getActiveUsersTrend(),
          }
        ]
      }
    ]

    this.bigChartData = {
      "title": "",
      "image": undefined,
      "value": undefined,
      "charts": [
        {
          "class": "stateBarXChart",
          "title": "Active users per eu-esa member and cooperating state",
          "showTitle": true,
          "showLegend": false,
          "colors": ["despPurple"],
          "data": this.getActiveUsersPerState(),
        }
      ]
    }

    this.mapChartData = {
      "title": "",
      "image": undefined,
      "value": undefined,
      "charts": [
        {
          "class": "mapChart",
          "title": "Active users per eu-esa member and overseas countries and territories",
          "showTitle": true,
          "showLegend": false,
          "colors": ["despPurple"],
          "data": this.getActiveUsersPerStateOnMap(),
        }
      ]
    }

    setTimeout(() => {
      this.auxFuncs.resizeAllMasonryItems()
    }, 50);
  }

  getTotalServicesUsers(): number {
    let sum: number = 0;
    this.servicesArray.forEach((service:any) => {sum += (service.activeUsersTrend.federatedUsers[this.selectedGranularity.name].trend + service.activeUsersTrend.registeredUsers[this.selectedGranularity.name].trend)});
    return sum;
  }

  getActiveUsers() {
    let arr:Array<any> = [];
    //let tempServiceArray:Array<any> = [];
    let tempArr: Array<any> = [];
    this.servicesArray.forEach((service:any) => {
      this.categoriesArr.forEach((cat:any) => {
        service.activeUsersTrend[cat][this.selectedGranularity.name].values.forEach((dateItem: any) => {
          tempArr.push({date: dateItem.date, userType: cat, value: dateItem.value});
        });
      });
    });
    //console.log("tempArr: ", tempArr);
    for (let tempItem of tempArr) {
      let pushItem: boolean = true;
      for (let arrItem of arr) {
        if (tempItem.date === arrItem.date) {
          if (tempItem.userType === arrItem.userType) {
            pushItem = false;
            arrItem.value += tempItem.value;
          }
        }
      }
      if (pushItem === true) {
        arr.push(tempItem);
      }
    }
    //console.log("arr:",arr);
    return arr;
  }

  getActiveUsersTrend() {
    let arr:Array<any> = [];
    let tempArr: Array<any> = [];
    let preArr: Array<any> = [];
    this.servicesArray.forEach((service:any) => {
      this.categoriesArr.forEach((cat:any) => {
        tempArr.push({userType: cat, value: service.activeUsersTrend[cat][this.selectedGranularity.name].trend});
      });
    });
    //console.log("tempArr:",tempArr);
    for (let tempItem of tempArr) {
      let pushItem: boolean = true;
      for (let arrItem of preArr) {
        if (tempItem.userType === arrItem.userType) {
          pushItem = false;
          arrItem.value += tempItem.value;
          arrItem.count += 1;
        }
      }
      if (pushItem === true) {
        preArr.push(tempItem);
        preArr[preArr.length - 1].count = 1;
      }
    }
    //console.log("preArr:",preArr);
    for (let arrItem of preArr) {
      arr.push({userType: arrItem.userType, value: arrItem.value/arrItem.count});
    }
    //console.log("arr:",arr);
    return arr;
  }

  getActiveUsersPerState() {
    let arr:Array<any> = [];
    //let tempArr: Array<any> = [];
    this.servicesArray.forEach((service:any) => {
      service.activeUsersPerState.values.forEach((item:any) => {
        let tempItem = arr.filter((arrItem:any) => arrItem.state === item.stateName)[0];
        if ( tempItem !== undefined) {
          tempItem.value += item.value;
          tempItem.trend += item.trend;
        } else {
          arr.push({state: item.stateName, value: item.value, trend: item.trend});
        }
      });
    });
    let serviceNumber = this.servicesArray.length;
    arr.forEach((arrItem:any) => {
      arrItem.trend /= serviceNumber;
    })
    //console.log("getActiveUsersPerState:", arr);

    return arr;
  }

  getActiveUsersPerStateOnMap() {
    let arr:Array<any> = [];
    //let tempArr: Array<any> = [];
    this.servicesArray.forEach((service:any) => {
      service.activeUsersPerState.values.forEach((item:any) => {
        let tempItem = arr.filter((arrItem:any) => arrItem.state === item.stateName)[0];
        if ( tempItem !== undefined) {
          tempItem.value += item.value;
        } else {
          arr.push({state: item.stateName, value: item.value});
        }
      });
    });
    let serviceNumber = this.servicesArray.length;
    arr.forEach((arrItem:any) => {
      arrItem.trend /= serviceNumber;
    })
    //console.log("getActiveUsersPerStateOnMap:", arr);

    return arr;
  }

  onGranularityChanged(granularity:any) {
    this.selectedGranularity = granularity;
    setTimeout(() => {
      this.createJsonData();
    });
  }
}
