import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BonusComputation, Qualification, SocialPerformanceRecord, OrderEvaluationRecord } from '../../models/api-models';

@Component({
  selector: 'app-salesman-performance',
  templateUrl: './salesman-performance.component.html'
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

  error: string | null = null;

  constructor(private api: ApiService, private auth: AuthService) {}

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
    this.api.listSocial(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.socialRecords = res.data.records;
        this.socialTotalEur = res.data.socialTotalEur;
      },
      error: (err) => (this.error = err?.error?.error || 'Load social records failed')
    });
  }

  loadOrders(): void {
    this.api.listOrders(this.employeeId, this.year, false).subscribe({
      next: (res) => {
        this.orders = res.data.records;
        this.ordersTotalEur = res.data.ordersTotalEur;
      },
      error: () => {
        // Orders are optional; ignore errors if not implemented / not configured
      }
    });
  }

  loadBonus(): void {
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (res) => (this.bonus = res.data),
      error: () => (this.bonus = null)
    });
  }

  loadQualifications(): void {
    this.api.listQualifications(this.employeeId, this.year).subscribe({
      next: (res) => (this.qualifications = res.data),
      error: () => (this.qualifications = [])
    });
  }

  confirmBonus(): void {
    this.error = null;
    this.api.confirmBonus(this.employeeId, this.year).subscribe({
      next: (res) => (this.bonus = res.data),
      error: (err) => (this.error = err?.error?.error || 'Confirm failed')
    });
  }
}
