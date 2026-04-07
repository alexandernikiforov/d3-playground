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

interface Grid {
    rowCount: number;
    columnCount: number;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
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

    /**
     * The number of pixels per tick on the y-axis.
     * @private
     */
    private readonly pixelsPerTick = 36;

    /**
     * The width of a single bucket in the chart.
     *
     * @private
     */
    private readonly bucketWidth = 120;

    /**
     * The width of a bucket's sidebar in the chart.
     */
    private readonly barWidth = 8;

    /**
     * The number of minutes in a single bucket.
     *
     * @private
     */
    private readonly bucketMinutes = 30;

    private redrawScheduled = false;

    private priceLevels: number[] = [];
    private priceLevelIndex: Map<string, number> = new Map<string, number>();

    private timeBuckets: Date[] = [];
    private timeBucketIndex: Map<number, number> = new Map<number, number>();

    private readonly anchorTime = new Date(2026, 0, 1, 20, 0);

    private readonly mockBucket: TimeBucket = {
        startTime: new Date(2026, 0, 1, 21, 30),
        open: 1.0820,
        close: 1.0810,
        cells: [
            { price: 1.0825, bidVolume: 12, askVolume: 30, },
            { price: 1.0820, bidVolume: 24, askVolume: 18 },
            { price: 1.0815, bidVolume: 35, askVolume: 9 },
            { price: 1.0810, bidVolume: 17, askVolume: 22 },
            { price: 1.0805, bidVolume: 8, askVolume: 14 },
        ]
    };

    ngAfterViewInit(): void {
        this.initChart();

        // call refresh for the first time to avoid timing issues with the resize observer
        this.refreshChart();

        this.resizeObserver = new ResizeObserver(() => {
            this.scheduleRedraw();
        });

        this.resizeObserver.observe(this.chartRef().nativeElement);
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }

    private scheduleRedraw(): void {
        if (this.redrawScheduled) {
            return;
        }

        this.redrawScheduled = true;

        requestAnimationFrame(() => {
            this.redrawScheduled = false;
            this.refreshChart();
        });
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
        const marginLeft = 20;
        const marginBottom = 80;
        const marginRight = 80;

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

        const columnCount = Math.floor(geometry.innerWidth / this.bucketWidth);
        const rowCount = Math.floor(geometry.innerHeight / this.pixelsPerTick);
        const grid: Grid = {
            rowCount: rowCount,
            columnCount: columnCount,
            xScale: d3.scaleLinear().domain([0, columnCount]).range([0, columnCount * this.bucketWidth]),
            yScale: d3.scaleLinear().domain([0, rowCount]).range([rowCount * this.pixelsPerTick, 0])
        }

        // recalculate the data to be shown in the chart
        this.priceLevels = d3.range(rowCount).map(i => 1.0740 + i * 0.0005);
        this.priceLevelIndex = new Map(
            this.priceLevels.map((price, i) => [price.toFixed(4), i])
        );

        this.timeBuckets = d3.range(columnCount).map(i =>
            new Date(this.anchorTime.getTime() + i * this.bucketMinutes * 60 * 1000)
        );
        this.timeBucketIndex = new Map(
            this.timeBuckets.map((date, i) => [date.getTime(), i])
        );

        this.refreshSvg(geometry, grid);
        this.refreshCanvas(geometry, grid);
    }

    private refreshSvg(g: ChartGeometry, grid: Grid): void {
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
        // y-axis
        const yScale = grid.yScale;

        const priceTickPositions = this.priceLevels.map((price, i) => ({
            y: i + 0.5,
            label: d3.format('.4f')(price)
        }));

        const yAxisGenerator = d3.axisRight(yScale)
            .tickValues(priceTickPositions.map(d => d.y))
            .tickFormat((y) => {
                const tick = priceTickPositions.find(d => d.y === y);
                return tick ? tick.label : '';
            })
            .tickSizeOuter(0);

        this.svgGroups!.yAxis.call(yAxisGenerator)
            .selectAll('text')
            .style('font-size', '16px');

        // x-axis
        const xScale = grid.xScale;
        const timeTickPositions = this.timeBuckets.map((bucket, i) => ({
            x: i + 0.5,
            label: d3.timeFormat('%H:%M')(bucket)
        }));

        const xAxisGenerator = d3.axisBottom(xScale)
            .tickValues(timeTickPositions.map(d => d.x))
            .tickFormat((x) => {
                const tick = timeTickPositions.find(d => d.x === x);
                return tick ? tick.label : '';
            })
            .tickSizeOuter(0);

        this.svgGroups!.xAxis.call(xAxisGenerator)
            .selectAll('text')
            .style('font-size', '16px');

    }

    private refreshCanvas(g: ChartGeometry, grid: Grid): void {
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
        this.draw(ctx, g, grid);
    }

    private draw(ctx: CanvasRenderingContext2D, g: ChartGeometry, grid: Grid): void {
        // draw the bucket
        const startTime = this.mockBucket.startTime;
        this.mockBucket.cells.forEach((cell) => {
            this.drawCell(ctx, g, grid, startTime, cell);
        });

        this.drawSideBar(ctx, g, grid, this.mockBucket);

        // draw the grid
        const originY = g.marginTop;
        const originX = g.marginLeft;

        ctx.save();

        ctx.strokeStyle = '#d3d3d3';
        // ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // horizontal lines
        for (let row = 0; row <= grid.rowCount; row++) {
            const y = originY + grid.yScale(row) + 0.5;

            ctx.beginPath();
            ctx.moveTo(originX, y);
            ctx.lineTo(originX + g.innerWidth, y);
            ctx.stroke();
        }

        // vertical lines
        for (let col = 0; col <= grid.columnCount; col++) {
            const x = originX + grid.xScale(col) + 0.5;

            ctx.beginPath();
            ctx.moveTo(x, originY);
            ctx.lineTo(x, originY + g.innerHeight);
            ctx.stroke();
        }

        ctx.restore();
    }

    private drawSideBar(ctx: CanvasRenderingContext2D, g: ChartGeometry, grid: Grid, bucket: TimeBucket) {
        const columnIndex = this.timeBucketIndex.get(bucket.startTime.getTime());
        if (columnIndex == undefined) {
            console.log(`Skipping cell for undefined time bucket: ${bucket.startTime}`);
            return;
        }

        const openRowIndex = this.priceLevelIndex.get(bucket.open.toFixed(4));
        if (openRowIndex == undefined) {
            console.log(`Skipping cell for undefined price level: ${bucket.open}`);
            return;
        }

        const closeRowIndex = this.priceLevelIndex.get(bucket.close.toFixed(4));
        if (closeRowIndex == undefined) {
            console.log(`Skipping cell for undefined price level: ${bucket.close}`);
            return;
        }

        console.log(`Open price index ${openRowIndex}, close price index ${closeRowIndex}`)

        const openRowBounds = this.getRowBounds(g, grid, openRowIndex);
        const closeRowBounds = this.getRowBounds(g, grid, closeRowIndex);
        const x = g.marginLeft + grid.xScale(columnIndex);
        const y = bucket.close >= bucket.open
            ? closeRowBounds.top
            : openRowBounds.top
        ;

        const height = bucket.close >= bucket.open
            ? Math.abs(closeRowBounds.top - openRowBounds.bottom)
            : Math.abs(openRowBounds.top - closeRowBounds.bottom)
        ;

        ctx.save();
        ctx.fillStyle = bucket.close >= bucket.open
            ? 'rgba(0, 160, 0, 0.75)'
            : 'rgba(200, 0, 0, 0.75)';

        ctx.fillRect(x, y, this.barWidth, height);
        ctx.restore();
    }

    private drawCell(ctx: CanvasRenderingContext2D, g: ChartGeometry, grid: Grid, startTime: Date, cell: LadderCell) {
        const columnIndex = this.timeBucketIndex.get(startTime.getTime());
        if (columnIndex == undefined) {
            console.log(`Skipping cell for undefined time bucket: ${startTime}`);
            return;
        }

        const rowIndex = this.priceLevelIndex.get(cell.price.toFixed(4));
        if (rowIndex == undefined) {
            console.log(`Skipping cell for undefined price level: ${cell.price}`);
            return;
        }

        const bounds = this.getCellBounds(g, grid, columnIndex, rowIndex);

        ctx.save();
        ctx.fillStyle = this.getCellFill(cell);
        ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);

        ctx.strokeStyle = 'rgba(0, 100, 0, 0.8)';
        ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);

        // text styling
        ctx.fillStyle = 'black';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // centered label
        ctx.fillText(`${cell.bidVolume} x ${cell.askVolume}`, bounds.centerX, bounds.centerY);

        ctx.restore();
    }

    private getCellFill(cell: LadderCell): string {
        const delta = cell.askVolume - cell.bidVolume;
        const magnitude = Math.abs(delta);

        const alpha = Math.min(0.10 + magnitude / 100, 0.35);

        if (delta > 0) {
            return `rgba(0, 160, 0, ${alpha})`;
        }

        if (delta < 0) {
            return `rgba(200, 0, 0, ${alpha})`;
        }

        return 'rgba(120, 120, 120, 0.10)';
    }

    private getHostDimensions(): { width: number; height: number } {
        const host = this.chartRef().nativeElement;
        const rect = host.getBoundingClientRect();

        const hostWidth = Math.floor(rect.width);
        const hostHeight = Math.floor(rect.height);

        return {
            width: hostWidth,
            height: hostHeight
        };
    }

    private getColumnBounds(g: ChartGeometry, grid: Grid, columnIndex: number) {
        const x1 = grid.xScale(columnIndex);
        const x2 = grid.xScale(columnIndex + 1);

        const columnWidth = x2 - x1;
        const left = g.marginLeft + x1;

        return {
            left,
            right: left + columnWidth,
            width: columnWidth,
            center: left + columnWidth / 2,
        };
    }

    private getRowBounds(g: ChartGeometry, grid: Grid, rowIndex: number) {
        const y1 = grid.yScale(rowIndex);
        const y2 = grid.yScale(rowIndex + 1);

        const topLocal = Math.min(y1, y2);
        const bottomLocal = Math.max(y1, y2);

        const top = g.marginTop + topLocal;
        const bottom = g.marginTop + bottomLocal;
        const height = bottom - top;

        return {
            top,
            bottom,
            height,
            center: top + height / 2,
        };
    }

    private getCellBounds(
        g: ChartGeometry,
        grid: Grid,
        columnIndex: number,
        rowIndex: number
    ) {
        const column = this.getColumnBounds(g, grid, columnIndex);
        const row = this.getRowBounds(g, grid, rowIndex);

        return {
            left: column.left,
            right: column.right,
            top: row.top,
            bottom: row.bottom,
            width: column.width,
            height: row.height,
            centerX: column.center,
            centerY: row.center,
        };
    }
}
