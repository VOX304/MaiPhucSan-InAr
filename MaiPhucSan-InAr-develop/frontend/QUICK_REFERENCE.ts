/**
 * FRONTEND QUICK REFERENCE
 * Copy-paste templates for common component patterns
 */

// ============================================
// PATTERN 1: Simple Data List Component
// ============================================
/*
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-my-list',
  templateUrl: './my-list.component.html'
})
export class MyListComponent implements OnInit {
  items: any[] = [];
  isLoading = false;

  constructor(private api: ApiService, private notifications: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.api.listItems().subscribe({
      next: (res) => {
        this.items = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.items = [];
        this.isLoading = false;
      }
    });
  }

  refresh(): void {
    this.load();
  }
}
*/

// ============================================
// PATTERN 2: Form Component with Dialog
// ============================================
/*
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-my-form',
  templateUrl: './my-form.component.html'
})
export class MyFormComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialog: DialogService,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      year: [new Date().getFullYear(), Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.notifications.warning('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    this.api.createItem(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notifications.success(res.message);
        this.form.reset();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
*/

// ============================================
// PATTERN 3: Destructive Action with Confirmation
// ============================================
/*
async deleteItem(id: string): Promise<void> {
  const confirmed = await this.dialog.confirm({
    title: 'Delete Item',
    message: `Are you sure you want to delete this item? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDestructive: true
  });

  if (!confirmed) return;

  this.isLoading = true;
  this.api.deleteItem(id).subscribe({
    next: (res) => {
      this.isLoading = false;
      this.notifications.success(res.message || 'Item deleted');
      this.reload();
    },
    error: () => {
      this.isLoading = false;
    }
  });
}
*/

// ============================================
// PATTERN 4: State-Changing Action (Approve/Confirm)
// ============================================
/*
async approveItem(id: string): Promise<void> {
  const confirmed = await this.dialog.confirm({
    title: 'Approve Request',
    message: 'Are you sure you want to approve this request?',
    confirmText: 'Approve',
    cancelText: 'Cancel'
  });

  if (!confirmed) return;

  this.isLoading = true;
  this.api.approveItem(id).subscribe({
    next: (res) => {
      this.isLoading = false;
      this.notifications.success(res.message);
      this.currentStatus = res.status; // Update local state
    },
    error: () => {
      this.isLoading = false;
    }
  });
}
*/

// ============================================
// PATTERN 5: Template with Loading & Error States
// ============================================
/*
<app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

<app-error-display 
  [error]="error" 
  [onRetry]="load.bind(this)"
  [onDismiss]="() => error = null">
</app-error-display>

<mat-card *ngIf="items.length > 0">
  <mat-card-title>Items</mat-card-title>
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <span>{{ item.name }}</span>
      <button mat-icon-button (click)="delete(item._id)">
        <mat-icon>delete</mat-icon>
      </button>
    </mat-list-item>
  </mat-list>
</mat-card>

<mat-card *ngIf="items.length === 0 && !isLoading">
  <p>No items found</p>
  <button mat-raised-button (click)="refresh()">Refresh</button>
</mat-card>
*/

// ============================================
// SERVICE INJECTION CHEATSHEET
// ============================================
/*
// Notifications
this.notifications.success('Saved!');
this.notifications.error('Failed!');
this.notifications.warning('Check this');
this.notifications.info('FYI...');

// Dialogs
const confirmed = await this.dialog.confirm({
  title: 'Confirm',
  message: 'Are you sure?'
});

// API calls
this.api.listItems().subscribe({ next, error });
this.api.createItem(data).subscribe({ next, error });

// Intercept errors automatically:
// - Error messages shown via NotificationService
// - 401 errors trigger logout
// - No manual error handling needed
*/

// ============================================
// RESPONSE TYPES CHEATSHEET
// ============================================
/*
// GET endpoints - data inside wrapper
Observable<ApiResponse<T>> → res.data : T

Example:
  listItems() → Observable<ApiResponse<Item[]>>
  use: res.data  (which is Item[])

// POST/PATCH endpoints - simplified response
Observable<ApiActionResponse> → res.id, res.message, res.status?

Example:
  createItem() → Observable<ApiActionResponse>
  use: res.id (string)
  use: res.message (string - already shown by interceptor)
  use: res.status (string - for state tracking)
*/

// ============================================
// COMPONENT CHECKLIST
// ============================================
/*
When creating a new component:

[ ] Import ApiService, NotificationService, DialogService
[ ] Create isLoading: boolean for request state
[ ] Use Observable subscriptions with next/error callbacks
[ ] Show LoadingSpinnerComponent during requests
[ ] Use DialogService for confirmations
[ ] Let AuthInterceptor handle error notifications
[ ] Extract res.data for GET endpoints
[ ] Extract res.message for POST success feedback
[ ] Reset loading state in error callback (use finally)
[ ] No manual error messages in template
[ ] Add mat-card/mat-list for structure
[ ] Use *ngIf for conditional rendering
[ ] Include refresh button for data loads
*/

export const QUICK_REFERENCE = 'See this file for copy-paste templates';
