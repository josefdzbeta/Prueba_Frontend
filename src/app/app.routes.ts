import { Routes } from '@angular/router';
import { EventList } from './features/event-list/event-list';
import { EventDetail } from './features/event-detail/event-detail';

export const routes: Routes = [
  {
    path: 'catalog',
    component: EventList,
    children: [{ path: 'event/:id', component: EventDetail }],
  },
  { path: '**', redirectTo: 'catalog' },
];
