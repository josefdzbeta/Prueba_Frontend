import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { EventService } from '../../core/services/event';
import { ShoppingCart } from '../../shared/components/shopping-cart/shopping-cart';
import { SessionDetail, SessionWithSelection } from '../../shared/models/session-detail.model';
import { CartService } from '../../shared/services/cart-service';
/**
 * Event Detail Component
 * Displays detailed information about an event and allows session ticket selection
 * Manages cart state and synchronization with CartService
 * Uses OnPush change detection for better performance
 *
 * @implements {OnInit}
 */
@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, RouterModule, ShoppingCart],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail implements OnInit {
  /** Injected dependencies */
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private cartService = inject(CartService);

  /** Tracks selected ticket counts for each session */
  private selectionCounts = new BehaviorSubject<Record<number, number>>({});

  /**
   * Observable stream of event information
   * Fetches event details based on route parameter
   * Includes error handling and caching
   */
  eventInfo$ = this.route.paramMap.pipe(
    map((pm) => pm.get('id')!),
    switchMap((id) => this.eventService.getEventInfo(id).pipe(catchError(() => of(null)))),
    shareReplay(1)
  );

  /**
   * Initializes component and syncs with cart state
   * Loads existing selections from cart if present
   *
   * @implements OnInit.ngOnInit
   */
  ngOnInit() {
    combineLatest([this.eventInfo$, this.cartService.getCartEvents()])
      .pipe(
        map(([info, cartEvents]) => {
          if (!info) return;

          const cartEvent = cartEvents.find((ce) => ce.event.id === info.event.id);
          if (cartEvent) {
            const counts = cartEvent.sessions.reduce(
              (acc, session) => {
                acc[session.date] = session.selected;
                return acc;
              },
              {} as Record<number, number>
            );

            this.selectionCounts.next(counts);
          }
        })
      )
      .subscribe();
  }

  /**
   * Observable of sessions with their selection counts
   * Sorts sessions by date and includes selected ticket count
   */
  sessionsWithSelection$: Observable<SessionWithSelection[]> = combineLatest([
    this.eventInfo$,
    this.selectionCounts,
  ]).pipe(
    map(([info, counts]) => {
      if (!info) return [];
      return info.sessions
        .sort((a, b) => a.date - b.date)
        .map((session) => ({
          ...session,
          selected: counts[session.date] || 0,
        }));
    })
  );

  /**
   * Observable of sessions that have tickets selected
   * Used to display items in cart
   */
  cartItems$ = this.sessionsWithSelection$.pipe(
    map((sessions) => sessions.filter((session) => session.selected > 0))
  );

  /**
   * Increments ticket count for a session
   * Checks availability before incrementing
   * Updates cart after modification
   *
   * @param session - Session to increment ticket count for
   */
  increment(session: SessionDetail): void {
    const counts = this.selectionCounts.value;
    const current = counts[session.date] || 0;
    if (current < session.availability) {
      this.selectionCounts.next({ ...counts, [session.date]: current + 1 });
      this.updateCart();
    }
  }

  /**
   * Decrements ticket count for a session
   * Updates cart after modification
   *
   * @param session - Session to decrement ticket count for
   */
  decrement(session: SessionDetail): void {
    const counts = { ...this.selectionCounts.value };
    const current = counts[session.date] || 0;

    if (current > 0) {
      counts[session.date] = current - 1;
      this.selectionCounts.next(counts);
      this.updateCart();
    }
  }

  /**
   * Updates cart with current selections
   * Combines event info with selected sessions
   * @private
   */
  private updateCart(): void {
    combineLatest([this.eventInfo$.pipe(map((info) => info?.event)), this.cartItems$])
      .pipe(take(1))
      .subscribe(([event, items]) => {
        if (event) {
          this.cartService.addOrUpdateEvent(event, items);
        }
      });
  }
}
