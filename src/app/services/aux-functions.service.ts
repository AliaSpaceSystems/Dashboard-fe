import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuxFunctionsService {

  constructor(
  ) { }

  resizeAllMasonryItems(){
    var allItems = document.getElementsByClassName('masonry-item-container');
    /*
     * Loop through the above list and execute the spanning function to
     * each list-item (i.e. each masonry item)
     */
    for(var i=0;i<allItems.length;i++){
      //this.resizeMasonryItem(allItems[i]);
      // Call it without function:
      var grid = document.getElementsByClassName('masonry-layout-container')[0];
      var rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
      var rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
      let tempItem:any = allItems[i];
      var rowSpan = Math.ceil((tempItem.querySelector('.masonry-item-content').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));
      tempItem.style.gridRowEnd = 'span '+rowSpan;
    }
  }

  resizeMasonryItem(item: any){
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

  getLongestArrayIndex(array: Array<Array<any>>):number {
    let ret: number = -1;
    let maxNum: number = 0;
    array.forEach((arr: any, i: number) => {
      if (arr.length > maxNum) {
        ret = i;
        maxNum = arr.length;
      }
    });
    return ret;
  }
}
