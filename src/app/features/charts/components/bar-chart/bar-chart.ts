import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import * as d3 from 'd3';

interface Data {
    technology: string;
    count: number;
}

@Component({
    selector: 'd3p-bar-chart',
    imports: [],
    templateUrl: './bar-chart.html',
    styleUrl: './bar-chart.scss'
})
export class BarChart implements AfterViewInit {
    chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');

    ngAfterViewInit(): void {
        this.createChart()
            .then(_ => console.log('Data loaded'));
    }

    private async createChart() {
        const element = this.chartContainer().nativeElement;

        const data = await this.loadData();

        data.sort((a, b) => b.count - a.count);

        const xScale = d3.scaleLinear()
            .domain([0, 1078])
            .range([0, 800]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.technology))
            .range([0, 800])
            .paddingInner(0.2);

        const svg = d3.select(element)
            .append("svg")
            .attr("viewBox", "0 0 1200 1600")
            .style("border", "1px solid black");

        svg
            .append("line")
            .attr("x1", 100)
            .attr("y1", 0)
            .attr("x2", 100)
            .attr("y2", 700)
            .attr("stroke", "black");

        const barAndLabel = svg
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(0, ${yScale(d.technology)})`);

        barAndLabel
            .append("rect")
            .attr("x", 100)
            .attr("y", 0)
            .attr("width", d => xScale(d.count))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => d.technology === "D3.js" ? "yellowgreen" : "skyblue");

        barAndLabel
            .append("text")
            .text(d => d.technology)
            .attr("x", 96)
            .attr("y", 12)
            .attr("text-anchor", "end")
            .style("font-family", "sans-serif")
            .style("font-size", "11px");

        barAndLabel
            .append("text")
            .text(d => d.count)
            .attr("x", d => 100 + xScale(d.count) + 4)
            .attr("y", 12)
            .style("font-family", "sans-serif")
            .style("font-size", "9px");
    }

    private async loadData() {
        return await d3.csv("/data.csv", d => {
            return {
                technology: d["technology"],
                count: +d['count']
            } as Data;
        });
    }
}
