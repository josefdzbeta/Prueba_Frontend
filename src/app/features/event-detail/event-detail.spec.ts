import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventDetail } from './event-detail';
import { EventService } from '../../core/services/event';
import { CartService } from '../../shared/services/cart-service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingCart } from '../../shared/components/shopping-cart/shopping-cart';
import { EventDetail as EventDetailModel } from '../../shared/models/event-detail.model';
import { SessionDetail } from '../../shared/models/session-detail.model';

describe('EventDetail', () => {
  let component: EventDetail;
  let fixture: ComponentFixture<EventDetail>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockParamMap: BehaviorSubject<ParamMap>;

  const mockEvent: EventDetailModel = {
    id: '1',
    title: 'Test Event',
    subtitle: 'Test Subtitle',
    image: 'test.jpg',
    place: 'Test Place',
    startDate: 1687392000000,
    endDate: 1687478400000,
    description: 'Test Description',
  };

  const mockSessions: SessionDetail[] = [
    { date: 1687392000000, availability: 10 },
    { date: 1687478400000, availability: 5 },
  ];

  const mockEventInfo = {
    event: mockEvent,
    sessions: mockSessions,
  };

  beforeEach(async () => {
    mockEventService = jasmine.createSpyObj('EventService', ['getEventInfo']);
    mockCartService = jasmine.createSpyObj('CartService', ['getCartEvents', 'addOrUpdateEvent']);

    const paramMapMock = {
      get: (key: string) => (key === 'id' ? '1' : null),
      has: (key: string) => key === 'id',
      getAll: () => [],
      keys: [],
    } as ParamMap;
    mockParamMap = new BehaviorSubject<ParamMap>(paramMapMock);

    mockEventService.getEventInfo.and.returnValue(of(mockEventInfo));
    mockCartService.getCartEvents.and.returnValue(of([]));
    mockCartService.addOrUpdateEvent.and.returnValue();

    await TestBed.configureTestingModule({
      imports: [CommonModule, ShoppingCart, EventDetail],
      providers: [
        { provide: EventService, useValue: mockEventService },
        { provide: CartService, useValue: mockCartService },
        { provide: ActivatedRoute, useValue: { paramMap: mockParamMap } },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sessions', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const sessions = compiled.querySelectorAll('.session-item');
    expect(sessions.length).toBe(2);
  }));

  it('should increment session count', fakeAsync(() => {
    tick();
    const session = mockSessions[0];
    component.increment(session);
    tick();
    fixture.detectChanges();

    component.cartItems$.subscribe((items) => {
      expect(items[0].selected).toBe(1);
    });
  }));

  it('should decrement session count', fakeAsync(() => {
    tick();
    const session = mockSessions[0];
    component.increment(session);
    component.increment(session);
    component.decrement(session);
    tick();
    fixture.detectChanges();

    component.cartItems$.subscribe((items) => {
      expect(items[0].selected).toBe(1);
    });
  }));

  it('should not increment beyond availability', fakeAsync(() => {
    tick();
    const session = mockSessions[0];
    for (let i = 0; i <= session.availability + 1; i++) {
      component.increment(session);
    }
    tick();
    fixture.detectChanges();

    component.cartItems$.subscribe((items) => {
      expect(items[0].selected).toBe(session.availability);
    });
  }));

  it('should update cart service when selection changes', fakeAsync(() => {
    tick();
    const session = mockSessions[0];
    component.increment(session);
    tick();
    fixture.detectChanges();

    expect(mockCartService.addOrUpdateEvent).toHaveBeenCalledWith(mockEvent, jasmine.any(Array));
  }));

  it('should sort sessions by date', fakeAsync(() => {
    tick();
    component.sessionsWithSelection$.subscribe((sessions) => {
      expect(sessions[0].date).toBeLessThan(sessions[1].date);
    });
  }));
});
