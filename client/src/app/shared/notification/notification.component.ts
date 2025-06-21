import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `<div *ngIf="message" class="notification">{{ message }}</div>`,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  @Input() message: string | null = null;
}
