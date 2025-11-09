import {AfterViewInit, Component, ElementRef, OnDestroy, viewChild} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'd3p-heatmap',
    imports: [],
    templateUrl: './heatmap.html',
    styleUrl: './heatmap.scss'
})
export class Heatmap implements AfterViewInit, OnDestroy {
    private chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');
    private tooltipContainer = viewChild.required<ElementRef<HTMLElement>>('tooltip');

    private readonly width = 700;
    private readonly height = 500;
    private readonly margin = { top: 20, right: 20, bottom: 40, left: 50 };

    ngAfterViewInit(): void {
        this.createChart()
            .then(_ => console.log('Heatmap data loaded'));
    }

    ngOnDestroy(): void {
        const element = this.getElement();
        d3.select(element).selectAll('*').remove();

        const tooltipElement = this.getTooltipElement();
        d3.select(tooltipElement).selectAll('*').remove();
    }

    private getElement() {
        return this.chartContainer().nativeElement;
    }

    private getTooltipElement() {
        return this.tooltipContainer().nativeElement;
    }

    private async createChart(): Promise<void> {
        const w = this.width - this.margin.left - this.margin.right;
        const h = this.height - this.margin.top - this.margin.bottom;
        const nCols = 10, nRows = 10;

        // --- 1. Data: 10×10 random values
        const data: { x: number; y: number; value: number }[] = [];
        for (let y = 0; y < nRows; y++) {
            for (let x = 0; x < nCols; x++) {
                data.push({ x, y, value: Math.round(Math.random() * 100) });
            }
        }

        const element = this.getElement();

        const svg = d3.select(element)
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // --- 2. Scales
        const x = d3.scaleBand<number>()
            .domain(d3.range(nCols))
            .range([0, w])
            .paddingInner(0.05);

        const y = d3.scaleBand<number>()
            .domain(d3.range(nRows))
            .range([h, 0])
            .paddingInner(0.05);

        const color = d3.scaleSequential(d3.interpolateRdYlGn)
            .domain([100, 0]); // high=red, low=green

        // --- 4. Draw cells
        const cells = g.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', d => x(d.x)!)
            .attr('y', d => y(d.y)!)
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('fill', d => color(d.value));

        // --- 5. Add text labels
        g.selectAll('text')
            .data(data)
            .enter().append('text')
            .attr('x', d => x(d.x)! + x.bandwidth() / 2)
            .attr('y', d => y(d.y)! + y.bandwidth() / 2)
            .attr("dominant-baseline", "middle")
            .attr('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => d.value);

        // --- 6. Axes
        const xAxis = d3.axisBottom(x).tickFormat(i => `T${+i + 1}`);
        const yAxis = d3.axisLeft(y).tickFormat(i => `P${+i + 1}`);

        g.append('g')
            .attr('transform', `translate(0,${h})`)
            .call(xAxis);

        g.append('g')
            .call(yAxis);

        const tooltip = d3.select(this.getTooltipElement());

        // --- 8. Hover interactions
        cells
            .on('mouseenter', (event, d) => {
                d3.select(event.currentTarget)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);

                tooltip
                    .style('visibility', 'visible')
                    .html(`<b>Cell</b>: (${d.x + 1}, ${d.y + 1})<br><b>Value</b>: ${d.value}`);
            })
            .on('mousemove', (event) => {
                const [px, py] = d3.pointer(event, document.body); // <— reliable position
                tooltip
                    .style('position', 'absolute')
                    .style('top', (py + 10) + 'px')
                    .style('left', (px + 10) + 'px');
            })
            // .on('mousemove', (event) => {
            //     tooltip
            //         .style('top', (event.pageY + 10) + 'px')
            //         .style('left', (event.pageX + 10) + 'px');
            // })
            .on('mouseleave', (event) => {
                d3.select(event.currentTarget)
                    .attr('stroke', 'none');

                tooltip.style('visibility', 'hidden');
            });
    }
}
