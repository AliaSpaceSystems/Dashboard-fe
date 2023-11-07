import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
//import * as Plot from '@observablehq/plot';

declare var $: any;

export interface ChartData {
  title: string;
  data: Array<any>;
}

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
  //encapsulation: ViewEncapsulation.None
})

export class DashboardItemComponent implements OnInit, AfterViewInit, OnChanges{
  @ViewChild('chart') public chartContainer!: ElementRef;
  @Input() public chartData!: ChartData;

  public d3Container: any;
  public d3TitleContainer: any;
  public svg: any;
  public title!: string;
  private margin: any = { top: 40, bottom: 50, left: 60, right: 60};
  private chart: any;
  private width!: number;
  private height!: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;


  constructor() {
    window.addEventListener(('resize'), () => {
      this.redrawChart();
    });
  }

  ngOnInit(): void {
  }

   ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    this.d3Container = this.chartContainer.nativeElement;
    this.d3TitleContainer = this.d3Container.querySelector('#dashboard-title')!;
    this.svg = d3.select(this.d3Container).append("svg");

    setTimeout(() => {
      if (this.chartData) {
        this.redrawChart();
      }
    }, 10);
  }

  redrawChart() {
    // Clear svg
    this.svg.selectAll("*").remove();

    // set title
    this.title = this.chartData.title;

    this.width = this.d3Container.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.d3Container.offsetHeight - this.margin.top - this.margin.bottom - this.d3TitleContainer.clientHeight;

    this.svg
      .attr('width', this.d3Container.offsetWidth)
      .attr('height', this.d3Container.offsetHeight);

    // chart plot area
    this.chart = this.svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    let xDomain = this.chartData.data.map(d => d.index);
    let yDomain = [0, d3.max(this.chartData.data, (d:any) => d.value)];

    // create scales
    this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // bar colors
    this.colors = d3.scaleLinear().domain([0, this.chartData.data.length]).range(<any[]>['red', 'blue']);

    // x & y axis
    this.xAxis = this.svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale));
    this.yAxis = this.svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));

    this.updateChart();
  }

  updateChart() {
    // update scales & axis
    this.xScale.domain(this.chartData.data.map(d => d.index));
    this.yScale.domain([0, d3.max(this.chartData.data, (d:any) => d.value)]);
    this.colors.domain([0, this.chartData.data.length]);
    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    let update = this.chart.selectAll('.bar')
      .data(this.chartData.data);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', (d:any) => this.xScale(d.index))
      .attr('y', (d:any) => this.yScale(d.value))
      .attr('width', (d:any) => this.xScale.bandwidth())
      .attr('height', (d:any) => this.height - this.yScale(d.value))
      .style('fill', (d:any, i:any) => this.colors(i));

    // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d:any) => this.xScale(d.index))
      .attr('y', (d:any) => this.yScale(0))
      .attr('width', this.xScale.bandwidth())
      .attr('height', 0)
      .style('fill', (d:any, i:any) => this.colors(i))
      .transition()
      .delay((d:any, i:any) => i * 10)
      .attr('y', (d:any) => this.yScale(d.value))
      .attr('height', (d:any) => this.height - this.yScale(d.value));
  }
}


  /*
    Versione con Plot..

  createChart() {

    console.log(this.chartData.data);
    //const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
    const plot = Plot.plot({
      marginBottom: 120,
      marginLeft: 60,
      marginRight: 60,
      x: {
        tickRotate: -30,
      },
      y: {
        label: "ciao",
        grid: 5
      },
      marks: [
        Plot.frame({fill: "#000", stroke: "#a00", fillOpacity: 1, strokeWidth: 5}),
        //Plot.text(["Hello, world!"], {frameAnchor: "middle"})
        Plot.barY(this.chartData.data, {fill: "#0F0", x: "index", y: "value"})
      ]
    })
    this.d3Container = this.chartContainer.nativeElement;
    //this.d3Container = $('#dashboard-item-main-container');
    //this.d3Container = document.querySelector('#dashboard-item-main-container')!;
    //this.d3Container.html(plot);
    this.d3Container.append(plot);
  }
*/
