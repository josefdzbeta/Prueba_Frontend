import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Event as EventService } from '../../../core/event';
import { EventDetail } from '../../models/event-detail.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Input } from '@angular/core';
@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart {
  private service = inject(EventService);
  @Input() event!: EventDetail;
  @Input() items: any[] = []; //eslint-disable-line @typescript-eslint/no-explicit-any
  events = toSignal(
    this.service.getEvents().pipe(map((evts) => evts.sort((a, b) => a.endDate - b.endDate))),
    { initialValue: [] as EventDetail[] }
  );
}
