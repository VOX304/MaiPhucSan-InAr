import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div *ngIf="hasError" class="error-container">
      <div class="error-content">
        <h3 class="error-title">⚠️ Something went wrong</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <details *ngIf="errorDetails" class="error-details">
          <summary>Error Details</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
        <button mat-raised-button color="primary" (click)="retry()" class="retry-btn">
          Try Again
        </button>
        <button mat-button (click)="goHome()" class="home-btn">
          Go to Home
        </button>
      </div>
    </div>
    <div *ngIf="!hasError">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      padding: 20px;
      background: #f5f5f5;
    }

    .error-content {
      background: white;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      padding: 24px;
      max-width: 600px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .error-title {
      color: #d32f2f;
      margin: 0 0 12px 0;
      font-size: 20px;
    }

    .error-message {
      color: #666;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .error-details {
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
    }

    .error-details summary {
      font-weight: 500;
      color: #666;
    }

    .error-details pre {
      margin: 12px 0 0 0;
      padding: 12px;
      background: white;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      color: #d32f2f;
    }

    .retry-btn, .home-btn {
      margin-right: 8px;
    }
  `]
})
export class ErrorBoundaryComponent {
  @Input() errorMessage = 'An error occurred. Please try again.';
  @Input() errorDetails: string | null = null;
  
  hasError = false;

  setError(message: string, details?: string) {
    this.errorMessage = message;
    this.errorDetails = details || null;
    this.hasError = true;
  }

  clearError() {
    this.hasError = false;
    this.errorMessage = 'An error occurred. Please try again.';
    this.errorDetails = null;
  }

  retry() {
    this.clearError();
    window.location.reload();
  }

  goHome() {
    window.location.href = '/';
  }
}
