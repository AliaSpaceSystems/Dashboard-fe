import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { ChartData } from '../chart-data';

//declare var $: any;
//let tooltip: any;

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
  //encapsulation: ViewEncapsulation.None
})

export class DashboardItemComponent implements OnInit, AfterViewInit, OnChanges{
  //@ViewChild('header') public headerContainer!: ElementRef;
  @ViewChild('chart') public chartContainer!: ElementRef;
  @Input() public chartData!: ChartData;

  private auxElement: any;
  //public d3Header: any;
  private d3Container: any;
  private d3TitleContainer: any;

  public title!: string;
  public image!: string;
  public value!: string;

  public svg: Array<any> = [];
  //public tooltipDiv: Array<any> = [];
  private numberOfCharts: number = 0;
  private chartIsCreated: boolean = false;
  private margin: any = { top: 40, bottom: 40, left: 60, right: 60};
  private innerWidth: number = 0;
  private legendTopMargin: number = 100;
  private legendHeight: number = 0;
  private legendBoxWidth: number = 20;
  private legendGap: number = 10;
  private singleChartInnerHeight: number = 200;
  private singleOffsetHeight: number = 0;
  private donutOuterRadius: number = this.singleChartInnerHeight * 0.75;
  private donutInnerRadius: number = this.donutOuterRadius * 0.5;
  private chartElementCornerRadius: number = 5;
  private chartElementGrow: number = 10;
  //private donutMarginLeft: number = 50;
  //private donutMarginTop: number = 75;

  private despTextColor!: string;
  private despViolet!: string;
  private despPurple!: string;
  private despGrey!: string;
  private despGreyBgColor!: string;
  private despBarBlue!: string;
  private despYellow!: string;
  private despGridColor!: string;

  private colorList: any[] = []

  private tooltip: any;
  private tooltipDiv: any;
  private tooltipOffsetXpos: number = -5;
  private tooltipOffsetYpos: number = -10;
  private tooltipOffsetWidth: number = 0;
  private tooltipOffsetHeight: number = 0;

  constructor() {
    window.addEventListener(('resize'), () => {
      this.redrawCharts();
    });
  }

  ngOnInit(): void {
    this.auxElement = document.getElementById('aux-element')!;
    this.despTextColor = getComputedStyle(this.auxElement).getPropertyValue("--desp-text-color");
    this.despViolet = getComputedStyle(this.auxElement).getPropertyValue("--desp-violet");
    this.despPurple = getComputedStyle(this.auxElement).getPropertyValue("--desp-purple");
    this.despGrey = getComputedStyle(this.auxElement).getPropertyValue("--desp-grey");
    this.despGreyBgColor = getComputedStyle(this.auxElement).getPropertyValue("--desp-grey-bg-color");
    this.despBarBlue = getComputedStyle(this.auxElement).getPropertyValue("--desp-bar-blue");
    this.despYellow = getComputedStyle(this.auxElement).getPropertyValue("--desp-yellow");
    this.despGridColor = '#BBB6';

    this.colorList = [
      {jsonColor: "despViolet", despColor: this.despViolet},
      {jsonColor: "despPurple", despColor: this.despPurple},
      {jsonColor: "despBlue", despColor: this.despBarBlue},
      {jsonColor: "despYellow", despColor: this.despYellow}
    ]
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.chartData) {
        this.createChart();
      }
    });
  }

  ngOnChanges() {
    if (this.chartData && this.chartIsCreated) {
      this.redrawCharts();
    }
  }

  createChart() {
    this.d3Container = this.chartContainer.nativeElement;
    this.tooltip = d3.select(this.d3Container)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', '0')
      .style('position', 'absolute')
      .style('z-index', '999')
      .style('text-align', 'center')
      .style('padding', '.5rem')
      .style('background', '#FFFB')
      .style('color', '#000')
      //.style('border', '2px solid #000')
      .style('border', 'none')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('font-size', '1rem')

    this.tooltipDiv = this.d3Container.children[0];




    // get number of arrays and create svg(s)
    if (this.chartData.charts != null) {
      this.numberOfCharts = this.chartData.charts.length;
      for (var i = 0; i < this.numberOfCharts; i++) {
        this.svg.push(d3.select(this.d3Container).append("svg"));
      }


      // set title and header
      this.title = this.chartData.title;
      this.image = "";
      // to check for values > 1000000.....
      this.value = "" + (this.chartData.value > 999 && this.chartData.value < 999999 ? "~"+(this.chartData.value/1000).toFixed(1) + "K" : this.chartData.value);

      setTimeout(() => {
        //console.log(this.chartData);
        this.redrawCharts();
      });
    }
  }

  redrawCharts() {
    this.innerWidth = this.d3Container.offsetWidth - this.margin.left - this.margin.right;
    if (this.chartData.charts != null) {
      // Iterate for number of requested charts
      for (var i = 0; i < this.numberOfCharts; i++) {
        // Clear svg
        this.svg[i].selectAll("*").remove();

        // Calculate section height
        this.legendHeight = this.chartData.charts[i].legend ? this.chartData.charts[i].data.length! * (this.legendBoxWidth + this.legendGap) : 0;
        this.singleOffsetHeight = this.singleChartInnerHeight + this.legendHeight + this.legendTopMargin + this.margin.top + this.margin.bottom;

        // Assign Dimensions
        this.svg[i]
          .attr('width', this.d3Container.offsetWidth)
          .attr('height', this.singleOffsetHeight);

        // Draw a line
        this.svg[i].append('g')
          .append('line')
          .attr('x1', 10)
          .attr('y1', 0)
          .attr('x2', this.d3Container.offsetWidth - 10)
          .attr('y2', 0)
          .attr('stroke', this.despGreyBgColor)
          .attr('stroke-width' , 5);

        // Set colors
        let tempColors: any[] = [];
        let colors: any;
        if (this.chartData.charts[i].colors.length == 1) {
          this.chartData.charts[i].colors.push(this.chartData.charts[i].colors[0]);
        }
        this.chartData.charts[i].colors.forEach((el:any) => {
          let checkColor: any;
          if (checkColor = this.colorList.filter((c:any) => c.jsonColor == el)[0]) {
            tempColors.push(this.colorList.filter((c:any) => c.jsonColor == el)[0].despColor);
          } else {
            tempColors.push(el);
          }
        });
        /* if (this.chartData.charts[i].createFade) {
          colors = d3.scaleLinear().domain([0, this.chartData.charts[i].data.length-1]).range(tempColors);
        } else { */
        colors = d3.scaleLinear().domain([0, this.chartData.charts[i].data.length-1]).range(tempColors);
        //}

        if (this.chartData.charts[i].showTitle) {
          this.svg[i].append('g')
          .attr('class', 'chart-title')
          .attr('transform', `translate(${this.margin.left}, ${this.margin.top * 2})`)
            .append('text')
              .attr('x', 0)
              .attr('y', 0)
              .style('fill', this.despTextColor)
              .style('font-size', '1.5rem')
              .text(this.chartData.charts[i].title)
        }

        if (this.chartData.charts[i].class == "barXChart") {
          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

          // Add X axis
          var xAxis_barXChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([0, this.innerWidth]);

          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight})`)
            .call(d3.axisBottom(xAxis_barXChart).ticks(5).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)") //rotate(-45)")
            //  .style("text-anchor", "end");

          // Y axis
          var yAxis_barXChart:any = d3.scaleBand()
            .domain(this.chartData.charts[i].data.map((d:any) => d.index))
            .rangeRound([0, this.singleChartInnerHeight])
            .padding(.4);
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(yAxis_barXChart).tickSizeOuter(0))
            .selectAll('.tick')
              .remove();

          this.svg[i].selectAll('path')
            .attr('stroke', this.despGrey)

          //Bars
          let rects = barChart.selectAll("bar")
            .data(this.chartData.charts[i].data)
            .join("rect");

          rects.attr("x", 0 )
            .attr("y", (d:any) => yAxis_barXChart(d.index))
            .attr("height", yAxis_barXChart.bandwidth())
            .attr('rx', this.chartElementCornerRadius)
            .attr('ry', this.chartElementCornerRadius)
            .transition()
              .duration(1000)
              .attr("width", (d:any) => xAxis_barXChart(d.value))
            .attr("fill", (d:any, i:any) => colors(i));

          rects
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('height', yAxis_barXChart.bandwidth() + this.chartElementGrow)
                .attr('y', (d:any) => (yAxis_barXChart(d.index) - this.chartElementGrow/2))
                .attr('opacity', '.75');

              this.tooltip.html(d.value);
              this.tooltipOffsetWidth = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("width"));
              this.tooltipOffsetHeight = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("height"));

              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");

              this.tooltip.transition()
                .duration(50)
                .style("opacity", '1');
            })
            .on('mousemove', (event:any, d:any) => {
              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");
            })
            .on('mouseout', (event:any, d:any) => {
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('height', yAxis_barXChart.bandwidth())
                .attr('y', (d:any) => (yAxis_barXChart(d.index)))
                .attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })

          // Legend
          this.svg[i].append('g')
            .attr('class', 'legend-dot')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight})`)
            .selectAll("mydots")
            .data(this.chartData.charts[i].data)
            .join("rect")
              .attr("x", 0)
              .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
              .attr("width", this.legendBoxWidth)
              .attr("height", this.legendBoxWidth)
              .style("fill", (d:any, i:any) => colors(i))

          this.svg[i].append('g')
            .attr('class', 'legend-label')
            .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2})`)
            .selectAll("legend-label")
              .data(this.chartData.charts[i].data)
              .join("text")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .style("fill", this.despTextColor)
                .text((d:any) => d.index)
                .attr("text-anchor", "left")
          // end..
        } else if (this.chartData.charts[i].class == "barYChart") {

          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

          // Add X axis
          var xAxis_barYChart:any = d3.scaleBand()
            .domain(this.chartData.charts[i].data.map((d:any) => d.index))
            .rangeRound([0, this.innerWidth])
            .padding(.5);
          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight})`)
            .call(d3.axisBottom(xAxis_barYChart).ticks(5).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)rotate(-30)")
            .style("text-anchor", "end");

          // Y axis
          var yAxis_barYChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([this.singleChartInnerHeight, 0])
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(yAxis_barYChart).tickSize(0).tickSizeOuter(0))
            .selectAll('path')
              .remove();
          let axisGrid = this.svg[i].append('g')
            .attr('class', 'axis axis-y axis-grid')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(yAxis_barYChart).tickSize(-this.innerWidth).tickSizeOuter(0));

          axisGrid.selectAll('path').remove()
          axisGrid.selectAll("line").style('stroke', this.despGridColor)

          //this.svg[i].selectAll('path')
          //  .attr('stroke', this.despGrey)

          //Bars
          let rects = barChart.selectAll("bar")
            .data(this.chartData.charts[i].data)
            .join("rect");

          rects
            .attr('x', (d:any) => xAxis_barYChart(d.index))
            .attr('width', xAxis_barYChart.bandwidth())
            .attr('y', yAxis_barYChart(0))
            .attr('rx', this.chartElementCornerRadius)
            .attr('ry', this.chartElementCornerRadius)
            .transition()
              .duration(1000)
              .attr('y', (d:any) => (d.value < 0 ? yAxis_barYChart(0) : yAxis_barYChart(d.value)))
              .attr('height', (d:any) => (d.value < 0 ? yAxis_barYChart(d.value) - yAxis_barYChart(0) : yAxis_barYChart(0) - yAxis_barYChart(d.value)))
            .attr("fill", (d:any, i:any) => colors(i));

          rects
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('width', xAxis_barYChart.bandwidth() + this.chartElementGrow)
                .attr('x', (d:any) => (xAxis_barYChart(d.index) - this.chartElementGrow/2))
                .attr('opacity', '.75');

              this.tooltip.html(d.value);
              this.tooltipOffsetWidth = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("width"));
              this.tooltipOffsetHeight = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("height"));

              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");

              this.tooltip.transition()
                .duration(50)
                .style("opacity", '1');
            })
            .on('mousemove', (event:any, d:any) => {
              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");
            })
            .on('mouseout', (event:any, d:any) => {
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('width', xAxis_barYChart.bandwidth())
                .attr('x', (d:any) => (xAxis_barYChart(d.index)))
                .attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })


          // RoundCorner boxes test:
          /* barChart.selectAll("bar")
            .data(this.chartData.charts[i].data)
            .join("path")
            //.style("stroke", "white")
            .style("fill", this.despBarBlue)
            .transition()
              .duration(1000)
              .attr('d', (d:any, i:any) => {
                return this.roundedRect(
                  xAxis_barYChart(d.index)!, yAxis_barYChart(d.value),
                  xAxis_barYChart.bandwidth(), yAxis_barYChart(0) - yAxis_barYChart(d.value),
                  xAxis_barYChart.bandwidth()/2, 1, 1, 0, 0);
              }) */

                /* this.chartData.charts[i].data.forEach((el:any, i:any) => {
            barChart.append('path')
              .style("stroke", "white")
              .style("fill", "red")
              .attr('d', this.roundedRect(0 + i*60, this.singleChartInnerHeight, 50, 50, 15, 0, 0, 15, 15))
          }) */


          // Legend
          if (this.chartData.charts[i].legend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight})`)
              .selectAll("mydots")
              .data(this.chartData.charts[i].data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2})`)
              .selectAll("legend-label")
                .data(this.chartData.charts[i].data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.index)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "donutChart") {
          // Create an arc generator
          var donutChart:any = d3.arc()
            .innerRadius(this.donutInnerRadius)
            .outerRadius(this.donutOuterRadius)
            .padAngle(.02)
            .padRadius(100)
            .cornerRadius(this.chartElementCornerRadius);

          // convert percentage data to angular
          let dataForDonut:any[] = this.convertDataForPie(this.chartData.charts[i].data);

          let arcHover:any = d3.arc()
            .innerRadius(this.donutInnerRadius - this.chartElementGrow)
            .outerRadius(this.donutOuterRadius + this.chartElementGrow)
            .padAngle(.02)
            .padRadius(100)
            .cornerRadius(this.chartElementCornerRadius);

          // Create a path element and set its d attribute
          let arcs = this.svg[i].append('g')
            .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${this.singleOffsetHeight / 2})`)
            .selectAll('path')
            .data(dataForDonut)
            .join('path');
          arcs
            .attr('d', donutChart)
            .attr('fill', (d:any, i:any) => colors(i));
          arcs
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('d', arcHover)
                .attr('opacity', '.75');

              this.tooltip.html(d.value);
              this.tooltipOffsetWidth = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("width"));
              this.tooltipOffsetHeight = parseInt(window.getComputedStyle(this.tooltipDiv).getPropertyValue("height"));

              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");

              this.tooltip.transition()
                .duration(50)
                .style("opacity", '1');
            })
            .on('mousemove', (event:any, d:any) => {
              this.tooltip
                .style("left", (event.layerX - this.tooltipOffsetWidth + this.tooltipOffsetXpos) + "px")
                .style("top", (event.layerY - this.tooltipOffsetHeight + this.tooltipOffsetYpos) + "px");
            })
            .on('mouseout', (event:any, d:any) => {
              d3.select(event.target).transition()
                .duration(250)
                .attr('d', donutChart)
                .attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })

          // Legend
          this.svg[i].append('g')
            .attr('class', 'legend-dot')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight})`)
            .selectAll("mydots")
            .data(this.chartData.charts[i].data)
            .join("rect")
              .attr("x", 0)
              .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
              .attr("width", this.legendBoxWidth)
              .attr("height", this.legendBoxWidth)
              .style("fill", (d:any, i:any) => colors(i))

          this.svg[i].append('g')
            .attr('class', 'legend-label')
            .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2})`)
            .selectAll("legend-label")
              .data(this.chartData.charts[i].data)
              .join("text")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .style("fill", this.despTextColor)
                .text((d:any) => d.index)
                .attr("text-anchor", "left")
        }
      }
    }
  }

  convertDataForPie(data:Array<any>): Array<any> {
    /*
      convert an Array of data like the following:
        "data": [
          {"index": "Federated", "value": 16},
          {"index": "Registered", "value": 84}
        ]

      to a d3 pie array like this:
        "data": [
          { startAngle: 0.000000000000000, endAngle: 1.1967972013675403, value: 16 },
          { startAngle: 1.1967972013675403, endAngle: 6.283185307179586, value: 84 }
        ]
    */
    let dataToRadians = data.map((d:any) => (d.value * 2*Math.PI / d3.max(data, (m:any) => m.value)));
    let pieData:any[] = [];
    for (var i = 0; i < dataToRadians.length; i++) {
      if (i == 0) pieData.push({startAngle: 0, endAngle: dataToRadians[0], value: data[0].value});
      else pieData.push({startAngle: dataToRadians[i-1], endAngle: dataToRadians[i], value: data[i].value})
    }
    return pieData;
  }

  roundedRect(x: number, y: number, w: number, h: number, r: number, tl: number, tr: number, bl: number, br: number) {
    let retval;
    retval = `M${x + r},${y}`;
    retval += `h${w - (2 * r)}`;
    if (tr) {
      retval += `a${r},${r} 0 0 1 ${r},${r}`;
    } else {
      retval += `h${r}`; retval += `v${r}`;
    }
    retval += `v${h - (2 * r)}`;
    if (br) {
      retval += `a${r},${r} 0 0 1 ${-r},${r}`;
    } else {
      retval += `v${r}`; retval += `h${-r}`;
    }
    retval += `h${(2 * r) - w}`;
    if (bl) {
      retval += `a${r},${r} 0 0 1 ${-r},${-r}`;
    } else {
      retval += `h${-r}`; retval += `v${-r}`;
    }
    retval += `v${((2 * r) - h)}`;
    if (tl) {
      retval += `a${r},${r} 0 0 1 ${r},${-r}`;
    } else {
      retval += `v${-r}`; retval += `h${r}`;
    }
    retval += 'z';
    return retval;
  }
}
