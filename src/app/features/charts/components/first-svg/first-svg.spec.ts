import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FirstSvg} from './first-svg';

describe('FirstSvg', () => {
    let component: FirstSvg;
    let fixture: ComponentFixture<FirstSvg>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FirstSvg]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FirstSvg);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
