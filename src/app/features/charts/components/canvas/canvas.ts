import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'd3p-canvas',
    imports: [],
    templateUrl: './canvas.html',
    styleUrl: './canvas.scss'
})
export class Canvas implements AfterViewInit {
    chartContainer = viewChild.required<ElementRef<HTMLElement>>('canvas');

    ngAfterViewInit(): void {
        const element = this.chartContainer().nativeElement;

        const canvas = d3.select(element)
            .append("canvas")
            .style("border", "1px solid black");

        const devicePixelRatio = window.devicePixelRatio;
        const width = element.offsetWidth;
        const height = 0.333 * width;

        console.log(`width = ${width}`);

        canvas
            .attr("width", width * devicePixelRatio)
            .attr("height", height * devicePixelRatio);

        const context = canvas.node()!.getContext("2d")!;
        context.scale(devicePixelRatio, devicePixelRatio);

        context.beginPath();
        context.moveTo(66, 60);
        context.lineTo(186, 300);
        context.stroke();
    }

}
