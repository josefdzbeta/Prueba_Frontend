import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventDetail } from '../models/event-detail.model';
import { SessionDetail } from '../models/session-detail.model';
import { CartEvent } from '../models/cart-event.model';
const CART_STORAGE_KEY = 'cart_events';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartEvents = new BehaviorSubject<CartEvent[]>(this.loadFromStorage());

  constructor() {
    this.cartEvents.subscribe((events) => {
      const filteredEvents = events.filter(
        (event) => event.sessions && event.sessions.some((session) => session.selected > 0)
      );
      this.saveToStorage(filteredEvents);
    });
  }

  private loadFromStorage(): CartEvent[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(events: CartEvent[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  getCartEvents() {
    return this.cartEvents.asObservable();
  }

  addOrUpdateEvent(event: EventDetail, sessions: (SessionDetail & { selected: number })[]) {
    const currentEvents = this.cartEvents.getValue();
    const filteredSessions = sessions.filter((s) => s.selected > 0);
    const eventIndex = currentEvents.findIndex((item) => item.event.id === event.id);

    if (eventIndex >= 0) {
      if (filteredSessions.length === 0) {
        currentEvents.splice(eventIndex, 1);
      } else {
        currentEvents[eventIndex] = { event, sessions: filteredSessions };
      }
    } else if (filteredSessions.length > 0) {
      currentEvents.push({ event, sessions: filteredSessions });
    }

    this.cartEvents.next(currentEvents);
  }

  removeFromCart(eventId: string, sessionDate: number) {
    const currentEvents = [...this.cartEvents.getValue()];
    const eventIndex = currentEvents.findIndex((item) => item.event.id === eventId);

    if (eventIndex >= 0) {
      const event = { ...currentEvents[eventIndex] };
      const sessions = [...event.sessions];
      const sessionIndex = sessions.findIndex((s) => s.date === sessionDate);

      if (sessionIndex >= 0) {
        const updatedSession = {
          ...sessions[sessionIndex],
          selected: sessions[sessionIndex].selected - 1,
        };

        if (updatedSession.selected > 0) {
          sessions[sessionIndex] = updatedSession;
          currentEvents[eventIndex] = { ...event, sessions };
        } else {
          sessions.splice(sessionIndex, 1);
          if (sessions.length > 0) {
            currentEvents[eventIndex] = { ...event, sessions };
          } else {
            currentEvents.splice(eventIndex, 1);
          }
        }

        this.cartEvents.next([...currentEvents]);
      }
    }
  }
}
