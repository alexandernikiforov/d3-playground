import {AfterViewInit, Component, ElementRef, OnDestroy, viewChild} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'd3p-zoom-scatter',
    imports: [],
    templateUrl: './zoom-scatter.html',
    styleUrl: './zoom-scatter.scss'
})
export class ZoomScatter implements AfterViewInit, OnDestroy {
    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>('chart');

    private readonly width = 700;
    private readonly height = 500;
    private readonly margin = { top: 20, right: 20, bottom: 40, left: 50 };

    ngOnDestroy(): void {
        const element = this.getElement();
        d3.select(element).selectAll('*').remove();
    }

    ngAfterViewInit(): void {
        this.createChart()
            .then(_ => console.log('Heatmap data loaded'));

    }

    private getElement() {
        return this.chartContainer().nativeElement;
    }

    private async createChart() {
        const w = this.width - this.margin.left - this.margin.right;
        const h = this.height - this.margin.top - this.margin.bottom;

        const element = this.getElement();

        const svg = d3.select(element)
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);

        // --- 1. Random data
        const data = d3.range(300).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100
        }));

        // --- 2. Base scales
        const x0 = d3.scaleLinear().domain([0, 100]).range([0, w]);
        const y0 = d3.scaleLinear().domain([0, 100]).range([h, 0]);

        // --- 3. SVG groups
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        const gx = g.append('g')
            .attr('transform', `translate(0,${h})`).attr('class', 'axis');
        const gy = g.append('g')
            .attr('class', 'axis');

        // --- 4. Draw initial points
        const dots = g.append('g')
            .attr('fill', 'steelblue')
            .selectAll('circle')
            .data(data)
            .enter().append('circle')
            .attr('r', 3)
            .attr('cx', d => x0(d.x))
            .attr('cy', d => y0(d.y));

        gx.call(d3.axisBottom(x0));
        gy.call(d3.axisLeft(y0));

        // --- 5. Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 20])
            .translateExtent([[0, 0], [w, h]])
            .extent([[0, 0], [w, h]])
            // .wheelDelta(event => {
            //     const number = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
            //     console.log(`Mouse deltaX=${event.deltaX}, deltaY=${event.deltaY}, deltaMode=${event.deltaMode}, ctrlKey=${event.ctrlKey}, number=${number}`);
            //     return number;
            // })
            .on('zoom', (event) => {
                const t = event.transform;
                const x = t.rescaleX(x0).interpolate(d3.interpolateRound);
                const y = t.rescaleY(y0).interpolate(d3.interpolateRound);

                dots.attr('cx', d => x(d.x)).attr('cy', d => y(d.y));
                gx.call(d3.axisBottom(x));
                gy.call(d3.axisLeft(y));

                console.log(event.transform);
            });

        // --- 6. Attach zoom
        svg.call(zoom);

        // --- 7. Optional: double-click reset
        svg.on('dblclick.zoom', null)
            .on('dblclick', () => {
                svg.transition().duration(400)
                    .call(zoom.transform, d3.zoomIdentity);
            });
    }
}
