import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import * as d3 from 'd3';
import {DSVParsedArray} from 'd3';

interface Data {
    date: Date;
    max_temp_F: number;
    avg_temp_F: number;
    min_temp_F: number;
}

@Component({
    selector: 'd3p-first-graph',
    imports: [],
    templateUrl: './first-graph.html',
    styleUrl: './first-graph.scss'
})
export class FirstGraph implements AfterViewInit {
    chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');

    ngAfterViewInit(): void {
        this.createChart().then(_ => console.log('Data loaded'));
    }

    private async createChart() {
        const margin = {top: 40, right: 170, bottom: 25, left: 40};
        const width = 1000;
        const height = 500;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const element = this.chartContainer().nativeElement;

        const svg = d3.select(element)
            .attr("viewBox", `0, 0, ${width}, ${height}`);

        const innerChart = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const data = await this.loadData();

        const firstDate = new Date(2021, 0, 1, 0, 0, 0);
        // const firstDate = d3.min(data, d => d.date)!;
        const lastDate = d3.max(data, d => d.date)!;

        console.log(firstDate, lastDate);

        const xScale = d3.scaleTime()
            .domain([firstDate, lastDate])
            .range([0, innerWidth])
        ;

        const bottomAxis = d3.axisBottom(xScale)
            .tickFormat((v) => d3.timeFormat("%b")(v as Date));

        const maxTemp = d3.max(data, d => d.max_temp_F)!;
        const yScale = d3.scaleLinear()
            .domain([0, maxTemp])
            .range([innerHeight, 0]);

        innerChart
            .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(bottomAxis);

        d3.selectAll(".axis-x text")
            .attr("x", d => {
                const currentMonth = d as Date;
                const nextMonth = new Date(2021, currentMonth.getMonth() + 1, 1);
                return (xScale(nextMonth) - xScale(currentMonth)) / 2;
            })
            .attr("y", "10px")
            .style("font-family", "Roboto, sans-serif")
            .style("font-size", "14px");

        const leftAxis = d3.axisLeft(yScale);
        innerChart
            .append("g")
            .attr("class", "axis-y")
            .call(leftAxis);

        d3.selectAll(".axis-y text")
            .attr("x", "-10px")
            .style("font-family", "Roboto, sans-serif")
            .style("font-size", "14px");

        svg
            .append("text")
            .text("Temperature (°F)")
            .attr("y", 20);

        const aubergine = "#75485E";
        innerChart
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("r", 4)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.avg_temp_F))
            .attr("fill", aubergine);

        const lineGenerator = d3.line<Data>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.avg_temp_F))
            .curve(d3.curveCatmullRom);

        innerChart
            .append("path")
            .attr("d", lineGenerator(data))
            .attr("fill", "none")
            .attr("stroke", aubergine);

        const areaGenerator = d3.area<Data>()
            .x(d => xScale(d.date))
            .y0(d => yScale(d.min_temp_F))
            .y1(d => yScale(d.max_temp_F))
            .curve(d3.curveCatmullRom);

        innerChart
            .append("path")
            .attr("d", areaGenerator(data))
            .attr("fill", aubergine)
            .attr("fill-opacity", 0.2);

        innerChart
            .append("text")
            .text("Average temperature")
            .attr("x", xScale(lastDate) + 10)
            .attr("y", yScale(data[data.length - 1].avg_temp_F))
            .attr("fill", aubergine);

        // tooltips
        const tooltipWidth = 65;
        const tooltipHeight = 32;

        const tooltip = innerChart
            .append("g")
            .attr("class", "tooltip")
            .style("opacity", 0);

        tooltip
            .append("rect")
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", aubergine)
            .attr("fill-opacity", 0.75);

        tooltip
            .append("text")
            .text("00.0°F")
            .attr("x", tooltipWidth / 2)
            .attr("y", tooltipHeight / 2 + 1)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .style("font-weight", 900);

        // events
        innerChart.selectAll("circle")
            .raise()
            .on("mouseenter", (e, d) => {
                console.log("DOM event", e);
                console.log("Attached datum", d);
            })
            .on("mouseleave", (e, d) => {
                console.log("DOM event", e);
                console.log("Attached datum", d);
            });
    }

    private async loadData() {
        return await d3.csv("/weekly-temperature.csv", d3.autoType).then(data => {
            console.log(data);
            return data;
        }) as DSVParsedArray<Data>;
    }
}
