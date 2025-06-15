import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { EventList } from './features/event-list/event-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, EventList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'event-reservation';
}
