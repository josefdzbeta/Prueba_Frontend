/*
* Session Model
* This model represents a session within an event, including its date, availability, and selected seats.
*/
export interface SessionDetail{
  date: number;
  availability: number;
  selected?: number;
}
