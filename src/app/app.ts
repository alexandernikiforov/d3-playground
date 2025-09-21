import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'd3p-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App {
  protected readonly title = signal('d3-playground');
}
