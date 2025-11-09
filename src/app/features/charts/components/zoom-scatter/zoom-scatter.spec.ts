import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ZoomScatter} from './zoom-scatter';

describe('ZoomScater', () => {
    let component: ZoomScatter;
    let fixture: ComponentFixture<ZoomScatter>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ZoomScatter]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ZoomScatter);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
