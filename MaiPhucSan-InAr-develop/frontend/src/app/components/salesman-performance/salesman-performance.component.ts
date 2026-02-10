import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { BonusComputation, Qualification, SocialPerformanceRecord, OrderEvaluationRecord } from '../../models/api-models';

@Component({
    selector: 'app-salesman-performance',
    templateUrl: './salesman-performance.component.html',
    imports: [
        CommonModule,
        FormsModule,
        DecimalPipe,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class SalesmanPerformanceComponent implements OnInit {
  employeeId = '';
  year = new Date().getFullYear();

  socialRecords: SocialPerformanceRecord[] = [];
  socialTotalEur = 0;

  orders: OrderEvaluationRecord[] = [];
  ordersTotalEur = 0;

  bonus: BonusComputation | null = null;
  qualifications: Qualification[] = [];

  // Separate loading flags for better UI feedback
  isLoading = false;
  isLoadingSocial = false;
  isLoadingOrders = false;
  isLoadingBonus = false;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notifications: NotificationService,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.employeeId = this.auth.user?.employeeId || 'E1001';
    this.reloadAll();
  }

  reloadAll(): void {
    this.loadSocial();
    this.loadOrders();
    this.loadBonus();
    this.loadQualifications();
  }

  loadSocial(): void {
    this.isLoadingSocial = true;
    this.api.listSocial(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.socialRecords = res.data.records;
        this.socialTotalEur = res.data.socialTotalEur;
        this.isLoadingSocial = false;
      },
      error: (err) => {
        this.socialRecords = [];
        this.socialTotalEur = 0;
        this.error = err?.error?.error || null;
        this.isLoadingSocial = false;
      }
    });
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.api.listOrders(this.employeeId, this.year, false).subscribe({
      next: (res) => {
        this.orders = res.data.records;
        this.ordersTotalEur = res.data.ordersTotalEur;
        this.isLoadingOrders = false;
      },
      error: (err) => {
        // Orders are optional; ignore errors but surface message
        this.orders = [];
        this.ordersTotalEur = 0;
        this.error = err?.error?.error || null;
        this.isLoadingOrders = false;
      }
    });
  }

  loadBonus(): void {
    this.isLoadingBonus = true;
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.bonus = res.data;
        this.isLoadingBonus = false;
      },
      error: (err) => {
        this.bonus = null;
        this.error = err?.error?.error || null;
        this.isLoadingBonus = false;
      }
    });
  }

  loadQualifications(): void {
    this.api.listQualifications(this.employeeId, this.year).subscribe({
      next: (res) => (this.qualifications = res.data),
      error: () => (this.qualifications = [])
    });
  }

  async confirmBonus(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Confirm Bonus',
      message: 'Are you sure you want to confirm the bonus? This action cannot be undone.',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    this.isLoading = true;
    this.api.confirmBonus(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notifications.success(res.message || 'Bonus confirmed');
        this.loadBonus();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
