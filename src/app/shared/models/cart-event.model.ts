import { EventDetail } from './event-detail.model';
import { SessionDetail } from './session-detail.model';

/**
 * Represents an event in the shopping cart, including its details and selected sessions.
 */
export interface CartEvent {
  event: EventDetail;
  sessions: (SessionDetail & { selected: number })[];
}
