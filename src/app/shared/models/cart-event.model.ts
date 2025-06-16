import { EventDetail } from './event-detail.model';
import { SessionDetail } from './session-detail.model';

export interface CartEvent {
  event: EventDetail;
  sessions: (SessionDetail & { selected: number })[];
}
