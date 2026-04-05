import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CanvasChart} from './canvas-chart';

describe('CanvasChart', () => {
    let component: CanvasChart;
    let fixture: ComponentFixture<CanvasChart>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CanvasChart]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CanvasChart);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
