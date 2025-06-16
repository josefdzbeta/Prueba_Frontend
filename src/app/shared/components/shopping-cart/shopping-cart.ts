import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDetail } from '../../models/event-detail.model';
import { SessionDetail } from '../../models/session-detail.model';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart implements OnChanges {
  private cartService = inject(CartService);
  cartEvents$ = this.cartService.getCartEvents();

  @Input() event?: EventDetail;
  @Input() items: (SessionDetail & { selected: number })[] = [];
  @Output() remove = new EventEmitter<SessionDetail>();

  ngOnChanges() {
    if (this.event && this.items.length > 0) {
      this.cartService.addOrUpdateEvent(this.event, this.items);
    }
  }

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
