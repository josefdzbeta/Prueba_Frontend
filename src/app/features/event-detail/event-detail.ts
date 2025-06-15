import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { BehaviorSubject, combineLatest, of, Observable } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { Event as EventService } from '../../core/event';
import { ShoppingCart } from '../../shared/components/shopping-cart/shopping-cart';
import {
  EventDetail as EventDetailModel,
} from '../../shared/models/event-detail.model';
import { SessionDetail } from '../../shared/models/session-detail.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ShoppingCart],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  eventInfo$: Observable<{ event: EventDetailModel; sessions: SessionDetail[] } | null> =
    this.route.paramMap.pipe(
      map((pm) => pm.get('id')!),
      switchMap((id) => this.eventService.getEventInfo(id).pipe(catchError(() => of(null)))),
      shareReplay(1)
    );

  sessions$: Observable<SessionDetail[]> = this.eventInfo$.pipe(
    map((info) => (info ? info.sessions.slice().sort((a, b) => a.date - b.date) : []))
  );

  private selectionCounts = new BehaviorSubject<Record<number, number>>({});

  sessionsWithSelection$ = combineLatest([this.sessions$, this.selectionCounts]).pipe(
    map(([sessions, counts]) =>
      sessions.map((session) => ({
        ...session,
        selected: counts[session.date] || 0,
      }))
    )
  );

  cartItems$ = this.sessionsWithSelection$.pipe(map((list) => list.filter((session) => session.selected > 0)));

  increment(session: SessionDetail) {
    const counts = this.selectionCounts.value;
    const current = counts[session.date] || 0;
    if (current < session.availability) {
      this.selectionCounts.next({ ...counts, [session.date]: current + 1 });
    }
  }

  decrement(session: SessionDetail) {
    const counts = { ...this.selectionCounts.value };
    const current = counts[session.date] || 0;
    if (current > 1) {
      counts[session.date] = current - 1;
    } else if (current === 1) {
      delete counts[session.date];
    }
    this.selectionCounts.next(counts);
  }

}
