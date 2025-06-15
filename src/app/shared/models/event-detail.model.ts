/*
  Event Detail Model
  This model represents the detailed information of an event, including its ID, title, subtitle, image, place, start and end dates, and description.
*/
export interface EventDetail {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  place: string;
  startDate: number;
  endDate: number;
  description: string;
}

/*
  Event Info Response Model
  This model represents the structure of the response received when fetching event details and sessions.
*/
export interface EventInfoResponse {
  event: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
  };
  sessions: { date: string; availability: string }[];
}
