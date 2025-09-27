import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StackedChart} from './stacked-chart';

describe('StackedChart', () => {
    let component: StackedChart;
    let fixture: ComponentFixture<StackedChart>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StackedChart]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StackedChart);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
