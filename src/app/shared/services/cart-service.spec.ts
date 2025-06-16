import { TestBed } from '@angular/core/testing';
import { CartService } from './cart-service';
import { EventDetail } from '../models/event-detail.model';
import { SessionDetail } from '../models/session-detail.model';

describe('CartService', () => {
  let service: CartService;
  let localStorageSpy: { getItem: jasmine.Spy; setItem: jasmine.Spy };

  const mockEvent: EventDetail = {
    id: '1',
    title: 'Test Event',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    image: 'test.jpg',
    place: 'Test Place',
    startDate: 1687392000000,
    endDate: 1687478400000,
  };

  const mockSession: SessionDetail & { selected: number } = {
    date: 1687392000000,
    availability: 10,
    selected: 2,
  };

  beforeEach(() => {
    localStorageSpy = {
      getItem: jasmine.createSpy('getItem'),
      setItem: jasmine.createSpy('setItem'),
    };
    spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);

    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle empty localStorage', () => {
    localStorageSpy.getItem.and.returnValue(null);

    service = TestBed.inject(CartService);
    service.getCartEvents().subscribe((events) => {
      expect(events).toEqual([]);
    });
  });

  it('should handle corrupted localStorage data', () => {
    localStorageSpy.getItem.and.returnValue('invalid json');

    service = TestBed.inject(CartService);
    service.getCartEvents().subscribe((events) => {
      expect(events).toEqual([]);
    });
  });

  it('should add new event to cart', () => {
    service.addOrUpdateEvent(mockEvent, [mockSession]);

    service.getCartEvents().subscribe((events) => {
      expect(events.length).toBe(1);
      expect(events[0].event).toEqual(mockEvent);
      expect(events[0].sessions).toEqual([mockSession]);
    });
  });

  it('should update existing event in cart', () => {
    const updatedSession = { ...mockSession, selected: 3 };

    service.addOrUpdateEvent(mockEvent, [mockSession]);
    service.addOrUpdateEvent(mockEvent, [updatedSession]);

    service.getCartEvents().subscribe((events) => {
      expect(events.length).toBe(1);
      expect(events[0].sessions[0].selected).toBe(3);
    });
  });

  it('should remove event when no sessions selected', () => {
    service.addOrUpdateEvent(mockEvent, [mockSession]);
    service.addOrUpdateEvent(mockEvent, [{ ...mockSession, selected: 0 }]);

    service.getCartEvents().subscribe((events) => {
      expect(events.length).toBe(0);
    });
  });

  it('should remove session from cart', () => {
    service.addOrUpdateEvent(mockEvent, [mockSession]);
    service.removeFromCart(mockEvent.id, mockSession.date);

    service.getCartEvents().subscribe((events) => {
      expect(events[0].sessions[0].selected).toBe(1);
    });
  });

  it('should remove event when last session is removed', () => {
    const singleSelectedSession = { ...mockSession, selected: 1 };
    service.addOrUpdateEvent(mockEvent, [singleSelectedSession]);
    service.removeFromCart(mockEvent.id, singleSelectedSession.date);

    service.getCartEvents().subscribe((events) => {
      expect(events.length).toBe(0);
    });
  });

  it('should save to localStorage when cart changes', () => {
    service.addOrUpdateEvent(mockEvent, [mockSession]);

    expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart_events', jasmine.any(String));
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageSpy.setItem.and.throwError('Storage error');

    expect(() => {
      service.addOrUpdateEvent(mockEvent, [mockSession]);
    }).not.toThrow();
  });
});
