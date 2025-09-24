import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FirstGraph} from './first-graph';

describe('FirstGraph', () => {
    let component: FirstGraph;
    let fixture: ComponentFixture<FirstGraph>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FirstGraph]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FirstGraph);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
