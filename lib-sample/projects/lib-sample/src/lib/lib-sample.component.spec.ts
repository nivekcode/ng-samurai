import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibSampleComponent } from './lib-sample.component';

describe('LibSampleComponent', () => {
  let component: LibSampleComponent;
  let fixture: ComponentFixture<LibSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
