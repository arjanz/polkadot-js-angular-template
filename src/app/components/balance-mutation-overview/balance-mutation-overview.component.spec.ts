import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceMutationOverviewComponent } from './balance-mutation-overview.component';

describe('BalanceMutationOverviewComponent', () => {
  let component: BalanceMutationOverviewComponent;
  let fixture: ComponentFixture<BalanceMutationOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceMutationOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceMutationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
