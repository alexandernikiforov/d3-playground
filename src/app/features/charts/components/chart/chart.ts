import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'd3p-chart',
    imports: [],
    templateUrl: './chart.html',
    styleUrl: './chart.scss'
})
export class Chart implements AfterViewInit {
    chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');

    ngAfterViewInit(): void {
        this.createChart();
    }

    private createChart() {
        const element = this.chartContainer().nativeElement;

        const data = [
            {name: "Jim", votes: 12},
            {name: "Sue", votes: 5},
            {name: "Bob", votes: 21},
            {name: "Ann", votes: 17},
            {name: "Dan", votes: 3}
        ];

        d3.select(element)
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 100)
            .attr("fill", "blue")
            .attr("transform", "translate(150, 140)")
    }
}
