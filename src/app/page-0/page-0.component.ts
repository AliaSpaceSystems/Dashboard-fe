import { Component, OnInit } from '@angular/core';
import { ChartData } from '../chart-data';
import jsonData from 'src/assets/test/fakePage0DashboardData.json';


@Component({
  selector: 'app-page-0',
  templateUrl: './page-0.component.html',
  styleUrls: ['./page-0.component.scss'],
})

export class Page0Component implements OnInit{
  public jsonData!: Array<ChartData>;
  constructor() {}

  ngOnInit(): void {
    //this.generateData();
    this.jsonData = jsonData;
    setTimeout(() => {resizeAllMasonryItems()}, 50);
    var masonryEvents = ['load', 'resize'];
    Array.prototype.forEach.call(masonryEvents, (event) => {
      window.addEventListener(event, resizeAllMasonryItems);
    });
  }

  generateData() {
    /* for (var k = 0; k < jsonData.length; k++) {
      // number of dashboard items to create
      let item: Data[] = [];
      //console.log(item);

      for (let j = 0; j < (1 + Math.floor(Math.random() * 2)); j++) {
        // random number of graphs per dashboard item
        item.push({
          //class: 'barChart',
          class: 'donutChart',
          data: Array((8 + Math.floor(Math.random() * 10)))
        });
        for (let i = 0; i < item[j].data.length; i++) {
          // random number of data per single graph
          item[j].data[i] = {
            "index": i,
            "value": Math.floor(Math.random() * 100)
          };
        }
      }

      this.chartDataArray.push(
        {
          "title": `${jsonData[k].title}`,
          "arrayNumber": item.length,
          "values": item
        }
      );
    }
    console.log("this.chartData: ", this.chartDataArray);
    //console.log(JSON.stringify(this.chartData, null, 2)); */
  }
}

function resizeAllMasonryItems(){
  var allItems = document.getElementsByClassName('masonry-item-container');
  /*
   * Loop through the above list and execute the spanning function to
   * each list-item (i.e. each masonry item)
   */
  for(var i=0;i<allItems.length;i++){
    resizeMasonryItem(allItems[i]);
  }
}

function resizeMasonryItem(item: any){
  /* Get the grid object, its row-gap, and the size of its implicit rows */
  var grid = document.getElementsByClassName('masonry-layout-container')[0];
  var rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  var rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

  /*
   * Spanning for any brick = S
   * Grid's row-gap = G
   * Size of grid's implicitly create row-track = R
   * Height of item content = H
   * Net height of the item = H1 = H + G
   * Net height of the implicit row-track = T = G + R
   * S = H1 / T
   */
  var rowSpan = Math.ceil((item.querySelector('.masonry-item-content').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));

  /* Set the spanning as calculated above (S) */
  item.style.gridRowEnd = 'span '+rowSpan;
}
