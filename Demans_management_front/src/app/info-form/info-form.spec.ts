import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoForm } from './info-form';

describe('InfoForm', () => {
  let component: InfoForm;
  let fixture: ComponentFixture<InfoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
