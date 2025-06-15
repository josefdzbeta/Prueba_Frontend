import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EventDetail } from '../../shared/models/event-detail.model';
import { Event as EventService } from '../../core/event';

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventList implements OnInit {
  events$!: Observable<EventDetail[]>;
  private eventService = inject(EventService);

  ngOnInit() {
    this.events$ = this.eventService
      .getEvents()
      .pipe(map((evts) => evts.sort((a, b) => a.endDate - b.endDate)));
  }
}
