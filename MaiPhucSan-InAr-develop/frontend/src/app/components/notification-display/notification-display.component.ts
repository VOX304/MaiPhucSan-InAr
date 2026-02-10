import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
    selector: 'app-notification-display',
    template: `
    <div class="notification-container">
      <div *ngFor="let notif of notifications" [class]="'notification notification-' + notif.type" [@fadeInOut]>
        <span>{{ notif.message }}</span>
        <button (click)="close(notif.id)" class="close-btn">&times;</button>
      </div>
    </div>
  `,
    styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      font-size: 14px;
    }

    .notification-success {
      background-color: #4caf50;
      color: white;
    }

    .notification-error {
      background-color: #f44336;
      color: white;
    }

    .notification-warning {
      background-color: #ff9800;
      color: white;
    }

    .notification-info {
      background-color: #2196f3;
      color: white;
    }

    .close-btn {
      background: none;
      border: none;
      color: inherit;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      line-height: 1;
    }

    .close-btn:hover {
      opacity: 0.8;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
    imports: [CommonModule]
})
export class NotificationDisplayComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((notifs) => {
      this.notifications = notifs;
    });
  }

  close(id: string): void {
    this.notificationService.remove(id);
  }
}
