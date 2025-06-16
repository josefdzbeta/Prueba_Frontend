import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventDetail } from '../../shared/models/event-detail.model';
import { EventService } from '../../core/services/event';

/**
 * Event List Component
 * Displays a grid of available events with their basic information
 * Handles routing to individual event details
 * Uses OnPush change detection for better performance
 *
 * @implements {OnInit}
 */
@Component({
  selector: 'app-event-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventList implements OnInit {
  /** Observable stream of events, sorted by end date */
  events$!: Observable<EventDetail[]>;

  /** Flag indicating if a child route is currently active */
  hasRoute = false;

  /** Service for fetching event data */
  private eventService = inject(EventService);

  /**
   * Initializes the component by fetching and sorting events
   * Events are sorted by end date in ascending order
   *
   * @implements OnInit.ngOnInit
   */
  ngOnInit() {
    this.events$ = this.eventService
      .getEvents()
      .pipe(map((evts) => evts.sort((a, b) => a.endDate - b.endDate)));
  }
}
