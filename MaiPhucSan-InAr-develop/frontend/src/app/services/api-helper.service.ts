import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

/**
 * Helper service for common API operation patterns with notifications.
 */
@Injectable({ providedIn: 'root' })
export class ApiHelperService {
  constructor(private notifications: NotificationService) {}

  /**
   * Execute an API call with automatic success notification.
   */
  withSuccessNotification<T>(
    operation: Observable<any>,
    message = 'Operation successful'
  ): Observable<T> {
    return operation.pipe(
      tap(() => {
        this.notifications.success(message);
      })
    );
  }

  /**
   * Execute an API call with automatic error notification.
   */
  withErrorNotification<T>(
    operation: Observable<T>,
    errorMessage = 'Operation failed'
  ): Observable<T> {
    return operation.pipe(
      tap({
        error: () => {
          this.notifications.error(errorMessage);
        }
      })
    );
  }

  /**
   * Combine success and error notifications.
   */
  withNotifications<T>(
    operation: Observable<any>,
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed'
  ): Observable<T> {
    return operation.pipe(
      tap(
        () => {
          this.notifications.success(successMessage);
        },
        () => {
          this.notifications.error(errorMessage);
        }
      )
    );
  }
}
