import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { ChartData } from '../chart-data';
import { ImageUrl } from '../image-url';
//import { MapFunction } from '@observablehq/plot';

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})

export class DashboardItemComponent implements OnInit, AfterViewInit, OnChanges{
  @ViewChild('chart') public chartContainer!: ElementRef;
  @Input() public chartData!: ChartData;
  //@Input() public bigChartData!: ChartData;


  public imageList: ImageUrl = {
    "user": "/assets/images/icons/user.svg",
    "service": "/assets/images/icons/service.svg",
    "product": "/assets/images/icons/product.svg",
    "model": "/assets/images/icons/model.svg",
    "dataset": "/assets/images/icons/dataset.svg",
    "volumeTot": "/assets/images/icons/volume_tot.svg"
  };
  public europaTempImage: string = "";

  private auxElement: any;
  private d3Container: any;
  private d3TitleContainer: any;

  public title!: string;
  public image!: string;
  public value!: string;

  public svg: Array<any> = [];
  private numberOfCharts: number = 0;
  private chartIsCreated: boolean = false;
  private margin: any = { top: 40, bottom: 40, left: 64, right: 64};
  private innerWidth: number = 0;
  private legendTopMargin: number = 100;
  private legendHeight: number = 0;
  private legendBoxWidth: number = 20;
  private legendGap: number = 10;
  private singleChartInnerHeight: number = 200;
  private singleOffsetHeight: number = 0;
  private donutOuterRadius: number = this.singleChartInnerHeight * 0.75;
  private donutInnerRadius: number = this.donutOuterRadius * 0.5;
  private donutMultiThickness: number = this.donutInnerRadius * 0.3;
  private chartElementCornerRadius: number = 5;
  private chartElementGrow: number = 10;
  private titleMargin: number = 0;
  private stateBarHeight: number = 30;
  private minTickWidth = 40;

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
      setTimeout(() => {
        this.redrawCharts();
      }, 50);
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
      setTimeout(() => {
        this.redrawCharts();
      }, 10);
      //this.redrawCharts();
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
      .style('text-align', 'left')
      .style('padding', '.5rem')
      .style('background', '#FFFB')
      .style('color', '#000')
      .style('border', 'none')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('font-size', '0.75rem')

    this.tooltipDiv = this.d3Container.children[0];

    // get number of arrays and create svg(s)
    if (this.chartData.charts != null) {
      this.numberOfCharts = this.chartData.charts.length;
      for (var i = 0; i < this.numberOfCharts; i++) {
        this.svg.push(d3.select(this.d3Container).append("svg"));
      }

      // set title and header
      this.title = this.chartData.title;
      this.image = '';
      if (this.chartData.image != undefined) {
        this.image = this.imageList[this.chartData.image];
      }
      if (this.chartData.value === undefined) {
        this.value = "";
      } else {
        // to check for values > 1000000.....
        this.value = "" +
          (this.chartData.value > 999 && this.chartData.value < 999999 ? "~"+(this.chartData.value/1000).toFixed(1) + "K" :
          (this.chartData.value > 999999 && this.chartData.value < 999999999) ? "~"+(this.chartData.value/1000000).toFixed(1) + "M" :
          (this.chartData.value > 999999999) ? "~"+(this.chartData.value/1000000000).toFixed(1) + "G" :
          this.chartData.value);
      }

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
        let dataLength = this.chartData.charts[i].data.length!;
        if (this.chartData.charts[i].class == "barYStackedChart") {
          dataLength = Object.keys(this.chartData.charts[i].data[0]).filter((key:any) => key !== "date").length;
        } else if (this.chartData.charts[i].class == "lineChart") {
          dataLength = Array.from(new Set(this.chartData.charts[i].data.map((d:any) => d.userType))).length;
        } else if (this.chartData.charts[i].class == "doubleDonutSliceChart") {
          this.singleChartInnerHeight = 485;
          this.donutOuterRadius = this.singleChartInnerHeight * 0.4;
          this.donutInnerRadius = this.donutOuterRadius * 0.5;
          this.donutMultiThickness = this.donutInnerRadius * 0.25;
        } else if (this.chartData.charts[i].class == "stateBarXChart") {
          this.singleChartInnerHeight = dataLength * this.stateBarHeight;
          this.legendTopMargin = 20;
        } else if (this.chartData.charts[i].class == "mapChart") {
          this.singleChartInnerHeight = 0;
          this.legendTopMargin = 0;
          this.europaTempImage = "/assets/images/temp/Europa.svg"
        }
        this.legendHeight = this.chartData.charts[i].showLegend ? dataLength * (this.legendBoxWidth + this.legendGap) : 0;
        this.singleOffsetHeight = this.singleChartInnerHeight + this.legendHeight + this.legendTopMargin + this.margin.top + this.margin.bottom;

        if (this.chartData.charts[i].showTitle) {
          this.titleMargin = 60;
          this.singleOffsetHeight = this.singleOffsetHeight + this.titleMargin;
        }

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
          // Make a copy of the color if it is just one.
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
        if (this.chartData.charts[i].class == "barYStackedChart") {
          colors = d3.scaleLinear().domain([0, Object.keys(this.chartData.charts[i].data[0]).filter((key:any) => key !== "date").length -1]).range(tempColors);
        } else if (this.chartData.charts[i].class == "lineChart") {
          colors = d3.scaleLinear().domain([0, Array.from(new Set(this.chartData.charts[i].data.map((d:any) => d.userType))).length -1]).range(tempColors);
        } else {
          colors = d3.scaleLinear().domain([0, this.chartData.charts[i].data.length-1]).range(tempColors);
        }

        // Set title if showTitle is true
        if (this.chartData.charts[i].showTitle) {
          this.svg[i].append('g')
          .attr('class', 'chart-title')
          .attr('transform', `translate(${this.margin.left / 2}, ${this.margin.top})`)
            .append('text')
              .attr('x', 0)
              .attr('y', 0)
              .style('fill', this.despTextColor)
              .style('font-size', '1.25rem')
              .text(this.chartData.charts[i].title);
        }

        //console.log("POST this.singleOffsetHeight: ", this.singleOffsetHeight);

        // Different types of charts
        if (this.chartData.charts[i].class == "barXChart") {
          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)

          // Add X axis
          var xAxis_barXChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([0, this.innerWidth]);

          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_barXChart).ticks(5).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)") //rotate(-45)")
            //  .style("text-anchor", "end");

          // Y axis
          var yAxis_barXChart:any = d3.scaleBand()
            .domain(this.chartData.charts[i].data.map((d:any) => d.key))
            .rangeRound([0, this.singleChartInnerHeight])
            .padding(.4);
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
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
            .attr("y", (d:any) => yAxis_barXChart(d.key))
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
                //.attr('height', yAxis_barXChart.bandwidth() + this.chartElementGrow)
                //.attr('y', (d:any) => (yAxis_barXChart(d.key) - this.chartElementGrow/2))
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

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
                //.attr('height', yAxis_barXChart.bandwidth())
                //.attr('y', (d:any) => (yAxis_barXChart(d.key)))
                .attr('fill', colors(d.index));
                //.attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })

          // Legend
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(this.chartData.charts[i].data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(this.chartData.charts[i].data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.key)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "barYChart") {

          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)

          // Add X axis
          var xAxis_barYChart:any = d3.scaleBand()
            .domain(this.chartData.charts[i].data.map((d:any) => d.key))
            .rangeRound([0, this.innerWidth])
            .padding(.5);
          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_barYChart).ticks(5).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)rotate(-45)")
            .style("text-anchor", "end");

          // Y axis
          var yAxis_barYChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([this.singleChartInnerHeight, 0])
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barYChart).tickSize(0).tickSizeOuter(0))
            .selectAll('path')
              .remove();
          let axisGrid = this.svg[i].append('g')
            .attr('class', 'axis axis-y axis-grid')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
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
            .attr('x', (d:any) => xAxis_barYChart(d.key))
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
                //.attr('width', xAxis_barYChart.bandwidth() + this.chartElementGrow)
                //.attr('x', (d:any) => (xAxis_barYChart(d.key) - this.chartElementGrow/2))
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

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
                //.attr('width', xAxis_barYChart.bandwidth())
                //.attr('x', (d:any) => (xAxis_barYChart(d.key)))
                .attr('fill', colors(d.index));
                //.attr('opacity', '1');

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
                  xAxis_barYChart(d.key)!, yAxis_barYChart(d.value),
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
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(this.chartData.charts[i].data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(this.chartData.charts[i].data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.key)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "barYStackedChart") {

          let data:any = this.chartData.charts[i].data;
          //console.log("data: ", data);

          let datasetGroups:any = Object.keys(data[0]).filter((key:any) => key !== "date");
          //console.log("datasetGroups: ", datasetGroups);

          //let stack:any = d3.stack().keys(datasetGroups)(data);
          let stackGen:any = d3.stack()
            .keys(datasetGroups)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)

          let stackSeries:any = stackGen(data);
          //console.log("stackSeries: ", stackSeries);

          // Add X axis
          var xAxis_barYStackedChart:any = d3.scaleBand()
            .domain(data.map((d:any) => d.date))
            .rangeRound([0, this.innerWidth])
            .padding(.25);
          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_barYStackedChart)
              .tickFormat((t:any, i:any) => {
                let skip = Math.round(this.minTickWidth * data.length / this.innerWidth);
                skip = Math.max(1, skip);
                return (i % skip === 0) ? t : null;
              })
              //.tickValues(xAxis_lineChart.domain().filter((d:any, i:any) => (i%2)))
              .tickSizeOuter(0)
              .tickSize(0)
            )
            .selectAll("text")
            .attr("transform", "translate(0,10)rotate(-45)")
            .style("text-anchor", "end");

          let yMax:any = d3.max(stackSeries, (d:any) => {
            return d3.max(d, (t:any) => {
              return t[1];
            })
          });
          //console.log("yMax: ",yMax);

          var yAxis_barYStackedChart:any = d3.scaleLinear()
            .domain([0, yMax])
            .range([this.singleChartInnerHeight,0]);
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barYStackedChart).tickSize(0).tickSizeOuter(0));
            //.selectAll('path')
            //  .remove();

          /* var color = d3.scaleOrdinal()
            .domain(datasetGroups)
            .range(['#69f','#c4d','#b0b']) */

          let axisGrid = this.svg[i].append('g')
            .attr('class', 'axis axis-y axis-grid')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barYStackedChart).tickSize(-this.innerWidth).tickSizeOuter(0));

          axisGrid.selectAll('path').remove()
          axisGrid.selectAll("line").style('stroke', this.despGridColor)

          //Bars
          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)

          let rects = barChart.append("g")
            .selectAll("g")
            .data(stackSeries)
            .join("g")
              .attr("fill", (d:any, i:any) => colors(i))
            .selectAll("rect")
            .data((d:any) => d)
            .join("rect")
              .attr("x", (d:any) => xAxis_barYStackedChart(d.data.date))
              .attr("y", (d:any) => yAxis_barYStackedChart(d[1]))
              .attr("width", xAxis_barYStackedChart.bandwidth())
              .attr("height", (d:any) => yAxis_barYStackedChart(d[0]) - yAxis_barYStackedChart(d[1]));
//              .attr('rx', this.chartElementCornerRadius)
//              .attr('ry', this.chartElementCornerRadius);

          rects
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                //.attr('width', xAxis_barYStackedChart.bandwidth() + this.chartElementGrow)
                //.attr('x', (d:any) => (xAxis_barYStackedChart(d.key) - this.chartElementGrow/2))
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

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
                //.attr('width', xAxis_barYStackedChart.bandwidth())
                //.attr('x', (d:any) => (xAxis_barYStackedChart(d.key)))
                .attr('fill', colors(d.index));
                //.attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })


          // Legend
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(datasetGroups)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(datasetGroups)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "donutChart") {
          const tempData = this.chartData.charts[i];
          //console.log("tempData:",tempData);
          const totalValueSum: number = tempData.data.reduce((sum:number, obj:any) => {
            return (sum + obj.value);
          },0);
          //console.log("totalValueSum:",totalValueSum);

          // Create an arc generator
          var donutChart:any = d3.arc()
            .innerRadius(this.donutInnerRadius)
            .outerRadius(this.donutOuterRadius)
            .padAngle(.02)
            .padRadius(100)
            .cornerRadius(this.chartElementCornerRadius);

          // convert percentage data to angular
          let dataForDonut:any[] = this.convertDataForPie(tempData.data);
          //console.log("dataForDonut:",dataForDonut);

          let arcHover:any = d3.arc()
            .innerRadius(this.donutInnerRadius)// - this.chartElementGrow)
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
            .attr('fill', (d:any, k:any) => colors(k));
          arcs
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('d', arcHover)
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

              if (tempData.showPercentage) {
                this.tooltip.html(d.value + '<br>' + d.percentage + "%");
              } else {
                this.tooltip.html(d.value);
              }
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
                .attr('fill', (d:any, i:any) => colors(d.index));
                //.attr('opacity', '1');

              this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })

          // Total
          if (tempData.hasOwnProperty("showTotal") && tempData.showTotal) {
            this.svg[i].append("text")
              .text(totalValueSum)
              .attr("x", this.d3Container.offsetWidth / 2)
              .attr("y", this.singleOffsetHeight / 2 - 2)
              .style("fill", this.despTextColor)
              .style('font-size', '2.0rem')
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central");
          }

          // Legend

          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left/2}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(tempData.data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left/2 + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(tempData.data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.key)
                  .attr("text-anchor", "left")
          }
        } else if (this.chartData.charts[i].class == "multiDonutSliceChart") {
          const tempData = this.chartData.charts[i];
          console.log("tempData:",tempData.data);
          //const totalValueSum: number = tempData.data.reduce((sum:number, obj:any) => {
          //  return (sum + obj.value);
          //},0);
          //console.log("totalValueSum:",totalValueSum);

          let donutChart: Array<any> = [];
          // Create an arc generator
          for (let k = 0; k < tempData.data.length; k++) {
            let tempRadius = this.donutInnerRadius + (this.donutMultiThickness + 5)*k;
            // Empty ring
            let donutRing = d3.arc()
              .innerRadius(tempRadius + 5)
              .outerRadius(tempRadius + this.donutMultiThickness - 5)
              .padAngle(.02)
              .padRadius(100)
              .cornerRadius(this.chartElementCornerRadius)
            let arcRing = this.svg[i].append('g')
              .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${this.singleOffsetHeight / 2})`)
              .selectAll('path')
              .data([{
                startAngle: 0,
                endAngle: Math.PI*2,
                index: 0
              }])
              .join('path')
              .attr('d', donutRing)
              .attr('fill', '#666');

            // Percentage ring
            donutChart.push(d3.arc()
              .innerRadius(tempRadius)
              .outerRadius(tempRadius + this.donutMultiThickness)
              .padAngle(.02)
              .padRadius(100)
              .cornerRadius(this.chartElementCornerRadius)
            )
            let tempItem: any = tempData.data[k];
            tempItem.percentage = tempData.data[k].value;
            let dataForDonut = this.convertDataForPie([tempItem]);
            console.log("convertedData:",dataForDonut);

            let arc = this.svg[i].append('g')
              .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${this.singleOffsetHeight / 2})`)
              .selectAll('path')
              .data(dataForDonut)
              .join('path');
            arc
              .attr('d', donutChart[donutChart.length-1])
              .attr('fill', colors(k));
          }


          // convert percentage data to angular
          //console.log("dataForDonut:",dataForDonut);
/*
          let arcHover:any = d3.arc()
            .innerRadius(this.donutInnerRadius)// - this.chartElementGrow)
            .outerRadius(this.donutOuterRadius + this.chartElementGrow)
            .padAngle(.02)
            .padRadius(100)
            .cornerRadius(this.chartElementCornerRadius);
 */
          // Create a path element and set its d attribute
          /* let arcs = this.svg[i].append('g')
            .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${this.singleOffsetHeight / 2})`)
            .selectAll('path')
            .data(dataForDonut)
            .join('path');
          arcs
            .attr('d', donutChart)
            .attr('fill', (d:any, k:any) => colors(k));
          arcs
            .on('mouseenter', (event:any, d:any) => {
              //console.log("event: ", event);
              //console.log("data: ", d);
              d3.select(event.target)
                .transition()
                .duration(250)
                .attr('d', arcHover)
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

              if (tempData.showPercentage) {
                this.tooltip.html(d.value + '<br>' + d.percentage + "%");
              } else {
                this.tooltip.html(d.value);
              }
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
                .attr('fill', (d:any, i:any) => colors(d.index));
                //.attr('opacity', '1');

              this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            }) */

          // InnerValue
          if (tempData.hasOwnProperty("showTotal") && tempData.showTotal) {
            this.svg[i].append("text")
    //          .text(dataForDonut)
              .attr("x", this.d3Container.offsetWidth / 2)
              .attr("y", this.singleOffsetHeight / 2 - 2)
              .style("fill", this.despTextColor)
              .style('font-size', '2.0rem')
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central");
          }

          // Legend

          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left/2}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(tempData.data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left/2 + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(tempData.data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.userType)
                  .attr("text-anchor", "left")
          }
        } else if (this.chartData.charts[i].class == "doubleDonutSliceChart") {
          const tempData = this.chartData.charts[i];
          //console.log("tempData:",tempData.data);
          //console.log("totalValueSum:",totalValueSum);

          let donutChart: Array<any> = [];
          // Create an arc generator
          for (let k = 0; k < tempData.data.length; k++) {
            //let tempRadius = this.donutInnerRadius + (this.donutMultiThickness + 5)*k;
            // Empty ring
            let donutRing = d3.arc()
              .innerRadius(this.donutInnerRadius + 5)
              .outerRadius(this.donutInnerRadius + this.donutMultiThickness - 5)
              .padAngle(.02)
              .padRadius(100)
              .cornerRadius(this.chartElementCornerRadius)
            let arcRing = this.svg[i].append('g')
              .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${(this.singleOffsetHeight / 4) * (1 + k * 2)})`)
              .selectAll('path')
              .data([{
                startAngle: 0,
                endAngle: Math.PI*2,
                index: 0
              }])
              .join('path')
              .attr('d', donutRing)
              .attr('fill', '#666');

            // Percentage ring
            donutChart.push(d3.arc()
              .innerRadius(this.donutInnerRadius)
              .outerRadius(this.donutInnerRadius + this.donutMultiThickness)
              .padAngle(.02)
              .padRadius(100)
              .cornerRadius(this.chartElementCornerRadius)
            )
            let tempItem: any = tempData.data[k];
            tempItem.percentage = tempData.data[k].value;
            let dataForDonut = this.convertDataForPie([tempItem]);
            //console.log("convertedData:",dataForDonut);

            let arc = this.svg[i].append('g')
              .attr('transform', `translate(${this.d3Container.offsetWidth / 2}, ${(this.singleOffsetHeight / 4) * (1 + k * 2)})`)
              .selectAll('path')
              .data(dataForDonut)
              .join('path');
            arc
              .attr('d', donutChart[donutChart.length-1])
              .attr('fill', colors(k));

            // InnerValue
            if (tempData.hasOwnProperty("showTotal") && tempData.showTotal) {
              this.svg[i].append("text")
                .text(tempItem.percentage.toFixed(1) + "%")
                .attr("x", this.d3Container.offsetWidth / 2)
                .attr("y", (this.singleOffsetHeight / 4) * (1 + k * 2))
                .style("fill", tempItem.percentage >= 0 ? "#afa" : "#faa")
                .style('font-size', '3.0rem')
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central");
            }
          }

          // Legend

          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left/2}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(tempData.data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left/2 + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(tempData.data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.userType)
                  .attr("text-anchor", "left")
          }
        } else if (this.chartData.charts[i].class == "areaChart") {

          // Create area chart
          let data = this.chartData.charts[i].data;
          var xAxis_lineChart:any = d3.scaleBand()
            .domain(this.chartData.charts[i].data.map((d:any) => d.key))
            .rangeRound([0, this.innerWidth])
          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_lineChart)
              .tickFormat((t:any, i:any) => {
                let skip = Math.round(this.minTickWidth * data.length / this.innerWidth);
                skip = Math.max(1, skip);
                return (i % skip === 0) ? t : null;
              })
              //.tickValues(xAxis_lineChart.domain().filter((d:any, i:any) => (i%2)))
              .tickSizeOuter(0)
              .tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)rotate(-45)")
            .style("text-anchor", "end");


          // Y axis
          var yAxis_lineChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([this.singleChartInnerHeight, 0])
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_lineChart).tickSize(0).tickSizeOuter(0))
            .selectAll('path')
              .remove();
          let axisGrid = this.svg[i].append('g')
            .attr('class', 'axis axis-y axis-grid')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_lineChart).tickSize(-this.innerWidth).tickSizeOuter(0));

          axisGrid.selectAll('path').remove()
          axisGrid.selectAll("line").style('stroke', this.despGridColor)

          //this.svg[i].selectAll('path')
          //  .attr('stroke', this.despGrey)

          // Area

          let areaGen = d3.area()
            .x((d:any) => xAxis_lineChart(d.key))
            .y0(yAxis_lineChart(0))
            .y1((d:any) => yAxis_lineChart(d.value));

          this.svg[i].append('path')
            .attr('class', 'area')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .datum(this.chartData.charts[i].data)
            .attr('fill', (d:any, k:any) => colors(k))
            //.attr('stroke', '#cde')
            //.attr('stroke-width', 1.5)
            .attr('d', areaGen);

          // Legend
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(this.chartData.charts[i].data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(this.chartData.charts[i].data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.key)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "lineChart") {

          let data:any = this.chartData.charts[i].data;
          //console.log("this.chartData.charts[i].data:",data);

          let usersTypeGroups:Array<any> = Array.from(new Set(data.map((d:any) => d.userType)));
          //console.log("datasetGroups: ", usersTypeGroups);
          let xDomain:Array<any> = Array.from(new Set(data.map((d:any) => d.date)));
          //console.log("xDomain: ", xDomain);
          // Create line chart
          var xAxis_lineChart:any = d3.scaleBand()
            .domain(xDomain)
            .rangeRound([0, this.innerWidth])
          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_lineChart)
              .tickFormat((t:any, i:any) => {
                let skip = Math.round(this.minTickWidth * data.length / this.innerWidth);
                skip = Math.max(1, skip);
                return (i % skip === 0) ? t : null;
              })
              //.tickValues(xAxis_lineChart.domain().filter((d:any, i:any) => (i%2)))
              .tickSizeOuter(0)
              .tickSize(0)
            )
            .selectAll("text")
            .attr("transform", "translate(0,10)rotate(-45)")
            .style("text-anchor", "end");

          // Y axis
          var yAxis_lineChart:any = d3.scaleLinear()
            .domain([0, d3.max(this.chartData.charts[i].data, (d:any) => d.value)])
            .range([this.singleChartInnerHeight, 0])
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_lineChart).tickSize(0).tickSizeOuter(0))
            .selectAll('path')
              .remove();
          let axisGrid = this.svg[i].append('g')
            .attr('class', 'axis axis-y axis-grid')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_lineChart).tickSize(-this.innerWidth).tickSizeOuter(0));

          axisGrid.selectAll('path').remove()
          axisGrid.selectAll("line").style('stroke', this.despGridColor)


          var groupedData = d3.group(data, (d:any) => d.userType);
          //console.log("groupedData:",groupedData);

          this.svg[i].append("g")
            .attr('class', 'lines')
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)
            .selectAll("path")
            .data(groupedData)
            .join("path")
              .attr('fill', 'none')
              .attr('stroke-width', 1.5)
              .attr('stroke', (d:any, i:any) => colors(i))
              .attr("d", (d:any) => {
                  return d3.line()
                    .x((d:any) => xAxis_lineChart(d.date))
                    .y((d:any) => yAxis_lineChart(d.value))
                    (d[1])
                });

          // Legend
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(usersTypeGroups)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i));

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
              .data(usersTypeGroups)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "stateBarXChart") {

          let data: Array<any> = [];
          let startX: number = 200;
          this.chartData.charts[i].data.forEach((arrItem:any, idx:number) => data.push({state: arrItem.state, value: arrItem.value, trend: arrItem.trend, index: idx}));

          // Create bar chart
          let barChart = this.svg[i].append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.titleMargin})`)

          // add Y axis
          var yAxis_barXChart:any = d3.scaleBand()
            .domain(data.map((d:any) => d.state))
            .rangeRound([0, (this.singleChartInnerHeight)])
            .paddingInner(0.5)
            .paddingOuter(0.25);
          this.svg[i].append("g")
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left + startX}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barXChart).tickSizeOuter(0).tickSize(startX))
            .selectAll('.tick text, line')
              .remove();

          // Add X axis
          var xAxis_barXChart:any = d3.scaleLinear()
            .domain([0, d3.max(data, (d:any) => d.value)])
            .range([0, this.innerWidth - startX]);

          this.svg[i].append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", `translate(${this.margin.left + startX}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
            .call(d3.axisBottom(xAxis_barXChart).ticks(5).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(0,10)");

          // Vertical gridlines
          d3.selectAll('g.axis-x g.tick')
            .append('line')
            .attr('class', 'gridline')
            .attr("x1", 0)
            .attr("y1", -this.singleChartInnerHeight)
            .attr("x2", 0)
            .attr("y2", 0)
            .attr("stroke", this.despGrey)
            //.attr("stroke-dasharray","4");

          // Horizontal gridlines
          d3.selectAll('g.axis-y g.tick')
            .append('line')
            .attr('class', 'gridline')
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.innerWidth)
            .attr("y2", 0)
            .attr('transform', `translate(${-startX}, ${-yAxis_barXChart.bandwidth()})`)
            .attr("stroke", this.despGrey)
            //.attr("stroke-dasharray","4");

          // States names left-anchored
          this.svg[i].append("g")
            .attr('class', 'axis axis-y-states')
            .style('text-anchor', 'start')
            .attr('transform', `translate(${this.margin.left + 10}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barXChart).tickSizeOuter(0).tickSize(0))
            .select(".domain")
              .remove()
          d3.selectAll(".axis-y-states")
            .style("text-transform","uppercase");

          // trends:
          let trends = this.svg[i].append("g")
            .attr('class', 'axis axis-y-trends')
            .style('text-anchor', 'end')
            .attr('transform', `translate(${this.margin.left + startX}, ${this.margin.top + this.titleMargin})`)
            .call(d3.axisLeft(yAxis_barXChart).tickSizeOuter(0).tickSize(0));

          trends.select(".domain")
            .remove()
          trends.selectAll('text')
            .remove()
          trends.selectAll('.tick')
            .append("text")
              .data(data)
              .attr("x", -10)
              .attr("y", 0)
              .style("fill", (d:any) => d.trend > 0 ? "#afa" : "#faa")
              .text((d:any) => d.trend.toFixed(1) + "%")
              .attr("text-anchor", "left")

          this.svg[i].selectAll('path')
            .attr('stroke', this.despGrey)

          //Bars
          let rects = barChart.selectAll("bar")
            .data(data)
            .join("rect");

          rects
            .attr("x", startX )
            .attr("y", (d:any) => yAxis_barXChart(d.state))
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
                //.attr('height', yAxis_barXChart.bandwidth() + this.chartElementGrow)
                //.attr('y', (d:any) => (yAxis_barXChart(d.key) - this.chartElementGrow/2))
                .attr('fill', d3.hsl(colors(d.index)).brighter(0.7).toString());
                //.attr('opacity', '.75');

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
                //.attr('height', yAxis_barXChart.bandwidth())
                //.attr('y', (d:any) => (yAxis_barXChart(d.key)))
                .attr('fill', colors(d.index));
                //.attr('opacity', '1');

                this.tooltip.transition()
                .duration(50)
                .style("opacity", '0');
            })

          // Legend
          if (this.chartData.charts[i].showLegend) {
            this.svg[i].append('g')
              .attr('class', 'legend-dot')
              .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.singleChartInnerHeight + this.titleMargin})`)
              .selectAll("mydots")
              .data(data)
              .join("rect")
                .attr("x", 0)
                .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                .attr("rx", this.chartElementCornerRadius)
                .attr("ry", this.chartElementCornerRadius)
                .attr("width", this.legendBoxWidth)
                .attr("height", this.legendBoxWidth)
                .style("fill", (d:any, i:any) => colors(i))

            this.svg[i].append('g')
              .attr('class', 'legend-label')
              .attr('transform', `translate(${this.margin.left + this.legendBoxWidth + this.legendGap}, ${this.margin.top + this.singleChartInnerHeight + this.legendBoxWidth -2 + this.titleMargin})`)
              .selectAll("legend-label")
                .data(data)
                .join("text")
                  .attr("x", 0)
                  .attr("y", (d:any, i:any) => ( this.legendTopMargin + i*(this.legendBoxWidth + this.legendGap)))
                  .style("fill", this.despTextColor)
                  .text((d:any) => d.state)
                  .attr("text-anchor", "left")
          }
          // end..
        } else if (this.chartData.charts[i].class == "mapChart") {

        }
      }
    }
  }

  toType(obj:any) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)![1].toLowerCase();
  }

  convertDataForPie(data:Array<any>): Array<any> {
    /*
      convert an Array of data like the following:
        "data": [
          {"index": "Federated", "value": 128, "percentage": 16.3},
          {"index": "Registered", "value": 915, "percentage": 83.7}
        ]

      to a d3 pie array like this:
        "data": [
          { startAngle: 0.000000000000000, endAngle: 1.1967972013675403, value: 128, percentage: 16.3 },
          { startAngle: 1.1967972013675403, endAngle: 6.283185307179586, value: 915, percentage: 83.7 }
        ]
    */

    let dataToRadians = data.map((d:any) => ((d.percentage * Math.PI * 2) / 100));
    //console.log("dataToRadians:",dataToRadians);


    let pieData:any[] = [];
    let startAngle:number = 0;
    for (var i = 0; i < dataToRadians.length; i++) {
      if (i == 0) {
        pieData.push({startAngle: 0, endAngle: dataToRadians[i], value: data[i].value.toFixed(1), percentage: data[i].percentage.toFixed(1), index: i});
      } else {
        pieData.push({startAngle: startAngle, endAngle: (startAngle + dataToRadians[i]), value: data[i].value.toFixed(1), percentage: data[i].percentage.toFixed(1), index: i});
      }
      startAngle += dataToRadians[i];
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
