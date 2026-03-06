import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Salesman,
  SocialPerformanceRecord,
  OrderEvaluationRecord,
  BonusComputation,
  Qualification,
  BonusStatistics,
  DependenciesHealth
} from '../models/api-models';

// ─── Shapes the backend actually returns ────────────────────────────────────

export interface SocialListResponse {
  records: SocialPerformanceRecord[];
  socialTotalEur: number;
}

export interface OrdersListResponse {
  records: OrderEvaluationRecord[];
  ordersTotalEur: number;
}

export interface BonusActionResponse {
  employeeId?: string;
  year?: number;
  status?: string;
  totalBonus?: number;
  socialTotal?: number;
  ordersTotal?: number;
  computedAt?: string;
  computedBy?: string;
  remarks?: any[];
  // approval responses
  approvedBy?: string;
  approvedAt?: string;
  hrApproved?: boolean;
  released?: boolean;
  releasedAt?: string;
  confirmed?: boolean;
  confirmedAt?: string;
  // remark response
  remark?: string;
  addedBy?: string;
  // error
  error?: string;
  message?: string;
}

export interface WorkflowStartResponse {
  processInstanceId: string;
  taskId?: string;
  stub?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ── Salesmen ──────────────────────────────────────────────────────────────
  // Backend: GET /salesmen → Salesman[]  (flat array, no wrapper)
  listSalesmen(): Observable<Salesman[]> {
    return this.http.get<Salesman[]>(`${this.baseUrl}/salesmen`);
  }

  getSalesman(employeeId: string): Observable<Salesman> {
    return this.http.get<Salesman>(`${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}`);
  }

  createSalesman(payload: Partial<Salesman>): Observable<Salesman> {
    return this.http.post<Salesman>(`${this.baseUrl}/salesmen`, payload);
  }

  syncSalesman(employeeId: string, year?: number): Observable<Salesman> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<Salesman>(
      `${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}/sync`,
      {},
      { params }
    );
  }

  consolidatedAll(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<any[]>(`${this.baseUrl}/salesmen/consolidated`, { params });
  }

  consolidatedOne(employeeId: string, year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<any>(
      `${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}/consolidated`,
      { params }
    );
  }

  // ── Social performance ────────────────────────────────────────────────────
  // Backend: GET /performance/social/:id → SocialPerformanceRecord[]  (flat array)
  // We adapt it to { records, socialTotalEur } so components don't change.
  listSocial(employeeId: string, year?: number): Observable<SocialListResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http
      .get<SocialPerformanceRecord[]>(
        `${this.baseUrl}/performance/social/${encodeURIComponent(employeeId)}`,
        { params }
      )
      .pipe(
        map((raw: any[]) => {
          const records: SocialPerformanceRecord[] = raw.map((r) => ({
            _id:                r._id,
            salesmanEmployeeId: r.salesmanEmployeeId ?? '',
            year:               r.year ?? 0,
            // backend formatRecord() returns 'criterion' not 'criterionName'
            criterionKey:       r.criterionKey  ?? r.criterion ?? '',
            criterionName:      r.criterionName ?? r.criterion ?? '',
            targetValue:        r.targetValue   ?? 0,
            actualValue:        r.actualValue   ?? 0,
            weight:             r.weight        ?? undefined,
            supervisorRating:   r.supervisorRating ?? undefined,
            peerRating:         r.peerRating       ?? undefined,
            // backend formatRecord() returns 'bonus' not 'computedBonusEur'
            computedBonusEur:   r.computedBonusEur ?? r.bonus ?? 0,
            remark:             r.remark ?? ''
          }));
          return {
            records,
            socialTotalEur: records.reduce((sum, r) => sum + (r.computedBonusEur ?? 0), 0)
          };
        })
      );
  }

  createSocial(record: SocialPerformanceRecord): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/performance/social`, record);
  }

  patchSocial(recordId: string, patch: Partial<SocialPerformanceRecord>): Observable<SocialPerformanceRecord> {
    return this.http.patch<SocialPerformanceRecord>(
      `${this.baseUrl}/performance/social/records/${encodeURIComponent(recordId)}`,
      patch
    );
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  // Backend: GET /orders/:id → OrderEvaluationRecord[]  (flat array)
  // We adapt to { records, ordersTotalEur }.
  listOrders(employeeId: string, year?: number, refresh?: boolean): Observable<OrdersListResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    if (refresh !== undefined) params = params.set('refresh', String(refresh));
    return this.http
      .get<OrderEvaluationRecord[]>(`${this.baseUrl}/orders/${encodeURIComponent(employeeId)}`, { params })
      .pipe(
        map((records) => ({
          records,
          // backend field is computedBonusEur on each record; orders list uses `bonus` field name
          ordersTotalEur: records.reduce(
            (sum, r) => sum + ((r as any).bonus ?? r.computedBonusEur ?? 0),
            0
          )
        }))
      );
  }

  createOrder(record: Partial<OrderEvaluationRecord>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, record);
  }

  // ── Bonus ────────────────────────────────────────────────────────────────
  // Backend: POST/GET bonus endpoints → flat BonusComputation-like object (no data wrapper)
  computeBonus(employeeId: string, year?: number): Observable<BonusComputation> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http
      .post<any>(
        `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/compute`,
        {},
        { params }
      )
      .pipe(map((r) => this.normalizeBonusDoc(r)));
  }

  getBonus(employeeId: string, year?: number): Observable<BonusComputation> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http
      .get<any>(`${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}`, { params })
      .pipe(map((r) => this.normalizeBonusDoc(r)));
  }

  bonusHistory(employeeId: string): Observable<BonusComputation[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/history`)
      .pipe(map((arr) => arr.map((r) => this.normalizeBonusDoc(r))));
  }

  addRemark(employeeId: string, text: string, year?: number): Observable<BonusActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<BonusActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/remarks`,
      { remark: text },
      { params }
    );
  }

  approveCeo(employeeId: string, year?: number): Observable<BonusActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<BonusActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/approve/ceo`,
      {},
      { params }
    );
  }

  approveHr(employeeId: string, year?: number): Observable<BonusActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<BonusActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/approve/hr`,
      {},
      { params }
    );
  }

  releaseToSalesman(employeeId: string, year?: number): Observable<BonusActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<BonusActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/release`,
      {},
      { params }
    );
  }

  confirmBonus(employeeId: string, year?: number): Observable<BonusActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<BonusActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/confirm`,
      {},
      { params }
    );
  }

  // ── Qualifications ────────────────────────────────────────────────────────
  // Backend: GET /qualifications/:id → { _id, name, issuedBy, year }[]
  listQualifications(employeeId: string, year?: number): Observable<Qualification[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http
      .get<any[]>(`${this.baseUrl}/qualifications/${encodeURIComponent(employeeId)}`, { params })
      .pipe(
        // Backend returns { _id, name, issuedBy, year } — map to Qualification shape
        map((items) =>
          items.map((i) => ({
            _id:                i._id,
            salesmanEmployeeId: employeeId,
            year:               i.year,
            title:              i.name ?? i.title ?? '',
            description:        i.issuedBy ?? i.description ?? '',
            storedInOrangeHrmAt: i.storedInOrangeHrmAt ?? null
          }))
        )
      );
  }

  createQualification(
    employeeId: string,
    payload: { year: number; title: string; description?: string; storeInOrangeHrm?: boolean }
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/qualifications/${encodeURIComponent(employeeId)}`,
      payload
    );
  }

  // ── Statistics ────────────────────────────────────────────────────────────
  // Backend: GET /statistics/bonus → { data: { year, items } }
  getBonusStatistics(year?: number): Observable<BonusStatistics> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http
      .get<{ data: BonusStatistics }>(`${this.baseUrl}/statistics/bonus`, { params })
      .pipe(map((r) => r.data));
  }

  // ── Dependencies / Health ─────────────────────────────────────────────────
  // Backend: GET /integration/health → { data: { orangehrm, opencrx, mongodb, camunda } }
  dependenciesHealth(): Observable<DependenciesHealth> {
    return this.http
      .get<{ data: DependenciesHealth }>(`${this.baseUrl}/integration/health`)
      .pipe(map((r) => r.data));
  }

  // ── Odoo ──────────────────────────────────────────────────────────────────
  // Backend: GET /odoo/employees → any[]  (flat array or 503)
  getOdooEmployees(limit?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', String(limit));
    return this.http.get<any[]>(`${this.baseUrl}/odoo/employees`, { params });
  }

  // ── Camunda workflow ──────────────────────────────────────────────────────
  // Backend: POST .../start → { processInstanceId, taskId?, stub? }
  startWorkflow(employeeId: string, year?: number): Observable<WorkflowStartResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<WorkflowStartResponse>(
      `${this.baseUrl}/workflow/bonus/${encodeURIComponent(employeeId)}/start`,
      {},
      { params }
    );
  }

  listWorkflowTasks(processInstanceId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/workflow/process/${encodeURIComponent(processInstanceId)}/tasks`
    );
  }

  completeWorkflowTask(taskId: string, variables: any = {}): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/workflow/tasks/${encodeURIComponent(taskId)}/complete`,
      { variables }
    );
  }

  // ── Normalizer ────────────────────────────────────────────────────────────
  // Backend bonus endpoints return { totalBonus, socialTotal, ordersTotal }
  // Frontend models use { totalBonusEur, socialTotalEur, ordersTotalEur }
  private normalizeBonusDoc(r: any): BonusComputation {
    return {
      _id:               r._id,
      salesmanEmployeeId: r.employeeId ?? r.salesmanEmployeeId,
      year:              r.year,
      status:            r.status,
      totalBonusEur:     r.totalBonus   ?? r.totalBonusEur   ?? 0,
      socialTotalEur:    r.socialTotal  ?? r.socialTotalEur  ?? 0,
      ordersTotalEur:    r.ordersTotal  ?? r.ordersTotalEur  ?? 0,
      computedAt:        r.computedAt,
      computedBy:        r.computedBy,
      remarks:           r.remarks ?? []
    };
  }
}
