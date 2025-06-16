import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { EventService } from '../../core/event';
import { ShoppingCart } from '../../shared/components/shopping-cart/shopping-cart';
import { SessionDetail } from '../../shared/models/session-detail.model';
import { CartService } from '../../shared/services/cart-service';

interface SessionWithSelection extends SessionDetail {
  selected: number;
}

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, RouterModule, ShoppingCart],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private cartService = inject(CartService);
  private selectionCounts = new BehaviorSubject<Record<number, number>>({});

  eventInfo$ = this.route.paramMap.pipe(
    map((pm) => pm.get('id')!),
    switchMap((id) => this.eventService.getEventInfo(id).pipe(catchError(() => of(null)))),
    shareReplay(1)
  );

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

  cartItems$ = this.sessionsWithSelection$.pipe(
    map((sessions) => sessions.filter((session) => session.selected > 0))
  );

  increment(session: SessionDetail): void {
    const counts = this.selectionCounts.value;
    const current = counts[session.date] || 0;
    if (current < session.availability) {
      this.selectionCounts.next({ ...counts, [session.date]: current + 1 });
      this.updateCart();
    }
  }

  decrement(session: SessionDetail): void {
    const counts = { ...this.selectionCounts.value };
    const current = counts[session.date] || 0;

    if (current > 0) {
      counts[session.date] = current - 1;
      this.selectionCounts.next(counts);
      this.updateCart();
    }
  }

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
