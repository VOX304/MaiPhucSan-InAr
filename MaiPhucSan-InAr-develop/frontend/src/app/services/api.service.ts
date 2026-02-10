import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApiResponse,
  ApiActionResponse,
  Salesman,
  SocialPerformanceRecord,
  SocialRecordsResponse,
  OrderEvaluationRecord,
  OrdersResponse,
  BonusComputation,
  Qualification,
  BonusStatistics,
  DependenciesHealth
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ----------------
  // Salesmen
  // ----------------
  listSalesmen(): Observable<ApiResponse<Salesman[]>> {
    return this.http.get<ApiResponse<Salesman[]>>(`${this.baseUrl}/salesmen`);
  }

  getSalesman(employeeId: string): Observable<ApiResponse<Salesman>> {
    return this.http.get<ApiResponse<Salesman>>(`${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}`);
  }

  createSalesman(payload: Salesman): Observable<ApiResponse<Salesman>> {
    return this.http.post<ApiResponse<Salesman>>(`${this.baseUrl}/salesmen`, payload);
  }

  syncSalesman(employeeId: string, year?: number): Observable<ApiResponse<Salesman>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiResponse<Salesman>>(
      `${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}/sync`,
      {},
      { params }
    );
  }

  consolidatedAll(year?: number): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/salesmen/consolidated`, { params });
  }

  consolidatedOne(employeeId: string, year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/salesmen/${encodeURIComponent(employeeId)}/consolidated`,
      { params }
    );
  }

  // ----------------
  // Social performance
  // ----------------
  listSocial(employeeId: string, year?: number): Observable<ApiResponse<SocialRecordsResponse>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<SocialRecordsResponse>>(
      `${this.baseUrl}/performance/social/${encodeURIComponent(employeeId)}`,
      { params }
    );
  }

  createSocial(record: SocialPerformanceRecord): Observable<ApiActionResponse> {
    return this.http.post<ApiActionResponse>(`${this.baseUrl}/performance/social`, record);
  }

  patchSocial(recordId: string, patch: Partial<SocialPerformanceRecord>): Observable<ApiResponse<SocialPerformanceRecord>> {
    return this.http.patch<ApiResponse<SocialPerformanceRecord>>(
      `${this.baseUrl}/performance/social/records/${encodeURIComponent(recordId)}`,
      patch
    );
  }

  // ----------------
  // Orders
  // ----------------
  listOrders(employeeId: string, year?: number, refresh?: boolean): Observable<ApiResponse<OrdersResponse>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    if (refresh !== undefined) params = params.set('refresh', String(refresh));
    return this.http.get<ApiResponse<OrdersResponse>>(`${this.baseUrl}/orders/${encodeURIComponent(employeeId)}`, {
      params
    });
  }

  createOrder(record: OrderEvaluationRecord): Observable<ApiActionResponse> {
    return this.http.post<ApiActionResponse>(`${this.baseUrl}/orders`, record);
  }

  // ----------------
  // Bonus
  // ----------------
  computeBonus(employeeId: string, year?: number): Observable<ApiResponse<BonusComputation>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiResponse<BonusComputation>>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/compute`,
      {},
      { params }
    );
  }

  getBonus(employeeId: string, year?: number): Observable<ApiResponse<BonusComputation>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<BonusComputation>>(`${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}`, {
      params
    });
  }

  bonusHistory(employeeId: string): Observable<ApiResponse<BonusComputation[]>> {
    return this.http.get<ApiResponse<BonusComputation[]>>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/history`
    );
  }

  addRemark(employeeId: string, text: string, year?: number): Observable<ApiResponse<BonusComputation>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiResponse<BonusComputation>>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/remarks`,
      { text },
      { params }
    );
  }

  approveCeo(employeeId: string, year?: number): Observable<ApiActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/approve/ceo`,
      {},
      { params }
    );
  }

  approveHr(employeeId: string, year?: number): Observable<ApiActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/approve/hr`,
      {},
      { params }
    );
  }

  releaseToSalesman(employeeId: string, year?: number): Observable<ApiActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/release`,
      {},
      { params }
    );
  }

  confirmBonus(employeeId: string, year?: number): Observable<ApiActionResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiActionResponse>(
      `${this.baseUrl}/bonus/${encodeURIComponent(employeeId)}/confirm`,
      {},
      { params }
    );
  }

  // ----------------
  // Qualifications
  // ----------------
  listQualifications(employeeId: string, year?: number): Observable<ApiResponse<Qualification[]>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<Qualification[]>>(
      `${this.baseUrl}/qualifications/${encodeURIComponent(employeeId)}`,
      { params }
    );
  }

  createQualification(
    employeeId: string,
    payload: { year: number; title: string; description?: string; storeInOrangeHrm?: boolean }
  ): Observable<ApiActionResponse> {
    return this.http.post<ApiActionResponse>(
      `${this.baseUrl}/qualifications/${encodeURIComponent(employeeId)}`,
      payload
    );
  }

  // ----------------
  // Statistics / Charts
  // ----------------
  getBonusStatistics(year?: number): Observable<ApiResponse<BonusStatistics>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<ApiResponse<BonusStatistics>>(`${this.baseUrl}/statistics/bonus`, { params });
  }

  // ----------------
  // Dependencies / Health
  // ----------------
  dependenciesHealth(): Observable<ApiResponse<DependenciesHealth>> {
    return this.http.get<ApiResponse<DependenciesHealth>>(`${this.baseUrl}/integration/health`);
  }

  // ----------------
  // Odoo
  // ----------------
  getOdooEmployees(limit?: number): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', String(limit));
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/odoo/employees`, { params });
  }

  // ----------------
  // Camunda workflow
  // ----------------
  startWorkflow(employeeId: string, year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/workflow/bonus/${encodeURIComponent(employeeId)}/start`,
      {},
      { params }
    );
  }

  listWorkflowTasks(processInstanceId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/workflow/process/${encodeURIComponent(processInstanceId)}/tasks`
    );
  }

  completeWorkflowTask(taskId: string, variables: any = {}): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/workflow/tasks/${encodeURIComponent(taskId)}/complete`, {
      variables
    });
  }
}
