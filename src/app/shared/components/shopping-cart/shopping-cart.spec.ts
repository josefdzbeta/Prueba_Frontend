import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingCart } from './shopping-cart';
import { CartService } from '../../services/cart-service';
import { BehaviorSubject } from 'rxjs';
import { EventDetail } from '../../models/event-detail.model';
import { SessionDetail } from '../../models/session-detail.model';
import { CartEvent } from '../../models/cart-event.model';

describe('ShoppingCart', () => {
  let component: ShoppingCart;
  let fixture: ComponentFixture<ShoppingCart>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let cartEventsSubject: BehaviorSubject<CartEvent[]>;

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

  const mockCartEvent: CartEvent = {
    event: mockEvent,
    sessions: [mockSession],
  };

  beforeEach(async () => {
    cartEventsSubject = new BehaviorSubject<CartEvent[]>([mockCartEvent]);
    mockCartService = jasmine.createSpyObj('CartService', [
      'getCartEvents',
      'addOrUpdateEvent',
      'removeFromCart',
    ]);
    mockCartService.getCartEvents.and.returnValue(cartEventsSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ShoppingCart],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingCart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart events', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Test Event');
    expect(compiled.querySelector('.cart-item')).toBeTruthy();
  });

  it('should update cart when inputs change', () => {
    component.event = mockEvent;
    component.items = [mockSession];
    component.ngOnChanges();

    expect(mockCartService.addOrUpdateEvent).toHaveBeenCalledWith(mockEvent, [mockSession]);
  });

  it('should not update cart when inputs are empty', () => {
    component.event = undefined;
    component.items = [];
    component.ngOnChanges();

    expect(mockCartService.addOrUpdateEvent).not.toHaveBeenCalled();
  });

  it('should emit remove event when removing current event session', () => {
    spyOn(component.remove, 'emit');
    component.event = mockEvent;
    component.removeFromCart(mockEvent.id, mockSession);

    expect(component.remove.emit).toHaveBeenCalledWith(mockSession);
  });

  it('should call cart service when removing other event session', () => {
    component.event = { ...mockEvent, id: '2' };
    component.removeFromCart(mockEvent.id, mockSession);

    expect(mockCartService.removeFromCart).toHaveBeenCalledWith(mockEvent.id, mockSession.date);
  });

  it('should format date correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dateElement = compiled.querySelector('.item-details span');
    expect(dateElement?.textContent).toBeTruthy();
  });

  it('should display correct quantity', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const quantityElement = compiled.querySelector('.item-quantity span');
    expect(quantityElement?.textContent).toContain('x2');
  });
});
