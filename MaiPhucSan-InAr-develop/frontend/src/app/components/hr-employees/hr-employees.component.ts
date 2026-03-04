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
import { NotificationService } from '../../services/notification.service';
import { Salesman, SocialPerformanceRecord, OrderEvaluationRecord } from '../../models/api-models';

@Component({
  selector: 'app-hr-employees',
  templateUrl: './hr-employees.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule
  ]
})
export class HrEmployeesComponent implements OnInit, OnDestroy {
  salesmen: Salesman[] = [];
  selectedEmployeeId = 'E1001';
  year = new Date().getFullYear();

  isLoadingSalesmen = false;
  isLoadingSocial   = false;
  isLoadingOrders   = false;
  isLoadingOdoo     = false;

  socialRecords: SocialPerformanceRecord[] = [];
  socialTotalEur = 0;

  orders: OrderEvaluationRecord[] = [];
  ordersTotalEur = 0;

  odooEmployees: any[] = [];
  dependencies: any | null = null;

  @ViewChild('bonusChart', { static: false }) bonusChart?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private subs: Subscription[] = [];

  salesmanForm = this.fb.group({
    employeeId:      ['E1003', Validators.required],
    name:            ['New Salesman', Validators.required],
    department:      ['Sales', Validators.required],
    performanceYear: [this.year, Validators.required]
  });

  socialCreateForm = this.fb.group({
    criterionKey:     ['teamwork', Validators.required],
    criterionName:    ['Teamwork', Validators.required],
    targetValue:      [10, Validators.required],
    actualValue:      [8,  Validators.required],
    weight:           [0.25, Validators.required],
    supervisorRating: [4],
    peerRating:       [4],
    remark:           ['']
  });

  socialPatchForm = this.fb.group({
    recordId:         ['', Validators.required],
    targetValue:      [null as number | null],
    actualValue:      [null as number | null],
    weight:           [null as number | null],
    supervisorRating: [null as number | null],
    peerRating:       [null as number | null],
    remark:           ['']
  });

  orderCreateForm = this.fb.group({
    orderId:            ['SO-100', Validators.required],
    productName:        ['Product'],
    clientName:         ['Client'],
    clientRanking:      [3],
    closingProbability: [0.5],
    itemsCount:         [1],
    revenueEur:         [0],
    remark:             ['']
  });

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private notifications: NotificationService
  ) {}

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

  // ── Salesmen ───────────────────────────────────────────────────────────────
  loadSalesmen(): void {
    this.isLoadingSalesmen = true;
    const sub = this.api.listSalesmen().subscribe({
      next: (salesmen) => {
        this.salesmen = salesmen;
        this.isLoadingSalesmen = false;
      },
      error: () => { this.isLoadingSalesmen = false; }
    });
    this.subs.push(sub);
  }

  createSalesman(): void {
    if (this.salesmanForm.invalid) return;
    const payload = this.salesmanForm.value as any;
    const sub = this.api.createSalesman(payload).subscribe({
      next: () => {
        this.notifications.success('Salesman created');
        this.loadSalesmen();
      },
      error: () => {}
    });
    this.subs.push(sub);
  }

  syncSalesman(): void {
    const sub = this.api.syncSalesman(this.selectedEmployeeId, this.year).subscribe({
      next: () => {
        this.notifications.success('Salesman synced from OrangeHRM');
        this.loadSalesmen();
      },
      error: () => {}
    });
    this.subs.push(sub);
  }

  // ── Social Performance ─────────────────────────────────────────────────────
  loadSocial(): void {
    this.isLoadingSocial = true;
    const sub = this.api.listSocial(this.selectedEmployeeId, this.year).subscribe({
      next: ({ records, socialTotalEur }) => {
        this.socialRecords = records;
        this.socialTotalEur = socialTotalEur;
        this.isLoadingSocial = false;
      },
      error: () => { this.isLoadingSocial = false; }
    });
    this.subs.push(sub);
  }

  createSocialRecord(): void {
    if (this.socialCreateForm.invalid) return;
    const v = this.socialCreateForm.value as any;
    const payload: SocialPerformanceRecord = {
      salesmanEmployeeId: this.selectedEmployeeId,
      year:               this.year,
      criterionKey:       v.criterionKey,
      criterionName:      v.criterionName,
      targetValue:        Number(v.targetValue),
      actualValue:        Number(v.actualValue),
      weight:             Number(v.weight),
      supervisorRating:   v.supervisorRating ? Number(v.supervisorRating) : undefined,
      peerRating:         v.peerRating ? Number(v.peerRating) : undefined,
      remark:             v.remark || ''
    };
    const sub = this.api.createSocial(payload).subscribe({
      next: () => {
        this.notifications.success('Social record created');
        this.loadSocial();
      },
      error: () => {}
    });
    this.subs.push(sub);
  }

  patchSocialRecord(): void {
    if (this.socialPatchForm.invalid) return;
    const v = this.socialPatchForm.value as any;
    const patch: any = {};
    if (v.targetValue      != null && v.targetValue      !== '') patch.targetValue      = Number(v.targetValue);
    if (v.actualValue      != null && v.actualValue      !== '') patch.actualValue      = Number(v.actualValue);
    if (v.weight           != null && v.weight           !== '') patch.weight           = Number(v.weight);
    if (v.supervisorRating != null && v.supervisorRating !== '') patch.supervisorRating = Number(v.supervisorRating);
    if (v.peerRating       != null && v.peerRating       !== '') patch.peerRating       = Number(v.peerRating);
    if (v.remark !== undefined) patch.remark = v.remark || '';

    const sub = this.api.patchSocial(v.recordId, patch).subscribe({
      next: () => {
        this.notifications.success('Social record updated');
        this.loadSocial();
      },
      error: () => {}
    });
    this.subs.push(sub);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  loadOrders(refresh: boolean): void {
    this.isLoadingOrders = true;
    const sub = this.api.listOrders(this.selectedEmployeeId, this.year, refresh).subscribe({
      next: ({ records, ordersTotalEur }) => {
        this.orders = records;
        this.ordersTotalEur = ordersTotalEur;
        this.isLoadingOrders = false;
      },
      error: () => { this.isLoadingOrders = false; }
    });
    this.subs.push(sub);
  }

  createOrder(): void {
    if (this.orderCreateForm.invalid) return;
    const v = this.orderCreateForm.value as any;
    const payload: Partial<OrderEvaluationRecord> = {
      salesmanEmployeeId: this.selectedEmployeeId,
      year:               this.year,
      orderId:            v.orderId,
      productName:        v.productName || '',
      clientName:         v.clientName  || '',
      clientRanking:      v.clientRanking      ? Number(v.clientRanking)      : undefined,
      closingProbability: v.closingProbability ? Number(v.closingProbability) : undefined,
      itemsCount:         v.itemsCount         ? Number(v.itemsCount)         : undefined,
      revenueEur:         v.revenueEur         ? Number(v.revenueEur)         : undefined,
      remark:             v.remark || ''
    };
    const sub = this.api.createOrder(payload).subscribe({
      next: () => {
        this.notifications.success('Order record created');
        this.loadOrders(false);
      },
      error: () => {}
    });
    this.subs.push(sub);
  }

  // ── Charts ─────────────────────────────────────────────────────────────────
  loadBonusStatistics(): void {
    const sub = this.api.getBonusStatistics(this.year).subscribe({
      next: (stats) => this.renderBonusChart(stats.items),
      error: () => {}
    });
    this.subs.push(sub);
  }

  private renderBonusChart(items: { employeeId: string; totalBonusEur: number }[]): void {
    if (!this.bonusChart) return;
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.bonusChart.nativeElement, {
      type: 'bar',
      data: {
        labels:   items.map((x) => x.employeeId),
        datasets: [{ label: `Total Bonus EUR (${this.year})`, data: items.map((x) => x.totalBonusEur) }]
      }
    });
  }

  // ── Odoo ───────────────────────────────────────────────────────────────────
  loadOdooEmployees(): void {
    this.isLoadingOdoo = true;
    const sub = this.api.getOdooEmployees(20).subscribe({
      next: (employees) => {
        this.odooEmployees = employees;
        this.isLoadingOdoo = false;
      },
      error: () => { this.isLoadingOdoo = false; }
    });
    this.subs.push(sub);
  }

  // ── Dependencies ──────────────────────────────────────────────────────────
  loadDependencies(): void {
    const sub = this.api.dependenciesHealth().subscribe({
      next: (deps) => (this.dependencies = deps),
      error: () => {}
    });
    this.subs.push(sub);
  }
}
