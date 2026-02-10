import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * Helper utility for handling form submissions with consistent patterns.
 */
@Injectable({ providedIn: 'root' })
export class FormSubmitHelper {
  constructor(private notifications: NotificationService) {}

  /**
   * Wrapper for form submission handlers.
   * Handles loading state, error notifications, and success feedback.
   * 
   * Usage:
   *   async onSubmit(formData: any): Promise<void> {
   *     await this.submitHelper.handle(
   *       () => this.api.create(formData),
   *       'Record created successfully',
   *       () => { this.closeForm(); this.reload(); }
   *     );
   *   }
   */
  async handle(
    apiCall: () => any,
    successMessage: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      const result = await apiCall();
      this.notifications.success(successMessage);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  }

  /**
   * Validate form field.
   */
  validateRequired(value: any): string | null {
    return !value || (typeof value === 'string' && value.trim() === '') 
      ? 'This field is required' 
      : null;
  }

  /**
   * Validate email format.
   */
  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email) ? 'Invalid email format' : null;
  }

  /**
   * Validate number range.
   */
  validateRange(value: number, min: number, max: number): string | null {
    if (value < min || value > max) {
      return `Value must be between ${min} and ${max}`;
    }
    return null;
  }
}
