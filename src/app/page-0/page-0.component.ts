import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-0',
  templateUrl: './page-0.component.html',
  styleUrls: ['./page-0.component.scss'],
})

export class Page0Component implements OnInit{
  public chartData!: Array<any> ;

  public dashboardItems = [
    {"title": "Total number of users"},
    {"title": "Total number of services"},
    {"title": "Total number of available models"},
    {"title": "Total volume of accessed products per data provider"},
    {"title": "Total number of available DestinE datasets (DEDL)"}
  ];

  constructor() {}

  ngOnInit(): void {
    this.generateData();
    setTimeout(() => {resizeAllMasonryItems()}, 10);
    var masonryEvents = ['load', 'resize'];
    Array.prototype.forEach.call(masonryEvents, (event) => {
      window.addEventListener(event, resizeAllMasonryItems);
    });
  }

  generateData() {
    this.chartData = [];
    for (var k = 0; k < this.dashboardItems.length; k++) {
      let data = [];
      for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
        data.push({
          "index": i,
          "value": Math.floor(Math.random() * 100)
      });
      }
      this.chartData.push(
        {
          "title": `${this.dashboardItems[k].title}`,
          "data": data
        }
      );
    }
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
  var grid = document.getElementsByClassName('masonry-layout-container')[0],
      rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')),
      rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

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
