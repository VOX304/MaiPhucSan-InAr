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
  imports: [CommonModule, FormsModule, DecimalPipe, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]
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

  isLoading        = false;
  isLoadingSocial  = false;
  isLoadingOrders  = false;
  isLoadingBonus   = false;

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
      next: ({ records, socialTotalEur }) => {
        this.socialRecords = records;
        this.socialTotalEur = socialTotalEur;
        this.isLoadingSocial = false;
      },
      error: () => {
        this.socialRecords = [];
        this.socialTotalEur = 0;
        this.isLoadingSocial = false;
      }
    });
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.api.listOrders(this.employeeId, this.year, false).subscribe({
      next: ({ records, ordersTotalEur }) => {
        this.orders = records;
        this.ordersTotalEur = ordersTotalEur;
        this.isLoadingOrders = false;
      },
      error: () => {
        this.orders = [];
        this.ordersTotalEur = 0;
        this.isLoadingOrders = false;
      }
    });
  }

  loadBonus(): void {
    this.isLoadingBonus = true;
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (bonus) => {
        this.bonus = bonus;
        this.isLoadingBonus = false;
      },
      error: () => {
        this.bonus = null;
        this.isLoadingBonus = false;
      }
    });
  }

  loadQualifications(): void {
    this.api.listQualifications(this.employeeId, this.year).subscribe({
      next: (qualifications) => (this.qualifications = qualifications),
      error: () => (this.qualifications = [])
    });
  }

  async confirmBonus(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title:       'Confirm Bonus',
      message:     'Are you sure you want to confirm the bonus? This action cannot be undone.',
      confirmText: 'Confirm',
      cancelText:  'Cancel'
    });
    if (!confirmed) return;

    this.isLoading = true;
    this.api.confirmBonus(this.employeeId, this.year).subscribe({
      next: () => {
        this.isLoading = false;
        this.notifications.success('Bonus confirmed');
        this.loadBonus();
      },
      error: () => { this.isLoading = false; }
    });
  }
}
