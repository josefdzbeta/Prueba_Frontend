import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventDetail } from '../shared/models/event-detail.model';
import { SessionDetail } from '../shared/models/session-detail.model';
import { EventInfoResponse } from '../shared/models/event-detail.model';
@Injectable({
  providedIn: 'root',
})
export class Event {
  private base = 'assets/data';

  private http = inject(HttpClient);

  getEvents(): Observable<EventDetail[]> {
    return this.http.get<EventDetail[]>(`${this.base}/events.json`).pipe(
      map((events) =>
        events.map((evt) => ({
          ...evt,
          startDate: Number(evt.startDate),
          endDate: Number(evt.endDate),
        }))
      )
    );
  }

  /**
   * Fetch event details and sessions.
   * event-info.json has a single event object.
   */
  getEventInfo(): Observable<{ event: EventDetail; sessions: SessionDetail[] }> {
    return this.http.get<EventInfoResponse>(`${this.base}/event-info.json`).pipe(
      map((res) => {
        const evt: EventDetail = {
          id: res.event.id,
          title: res.event.title,
          subtitle: res.event.subtitle,
          image: res.event.image,
          place: '',
          startDate: 0,
          endDate: 0,
          description: '',
        };
        const sessions: SessionDetail[] = res.sessions.map((s) => ({
          date: Number(s.date),
          availability: Number(s.availability),
        }));
        return { event: evt, sessions };
      })
    );
  }
}
