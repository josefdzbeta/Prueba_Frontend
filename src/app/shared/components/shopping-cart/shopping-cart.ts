import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDetail } from '../../models/event-detail.model';
import { SessionDetail } from '../../models/session-detail.model';
import { CartService } from '../../services/cart-service';

/**
 * Shopping Cart Component
 * Displays and manages the shopping cart contents including events and their sessions
 * Allows removing items and syncs with the CartService
 */
@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart implements OnChanges {
  /** Service for managing cart state */
  private cartService = inject(CartService);

  /** Observable of current cart events */
  cartEvents$ = this.cartService.getCartEvents();

  /** Current event being displayed/modified */
  @Input() event?: EventDetail;

  /** Selected sessions for the current event */
  @Input() items: (SessionDetail & { selected: number })[] = [];

  /** Emits when a session needs to be removed from the current event */
  @Output() remove = new EventEmitter<SessionDetail>();

  /**
   * Updates cart when inputs change
   * If both event and items are present, syncs with cart service
   */
  ngOnChanges() {
    if (this.event && this.items.length > 0) {
      this.cartService.addOrUpdateEvent(this.event, this.items);
    }
  }

  /**
   * Handles removing items from the cart
   * If removing from current event, emits remove event
   * Otherwise updates cart service directly
   *
   * @param eventId - ID of the event containing the session to remove
   * @param session - Session to remove from cart
   */
  removeFromCart(eventId: string, session: SessionDetail) {
    // If it's the current event, emit to update the current view
    if (this.event?.id === eventId) {
      this.remove.emit(session);
    } else {
      // Otherwise, just update the cart
      this.cartService.removeFromCart(eventId, session.date);
    }
  }
}
