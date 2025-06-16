import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventDetail } from '../../shared/models/event-detail.model';
import { EventInfoResponse } from '../../shared/models/event-detail.model';
import { EventService } from './event';

describe('EventService', () => {
  let service: EventService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(EventService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const mockEvents: EventDetail[] = [{
    id: '1',
    title: 'Test Event 1',
    subtitle: 'Test Subtitle',
    description: '',
    place: '—',
    image: 'test.jpg',
    startDate: 1687392000000, // Example timestamp
    endDate: 1687478400000,  // Example timestamp
  }];

  const mockEventInfo: EventInfoResponse = {
    event: {
      id: '1',
      title: 'Test Event 1',
      subtitle: 'Test Subtitle',
      image: 'test.jpg'
    },
    sessions: [
      {
        date: '1687392000000',
        availability: '10'
      }
    ]
  };

  it('should get events with transformed dates', () => {
    service.getEvents().subscribe(events => {
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(typeof events[0].startDate).toBe('number');
    });

    const req = httpTestingController.expectOne('assets/data/events.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should get event info with transformed data', () => {
    service.getEventInfo('1').subscribe(info => {
      expect(info.sessions[0].date).toBeTruthy();
      expect(typeof info.sessions[0].availability).toBe('number');
    });

    const req = httpTestingController.expectOne('assets/data/event-info-1.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockEventInfo);
  });

  it('should handle empty events response', () => {
    service.getEvents().subscribe(events => {
      expect(events.length).toBe(0);
    });

    const req = httpTestingController.expectOne('assets/data/events.json');
    req.flush([]);
  });

  it('should transform session availability to numbers', () => {
    service.getEventInfo('1').subscribe(info => {
      expect(typeof info.sessions[0].availability).toBe('number');
    });

    const req = httpTestingController.expectOne('assets/data/event-info-1.json');
    req.flush(mockEventInfo);
  });
});
