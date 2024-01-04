import { Component, OnInit } from '@angular/core';
import { ChartData } from '../chart-data';
import { MetricsService } from '../services/metrics.service';
import { MetricsData } from '../metrics-data-json-interface';
import { AuxFunctionsService } from '../services/aux-functions.service';

@Component({
  selector: 'app-page-2',
  templateUrl: './page-2.component.html',
  styleUrls: ['./page-2.component.scss']
})
export class Page2Component implements OnInit{
  private metricsData!: MetricsData;
  public jsonData!: Array<ChartData>;
  public dataSourceList: any;
  public selectedDataProvider: any;
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
    this.dataSourceList = this.metricsData.dataProviders;
    this.selectedDataProvider = this.dataSourceList[0];
    setTimeout(() => {
      this.createJsonData();
    });
  }

  createJsonData() {
    this.jsonData = [
      {
        "title": "Accessed products per dataset",
        "image": "volumeTot",
        "value": undefined,
        "charts": [
          {
            "class": "barYStackedChart",
            "title": "Numbers",
            "showTitle": true,
            "showLegend": true,
            "colors": ["despBlue", "despYellow"],
            "data": this.getNumberAccessedProductsPerDataset(),
          },
          {
            "class": "barYStackedChart",
            "title": "Volume",
            "showTitle": true,
            "showLegend": true,
            "colors": ["despViolet", "despYellow"],
            "data": this.getVolumeAccessedProductsPerDataset(),
          }
        ]
      },
      {
        "title": "Published products per dataset",
        "image": "product",
        "value": undefined,
        "charts": [
          {
            "class": "barYStackedChart",
            "title": "Numbers",
            "showTitle": true,
            "showLegend": true,
            "colors": ["despBlue", "despPurple"],
            "data": this.getNumberPublishedProductsPerDataset(),
          },
          {
            "class": "barYStackedChart",
            "title": "Volume",
            "showTitle": true,
            "showLegend": true,
            "colors": ["despBlue", "despViolet"],
            "data": this.getVolumePublishedProductsPerDataset(),
          }
        ]
      },
      {
        "title": "",
        "image": undefined,
        "value": undefined,
        "charts": [
          {
            "class": "donutChart",
            "title": "Total number of accessed data per user category",
            "showTitle": true,
            "showLegend": true,
            "showPercentage": true,
            "colors": ["despPurple", "despViolet"],
            "data": this.getAccessedDataPerUserCategory(),
          }
        ]
      },
      {
        "title": "",
        "image": undefined,
        "value": undefined,
        "charts": [
          {
            "class": "donutChart",
            "title": "Total number of accessed data per dataset high-level category",
            "showTitle": true,
            "showLegend": true,
            "showPercentage": true,
            "showTotal": true,
            "colors": ["despPurple", "despBlue"],
            "data": this.getAccessedDataPerDatasetCategory(),
          }
        ]
      }
    ]
    setTimeout(() => {
      this.auxFuncs.resizeAllMasonryItems()
    }, 50);
  }

  onSourceSelected(event: any) {
    //console.log(event.target.options.selectedIndex);
    let idx:number = event.target.options.selectedIndex;
    this.selectedDataProvider = this.dataSourceList[idx];
    this.onDatasetChanged(event);
  }

  onDatasetChanged(event: any) {
    //console.log(event);
    this.createJsonData();
  }

  getNumberAccessedProductsPerDataset(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let selectedDatasetsArr: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        selectedDatasetsArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0]);
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].accessedProducts[this.selectedGranularity.name]);
      };
    });
    let longestArrayIndex = this.auxFuncs.getLongestArrayIndex(tempArr);
    tempArr[longestArrayIndex].forEach((item:any) => {
      arr.push({});
      arr[arr.length-1]["date"] = item.date;

      selectedDatasetsArr.forEach((tempSingleDatasetArr: any) => {
        arr[arr.length-1][tempSingleDatasetArr.name] = tempSingleDatasetArr.accessedProducts[this.selectedGranularity.name].filter((tempSingleDatasetArrItem:any) => tempSingleDatasetArrItem.date === item.date)[0].numberValue;
      });
    });

    //console.log("Arr: ", arr);
    return arr;
  }

  getVolumeAccessedProductsPerDataset(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let selectedDatasetsArr: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        selectedDatasetsArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0]);
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].accessedProducts[this.selectedGranularity.name]);
      };
    });
    let longestArrayIndex = this.auxFuncs.getLongestArrayIndex(tempArr);
    tempArr[longestArrayIndex].forEach((item:any) => {
      arr.push({});
      arr[arr.length-1]["date"] = item.date;

      selectedDatasetsArr.forEach((tempSingleDatasetArr: any) => {
        arr[arr.length-1][tempSingleDatasetArr.name] = tempSingleDatasetArr.accessedProducts[this.selectedGranularity.name].filter((tempSingleDatasetArrItem:any) => tempSingleDatasetArrItem.date === item.date)[0].volumeValue;
      });
    });

    //console.log("Arr: ", arr);
    return arr;
  }

  getNumberPublishedProductsPerDataset(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let selectedDatasetsArr: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        selectedDatasetsArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0]);
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].publishedProducts[this.selectedGranularity.name]);
      };
    });
    let longestArrayIndex = this.auxFuncs.getLongestArrayIndex(tempArr);
    tempArr[longestArrayIndex].forEach((item:any) => {
      arr.push({});
      arr[arr.length-1]["date"] = item.date;

      selectedDatasetsArr.forEach((tempSingleDatasetArr: any) => {
        arr[arr.length-1][tempSingleDatasetArr.name] = tempSingleDatasetArr.publishedProducts[this.selectedGranularity.name].filter((tempSingleDatasetArrItem:any) => tempSingleDatasetArrItem.date === item.date)[0].numberValue;
      });
    });

    //console.log("Arr: ", arr);
    return arr;
  }

  getVolumePublishedProductsPerDataset(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let selectedDatasetsArr: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        selectedDatasetsArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0]);
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].publishedProducts[this.selectedGranularity.name]);
      };
    });
    let longestArrayIndex = this.auxFuncs.getLongestArrayIndex(tempArr);
    tempArr[longestArrayIndex].forEach((item:any) => {
      arr.push({});
      arr[arr.length-1]["date"] = item.date;

      selectedDatasetsArr.forEach((tempSingleDatasetArr: any) => {
        arr[arr.length-1][tempSingleDatasetArr.name] = tempSingleDatasetArr.publishedProducts[this.selectedGranularity.name].filter((tempSingleDatasetArrItem:any) => tempSingleDatasetArrItem.date === item.date)[0].volumeValue;
      });
    });

    //console.log("Arr: ", arr);
    return arr;
  }

  getAccessedDataPerUserCategory(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let tempCategories: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].accessedDataPerUserCategory[this.selectedGranularity.name]);
      };
    });
    tempCategories = Object.keys(tempArr[0]);
    tempCategories.forEach((tempCatItem:any) => {
      let sum:number = tempArr.reduce((tempSum:number, obj:any) => {
        return tempSum + obj[tempCatItem];
      }, 0)
      arr.push({key: tempCatItem, value: sum});
    });
    let tempPercSum = arr.reduce((tempSum:number, obj:any) => {
      return tempSum + obj.value;
    }, 0);
    arr.forEach((arrItem:any) => {
      arrItem.percentage = (arrItem.value * 100) / tempPercSum;
    });
    return arr;
  }

  getAccessedDataPerDatasetCategory(): Array<any> {
    let arr: Array<any> = [];
    let tempArr: Array<any> = [];
    let tempCategories: Array<any> = [];
    let datasetCheckboxes = document.getElementsByClassName('p2-dataset-checkboxes');

    [].forEach.call(datasetCheckboxes, (dataset: any) => {
      if (dataset.checked) {
        tempArr.push(this.selectedDataProvider.datasets.filter((ds:any) => ds.name === dataset.id)[0].accessedDataPerDatasetCategory[this.selectedGranularity.name]);
      };
    });
    tempCategories = Object.keys(tempArr[0]);
    tempCategories.forEach((tempCatItem:any) => {
      let sum:number = tempArr.reduce((tempSum:number, obj:any) => {
        return tempSum + obj[tempCatItem];
      }, 0)
      arr.push({key: tempCatItem, value: sum});
    });
    let tempPercSum = arr.reduce((tempSum:number, obj:any) => {
      return tempSum + obj.value;
    }, 0);
    //console.log("Arr PRE: "+ JSON.stringify(arr, null, 2));
    //console.log("tempPercSum:", tempPercSum);
    arr.forEach((arrItem:any) => {
      arrItem.percentage = (arrItem.value * 100) / tempPercSum;
    });
    //console.log("Arr POST:", arr);
    return arr;
  }

  onGranularityChanged(granularity:any) {
    this.selectedGranularity = granularity;
    setTimeout(() => {
      this.createJsonData();
    });
  }

  /* getLongestArrayIndex(array: Array<Array<any>>):number {
    let ret: number = -1;
    let maxNum: number = 0;
    array.forEach((arr: any, i: number) => {
      if (arr.length > maxNum) {
        ret = i;
        maxNum = arr.length;
      }
    });
    return ret;
  } */
}
