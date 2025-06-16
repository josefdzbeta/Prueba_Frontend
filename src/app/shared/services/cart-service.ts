import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventDetail } from '../models/event-detail.model';
import { SessionDetail } from '../models/session-detail.model';
import { CartEvent } from '../models/cart-event.model';

/**
 * Key used for storing cart events in localStorage
 */
const CART_STORAGE_KEY = 'cart_events';

/**
 * Service for managing shopping cart state and persistence
 * Handles adding, updating, and removing events and their sessions from the cart
 * Persists cart state to localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  /** BehaviorSubject holding the current cart events state */
  private cartEvents = new BehaviorSubject<CartEvent[]>(this.loadFromStorage());

  /**
   * Initializes the cart service and sets up storage synchronization
   * Subscribes to cart changes to persist updates to localStorage
   */
  constructor() {
    this.cartEvents.subscribe((events) => {
      const filteredEvents = events.filter(
        (event) => event.sessions && event.sessions.some((session) => session.selected > 0)
      );
      this.saveToStorage(filteredEvents);
    });
  }

  /**
   * Loads cart events from localStorage
   * @returns Array of cart events or empty array if storage is empty/invalid
   * @private
   */
  private loadFromStorage(): CartEvent[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves cart events to localStorage
   * @param events Cart events to persist
   * @private
   */
  private saveToStorage(events: CartEvent[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  /**
   * Gets an observable of the current cart events
   * @returns Observable<CartEvent[]> Current cart events
   */
  getCartEvents() {
    return this.cartEvents.asObservable();
  }

  /**
   * Adds or updates an event and its sessions in the cart
   * @param event Event details to add/update
   * @param sessions Array of sessions with selection counts
   */
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

  /**
   * Removes one occurrence of a session from an event in the cart
   * If session count reaches 0, removes the session
   * If event has no sessions left, removes the event
   * @param eventId ID of the event to update
   * @param sessionDate Date of the session to remove
   */
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
