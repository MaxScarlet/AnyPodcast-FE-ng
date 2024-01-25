import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeFormComponent } from './episode-form.component';

describe('EpisodeFormComponent', () => {
  let component: EpisodeFormComponent;
  let fixture: ComponentFixture<EpisodeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EpisodeFormComponent]
    });
    fixture = TestBed.createComponent(EpisodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
