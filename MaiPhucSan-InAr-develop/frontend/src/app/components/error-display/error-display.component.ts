import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-error-display',
    template: `
    <mat-card *ngIf="error" class="error-card">
      <mat-card-header>
        <mat-card-title>Error</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p class="error-message">{{ error }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="onRetry()">Retry</button>
        <button mat-button (click)="onDismiss()">Dismiss</button>
      </mat-card-actions>
    </mat-card>
  `,
    styles: [`
    .error-card {
      margin: 16px 0;
      border-left: 4px solid #f44336;
    }

    .error-message {
      color: #d32f2f;
      margin: 0;
      font-size: 14px;
    }

    mat-card-actions {
      padding: 16px;
      margin: 0;
      display: flex;
      gap: 8px;
    }
  `],
    imports: [CommonModule, MatCardModule, MatButtonModule]
})
export class ErrorDisplayComponent {
  @Input() error: string | null = null;
  @Input() onRetry: () => void = () => {};
  @Input() onDismiss: () => void = () => {};
}
