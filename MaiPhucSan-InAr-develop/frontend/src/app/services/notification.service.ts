import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 0;

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(message: string, duration = 3000): void {
    this.add(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.add(message, 'error', duration);
  }

  warning(message: string, duration = 4000): void {
    this.add(message, 'warning', duration);
  }

  info(message: string, duration = 3000): void {
    this.add(message, 'info', duration);
  }

  private add(message: string, type: NotificationType, duration?: number): void {
    const id = `notif_${++this.nextId}`;
    const notification: Notification = { id, message, type, duration };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    if (duration) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }
}
