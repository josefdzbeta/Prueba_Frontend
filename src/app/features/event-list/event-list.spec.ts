import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventList } from './event-list';
import { RouterOutlet, RouterLink, provideRouter } from '@angular/router';
import { EventService } from '../../core/services/event';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;
  let mockEventService: jasmine.SpyObj<EventService>;

  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      image: 'test.jpg',
      startDate: 1687392000000,
      endDate: 1687478400000,
      place: 'Test Place',
    },
  ];

  beforeEach(async () => {
    mockEventService = jasmine.createSpyObj('EventService', ['getEvents']);
    mockEventService.getEvents.and.returnValue(of(mockEvents));

    await TestBed.configureTestingModule({
      imports: [EventList, RouterOutlet, RouterLink, DatePipe],
      providers: [{ provide: EventService, useValue: mockEventService }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display events from service', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(mockEventService.getEvents).toHaveBeenCalled();
    expect(compiled.querySelector('.event-card')).toBeTruthy();
    expect(compiled.querySelector('.title')?.textContent).toContain('Test Event');
    expect(compiled.querySelector('.subtitle')?.textContent).toContain('Test Subtitle');
  });

  it('should toggle hasRoute on router outlet events', () => {
    expect(component.hasRoute).toBeFalse();

    const outlet = fixture.nativeElement.querySelector('router-outlet');
    outlet.dispatchEvent(new CustomEvent('activate'));
    fixture.detectChanges();

    expect(component.hasRoute).toBeTrue();

    outlet.dispatchEvent(new CustomEvent('deactivate'));
    fixture.detectChanges();

    expect(component.hasRoute).toBeFalse();
  });

  it('should format dates correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const datesElement = compiled.querySelector('.dates');

    expect(datesElement?.textContent).toBeTruthy();
    expect(datesElement?.textContent).toContain('–');
  });
});
