import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import * as d3 from "d3";
import {DSVParsedArray} from "d3";

interface Data {
    year: number;
    vinyl: number;
    eight_track: number;
    cassette: number;
    cd: number;
    download: number;
    streaming: number;
    other: number;
}

const formatsInfo = [
    { id: "vinyl", label: "Vinyl", color: "#76B6C2" },
    { id: "eight_track", label: "8-Track", color: "#4CDDF7" },
    { id: "cassette", label: "Cassette", color: "#20B9BC" },
    { id: "cd", label: "CD", color: "#2F8999" },
    { id: "download", label: "Download", color: "#E39F94" },
    { id: "streaming", label: "Streaming", color: "#ED7864" },
    { id: "other", label: "Other", color: "#ABABAB" },
];

@Component({
    selector: 'd3p-stacked-chart',
    imports: [],
    templateUrl: './stacked-chart.html',
    styleUrl: './stacked-chart.scss'
})
export class StackedChart implements AfterViewInit {
    chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');

    ngAfterViewInit(): void {
        this.loadData().then((data) => {
            this.createChart(data);
        }).then(_ => console.log('Stacked Chart loaded.'));
    }

    private createChart(data: DSVParsedArray<Data>) {
        const element = this.chartContainer().nativeElement;

        const margin = { top: 50, right: 0, bottom: 50, left: 70 };
        const width = 900;
        const height = 350;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(element)
            .attr("viewBox", `0, 0, ${width}, ${height}`);

        const innerChart = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const stackGenerator = d3.stack<Data, string>()
            .keys(formatsInfo.map(f => f.id));

        const annotatedData = stackGenerator(data);
        console.log(annotatedData);

        const xScale = d3.scaleBand<number>()
            .domain(data.map(d => d.year))
            .range([0, innerWidth])
            .paddingInner(0.2);

        const colorScale = d3.scaleOrdinal<string, string>()
            .domain(formatsInfo.map(f => f.id))
            .range(formatsInfo.map(f => f.color));

        const maxUpperBoundary = d3.max(annotatedData[annotatedData.length - 1], d => d[1]) || 0;
        const yScale = d3.scaleLinear()
            .domain([0, maxUpperBoundary])
            .range([innerHeight, 0])
            .nice();

        annotatedData.forEach(series => {
            innerChart
                .selectAll(`.bar-${series.key}`)
                .data(series)
                .join("rect")
                .attr("class", d => `bar-${series.key}`)

                .attr("x", d => xScale(d.data.year) || 0)
                .attr("y", d => yScale(d[1]))
                .attr("width", xScale.bandwidth())
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("fill", colorScale(series.key));
        });

        const bottomAxis = d3.axisBottom(xScale)
            .tickValues(d3.range(1975, 2020, 5))
            .tickSizeOuter(0);

        innerChart
            .append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(bottomAxis);

        const leftAxis = d3.axisLeft(yScale);
        innerChart
            .append("g")
            .call(leftAxis);

        d3.selectAll(".tick text")
            .style("font-family", "Roboto, sans-serif")
            .style("font-size", "14px")
            .style("font-weight", "500");

    }

    private async loadData() {
        return await d3.csv("/revenue.csv", d3.autoType).then(data => {
            console.log(data);
            return data;
        }) as DSVParsedArray<Data>;
    }
}
