import {AfterViewInit, Component, ElementRef, OnDestroy, viewChild} from '@angular/core';
import * as d3 from 'd3';

/**
 * Interface representing the structure of the chart's SVG element.
 */
interface SvgGroups {
    root: d3.Selection<SVGGElement, unknown, null, undefined>;
    xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
    yAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
}

interface ChartGeometry {
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
}

@Component({
    selector: 'd3p-canvas-chart',
    imports: [],
    templateUrl: './canvas-chart.html',
    styleUrl: './canvas-chart.scss'
})
export class CanvasChart implements AfterViewInit, OnDestroy {
    private resizeObserver: ResizeObserver | null = null;
    private renderingContext: CanvasRenderingContext2D | null = null;

    private readonly chartRef = viewChild.required<ElementRef<HTMLElement>>('chart');
    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
    private readonly svgRef = viewChild.required<ElementRef<SVGElement>>('svg');

    private svgGroups: SvgGroups | null = null;

    private readonly pixelsPerTick = 36;

    ngAfterViewInit(): void {
        this.initChart();

        // call refresh for the first time to avoid timing issues with the resize observer
        this.refreshChart();

        this.resizeObserver = new ResizeObserver(() => {
            this.refreshChart();
        });

        this.resizeObserver.observe(this.chartRef().nativeElement);
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }

    /**
     * Initializes the chart by applying styles and configurations
     * to the SVG element referenced in the component.
     */
    private initChart(): void {
        this.initSvg();
        this.initCanvas();
    }

    private initSvg(): void {
        const svgElement = this.svgRef().nativeElement;

        // to show something, let's put a border around the SVG
        const svg = d3.select(svgElement)
            .style("border", "1px solid black");

        const root = svg.append('g');
        const xAxis = root.append('g').classed('x-axis', true);
        const yAxis = root.append('g').classed('y-axis', true);

        this.svgGroups = { root: root, xAxis: xAxis, yAxis: yAxis };
    }

    private initCanvas(): void {
        this.renderingContext = this.canvasRef().nativeElement.getContext('2d');
    }

    private refreshChart(): void {
        const { width, height } = this.getHostDimensions();
        const marginTop = 20;
        const marginRight = 60;
        const marginBottom = 30;
        const marginLeft = 20;

        // recalculate chart geometry
        const geometry: ChartGeometry = {
            outerWidth: width,
            outerHeight: height,
            innerWidth: width - marginLeft - marginRight,
            innerHeight: height - marginTop - marginBottom,
            marginTop: marginTop,
            marginRight: marginRight,
            marginBottom: marginBottom,
            marginLeft: marginLeft
        }

        this.refreshSvg(geometry);
        this.refreshCanvas(geometry);
    }

    private refreshSvg(g: ChartGeometry): void {
        const svgElement = this.svgRef().nativeElement;
        const groups = this.svgGroups!;

        d3.select(svgElement)
            .attr("width", g.outerWidth)
            .attr("height", g.outerHeight);

        // transform axes
        groups.xAxis.attr(
            'transform',
            `translate(${g.marginLeft}, ${g.marginTop + g.innerHeight})`
        );

        groups.yAxis.attr(
            'transform',
            `translate(${g.marginLeft + g.innerWidth}, ${g.marginTop})`
        );

        // draw axes
        const visibleTickCount = Math.floor(g.innerHeight / this.pixelsPerTick);
        const priceLevels = d3.range(visibleTickCount).map(i => 1.0860 - i * 0.0005);

        const lowest = priceLevels[priceLevels.length - 1];
        const highest = priceLevels[0];

        const yScale = d3.scaleLinear()
            .domain([lowest, highest])
            .range([g.innerHeight, 0]);

        const yAxisGenerator = d3.axisRight(yScale)
            .tickValues(priceLevels)
            .tickFormat(d3.format('.4f'));

        this.svgGroups!.yAxis.call(yAxisGenerator)
            .selectAll('text')
            .style('font-size', '20px');
    }

    private refreshCanvas(g: ChartGeometry): void {
        const canvasElement = this.canvasRef().nativeElement;

        // reset canvas context and size
        const ctx = this.renderingContext!;
        const dpr = window.devicePixelRatio;

        canvasElement.style.width = `${g.outerWidth}px`;
        canvasElement.style.height = `${g.outerHeight}px`;

        canvasElement.width = Math.floor(g.outerWidth * dpr);
        canvasElement.height = Math.floor(g.outerHeight * dpr);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, g.outerWidth, g.outerHeight);

        // draw what we need to draw on the canvas
        this.draw(ctx, g);
    }

    private draw(ctx: CanvasRenderingContext2D, g: ChartGeometry): void {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(20, 20, g.outerWidth - 140, g.outerHeight - 40);
    }

    private getHostDimensions(): { width: number; height: number } {
        const host = this.chartRef().nativeElement;
        const rect = host.getBoundingClientRect();

        const hostWidth = Math.floor(rect.width);
        const hostHeight = Math.floor(rect.height);

        const result = {
            width: hostWidth,
            height: hostHeight
        };

        console.log('chart host size', result);
        return result;
    }
}
