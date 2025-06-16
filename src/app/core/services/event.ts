import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionDetail } from '../../shared/models/session-detail.model';
import { EventDetail } from '../../shared/models/event-detail.model';
import { EventInfoResponse } from '../../shared/models/event-detail.model';

/**
 * Service responsible for fetching event data from the backend
 * Handles data transformation and provides event information to components
 *
 * @injectable Provided at root level
 */
@Injectable({
  providedIn: 'root',
})
export class EventService {
  /** Base path for data assets */
  private base = 'assets/data';

  /** HTTP Client for making API requests */
  private http = inject(HttpClient);

  /**
   * Fetches all available events
   * Transforms date strings to numbers for consistency
   *
   * @returns {Observable<EventDetail[]>} Array of event details with parsed dates
   */
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
   * Fetches detailed information for a specific event including its sessions
   * Transforms string dates and availability to numbers
   * Calculates event start/end dates from session dates
   *
   * @param {string} eventId - ID of the event to fetch
   * @returns {Observable<{event: EventDetail; sessions: SessionDetail[]}>} Event details and sessions
   */
  getEventInfo(eventId: string): Observable<{ event: EventDetail; sessions: SessionDetail[] }> {
    return this.http.get<EventInfoResponse>(`${this.base}/event-info-${eventId}.json`).pipe(
      map((res) => {
        // Transform session data
        const sessions = res.sessions.map((s) => ({
          date: Number(s.date),
          availability: Number(s.availability),
        }));

        // Calculate event dates from sessions
        const dates = sessions.map((s) => s.date);
        const startDate = Math.min(...dates);
        const endDate = Math.max(...dates);

        // Construct full event object
        const evt: EventDetail = {
          id: res.event.id,
          title: res.event.title,
          subtitle: res.event.subtitle,
          image: res.event.image,
          place: '—',
          startDate: startDate,
          endDate: endDate,
          description: '',
        };

        return { event: evt, sessions };
      })
    );
  }
}
