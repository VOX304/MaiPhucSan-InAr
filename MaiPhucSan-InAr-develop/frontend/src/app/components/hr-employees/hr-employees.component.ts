import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Chart from 'chart.js/auto';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ApiService } from '../../services/api.service';
import { Salesman, SocialPerformanceRecord, OrderEvaluationRecord } from '../../models/api-models';

@Component({
    selector: 'app-hr-employees',
    templateUrl: './hr-employees.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DecimalPipe,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ]
})
export class HrEmployeesComponent implements OnInit, OnDestroy {
  salesmen: Salesman[] = [];
  selectedEmployeeId = 'E1001';
  year = new Date().getFullYear();
  
  // Loading states
  isLoadingSalesmen = false;
  isLoadingSocial = false;
  isLoadingOrders = false;
  isLoadingOdoo = false;

  socialRecords: SocialPerformanceRecord[] = [];
  socialTotalEur = 0;

  orders: OrderEvaluationRecord[] = [];
  ordersTotalEur = 0;

  odooEmployees: any[] = [];
  dependencies: any | null = null;

  error: string | null = null;

  @ViewChild('bonusChart', { static: false }) bonusChart?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private subs: Subscription[] = [];

  salesmanForm = this.fb.group({
    employeeId: ['E1003', Validators.required],
    name: ['New Salesman', Validators.required],
    department: ['Sales', Validators.required],
    performanceYear: [this.year, Validators.required]
  });

  socialCreateForm = this.fb.group({
    criterionKey: ['teamwork', Validators.required],
    criterionName: ['Teamwork', Validators.required],
    targetValue: [10, Validators.required],
    actualValue: [8, Validators.required],
    weight: [0.25, Validators.required],
    supervisorRating: [4],
    peerRating: [4],
    remark: ['']
  });

  socialPatchForm = this.fb.group({
    recordId: ['', Validators.required],
    targetValue: [null],
    actualValue: [null],
    weight: [null],
    supervisorRating: [null],
    peerRating: [null],
    remark: ['']
  });

  orderCreateForm = this.fb.group({
    orderId: ['SO-100', Validators.required],
    productName: ['Product'],
    clientName: ['Client'],
    clientRanking: [3],
    closingProbability: [0.5],
    itemsCount: [1],
    revenueEur: [0],
    remark: ['']
  });

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadSalesmen();
    this.loadDependencies();
    this.loadSocial();
    this.loadOrders(false);
    this.loadBonusStatistics();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.chart) this.chart.destroy();
  }

  setSelection(employeeId: string): void {
    this.selectedEmployeeId = employeeId;
    this.loadSocial();
    this.loadOrders(false);
  }

  // ------------------------
  // Salesmen
  // ------------------------
  loadSalesmen(): void {
    this.isLoadingSalesmen = true;
    const sub = this.api.listSalesmen().subscribe({
      next: (res) => {
        this.salesmen = res.data;
        this.isLoadingSalesmen = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load salesmen';
        this.isLoadingSalesmen = false;
      }
    });
    this.subs.push(sub);
  }

  createSalesman(): void {
    this.error = null;
    if (this.salesmanForm.invalid) return;

    const payload = this.salesmanForm.value as any;
    const sub = this.api.createSalesman(payload).subscribe({
      next: () => this.loadSalesmen(),
      error: (err) => (this.error = err?.error?.error || 'Create salesman failed')
    });
    this.subs.push(sub);
  }

  syncSalesman(): void {
    this.error = null;
    const sub = this.api.syncSalesman(this.selectedEmployeeId, this.year).subscribe({
      next: () => this.loadSalesmen(),
      error: (err) => (this.error = err?.error?.error || 'Sync from OrangeHRM failed')
    });
    this.subs.push(sub);
  }

  // ------------------------
  // Social Performance
  // ------------------------
  loadSocial(): void {
    this.error = null;
    this.isLoadingSocial = true;
    const sub = this.api.listSocial(this.selectedEmployeeId, this.year).subscribe({
      next: (res) => {
        this.socialRecords = res.data.records;
        this.socialTotalEur = res.data.socialTotalEur;
        this.isLoadingSocial = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Load social records failed';
        this.isLoadingSocial = false;
      }
    });
    this.subs.push(sub);
  }

  createSocialRecord(): void {
    this.error = null;
    if (this.socialCreateForm.invalid) return;

    const v = this.socialCreateForm.value as any;
    const payload: SocialPerformanceRecord = {
      salesmanEmployeeId: this.selectedEmployeeId,
      year: this.year,
      criterionKey: v.criterionKey,
      criterionName: v.criterionName,
      targetValue: Number(v.targetValue),
      actualValue: Number(v.actualValue),
      weight: Number(v.weight),
      supervisorRating: v.supervisorRating ? Number(v.supervisorRating) : undefined,
      peerRating: v.peerRating ? Number(v.peerRating) : undefined,
      remark: v.remark || ''
    };

    const sub = this.api.createSocial(payload).subscribe({
      next: () => this.loadSocial(),
      error: (err) => (this.error = err?.error?.error || 'Create social record failed')
    });
    this.subs.push(sub);
  }

  patchSocialRecord(): void {
    this.error = null;
    if (this.socialPatchForm.invalid) return;

    const v = this.socialPatchForm.value as any;

    const patch: any = {};
    if (v.targetValue !== null && v.targetValue !== undefined && v.targetValue !== '') patch.targetValue = Number(v.targetValue);
    if (v.actualValue !== null && v.actualValue !== undefined && v.actualValue !== '') patch.actualValue = Number(v.actualValue);
    if (v.weight !== null && v.weight !== undefined && v.weight !== '') patch.weight = Number(v.weight);
    if (v.supervisorRating) patch.supervisorRating = Number(v.supervisorRating);
    if (v.peerRating) patch.peerRating = Number(v.peerRating);
    if (v.remark !== undefined) patch.remark = v.remark || '';

    const sub = this.api.patchSocial(v.recordId, patch).subscribe({
      next: () => this.loadSocial(),
      error: (err) => (this.error = err?.error?.error || 'Patch social record failed')
    });
    this.subs.push(sub);
  }

  // ------------------------
  // Orders
  // ------------------------
  loadOrders(refresh: boolean): void {
    this.error = null;
    this.isLoadingOrders = true;
    const sub = this.api.listOrders(this.selectedEmployeeId, this.year, refresh).subscribe({
      next: (res) => {
        this.orders = res.data.records;
        this.ordersTotalEur = res.data.ordersTotalEur;
        this.isLoadingOrders = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Load orders failed';
        this.isLoadingOrders = false;
      }
    });
    this.subs.push(sub);
  }

  createOrder(): void {
    this.error = null;
    if (this.orderCreateForm.invalid) return;

    const v = this.orderCreateForm.value as any;
    const payload: OrderEvaluationRecord = {
      salesmanEmployeeId: this.selectedEmployeeId,
      year: this.year,
      orderId: v.orderId,
      productName: v.productName || '',
      clientName: v.clientName || '',
      clientRanking: v.clientRanking ? Number(v.clientRanking) : undefined,
      closingProbability: v.closingProbability ? Number(v.closingProbability) : undefined,
      itemsCount: v.itemsCount ? Number(v.itemsCount) : undefined,
      revenueEur: v.revenueEur ? Number(v.revenueEur) : undefined,
      remark: v.remark || ''
    };

    const sub = this.api.createOrder(payload).subscribe({
      next: () => this.loadOrders(false),
      error: (err) => (this.error = err?.error?.error || 'Create order failed')
    });
    this.subs.push(sub);
  }

  // ------------------------
  // Charts (N_FR3)
  // ------------------------
  loadBonusStatistics(): void {
    const sub = this.api.getBonusStatistics(this.year).subscribe({
      next: (res) => this.renderBonusChart(res.data.items),
      error: () => {
        // stats are optional; ignore errors (e.g., none computed yet)
      }
    });
    this.subs.push(sub);
  }

  private renderBonusChart(items: { employeeId: string; totalBonusEur: number }[]): void {
    if (!this.bonusChart) return;

    const labels = items.map((x) => x.employeeId);
    const data = items.map((x) => x.totalBonusEur);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.bonusChart.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: `Total Bonus EUR (${this.year})`, data }]
      }
    });
  }

  // ------------------------
  // Odoo (N_FR6)
  // ------------------------
  loadOdooEmployees(): void {
    this.error = null;
    this.isLoadingOdoo = true;
    const sub = this.api.getOdooEmployees(20).subscribe({
      next: (res) => {
        this.odooEmployees = res.data;
        this.isLoadingOdoo = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Fetch Odoo employees failed';
        this.isLoadingOdoo = false;
      }
    });
    this.subs.push(sub);
  }

  // ------------------------
  // Dependencies
  // ------------------------
  loadDependencies(): void {
    const sub = this.api.dependenciesHealth().subscribe({
      next: (res) => (this.dependencies = res.data),
      error: () => {
        // ignore
      }
    });
    this.subs.push(sub);
  }
}
