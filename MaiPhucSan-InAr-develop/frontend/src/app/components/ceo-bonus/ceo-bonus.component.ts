import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ApiService, WorkflowStartResponse } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { BonusComputation, Salesman } from '../../models/api-models';

@Component({
  selector: 'app-ceo-bonus',
  templateUrl: './ceo-bonus.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule
  ]
})
export class CeoBonusComponent implements OnInit, OnDestroy {
  salesmen: Salesman[] = [];
  employeeId = '';
  year = new Date().getFullYear();

  bonus: BonusComputation | null = null;
  workflow: WorkflowStartResponse | null = null;
  workflowTasks: any[] = [];

  isLoadingSalesmen  = false;
  isLoading          = false;
  isComputing        = false;
  isApproving        = false;
  isWorkflowStarting = false;

  remarkForm = this.fb.group({
    text: ['', Validators.required]
  });

  qualificationForm = this.fb.group({
    title:            ['Top Performer', Validators.required],
    description:      ['Awarded for excellent performance'],
    storeInOrangeHrm: [false]
  });

  private subs: Subscription[] = [];

  constructor(private api: ApiService, private fb: FormBuilder, private notifications: NotificationService) {}

  ngOnInit(): void {
    this.loadSalesmen();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadSalesmen(): void {
    this.isLoadingSalesmen = true;
    const sub = this.api.listSalesmen().subscribe({
      next: (salesmen) => {
        this.salesmen = salesmen;
        this.isLoadingSalesmen = false;
        // auto-select first salesman so fields are never empty
        if (salesmen.length && !this.employeeId) {
          this.employeeId = salesmen[0].employeeId;
        }
      },
      error: () => { this.isLoadingSalesmen = false; }
    });
    this.subs.push(sub);
  }

  onSelectionChange(employeeId: string): void {
    this.employeeId = employeeId;
    this.bonus = null;
    this.workflow = null;
    this.workflowTasks = [];
  }

  loadBonus(): void {
    this.isLoading = true;
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (bonus) => { this.bonus = bonus; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  computeBonus(): void {
    this.isComputing = true;
    this.api.computeBonus(this.employeeId, this.year).subscribe({
      next: (bonus) => {
        this.bonus = bonus;
        this.isComputing = false;
        this.notifications.success('Bonus computed');
      },
      error: () => { this.isComputing = false; }
    });
  }

  approveCeo(): void {
    this.isApproving = true;
    this.api.approveCeo(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.isApproving = false;
        if (this.bonus) this.bonus = { ...this.bonus, status: (res.status ?? this.bonus.status) as any };
        this.notifications.success('CEO approval saved');
      },
      error: () => { this.isApproving = false; }
    });
  }

  addRemark(): void {
    if (this.remarkForm.invalid) return;
    const text = this.remarkForm.value.text || '';
    this.api.addRemark(this.employeeId, text, this.year).subscribe({
      next: () => {
        this.remarkForm.reset();
        this.notifications.success('Remark added');
        this.loadBonus();
      },
      error: () => {}
    });
  }

  createQualification(): void {
    if (this.qualificationForm.invalid) return;
    const v = this.qualificationForm.value as any;
    this.api.createQualification(this.employeeId, {
      year:             this.year,
      title:            v.title,
      description:      v.description || '',
      storeInOrangeHrm: !!v.storeInOrangeHrm
    }).subscribe({
      next: () => this.notifications.success('Qualification created'),
      error: () => {}
    });
  }

  startWorkflow(): void {
    this.isWorkflowStarting = true;
    this.api.startWorkflow(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.workflow = res;
        this.workflowTasks = [];
        this.isWorkflowStarting = false;
        this.notifications.success(`Workflow started — pid: ${res.processInstanceId}`);
      },
      error: () => { this.isWorkflowStarting = false; }
    });
  }

  loadWorkflowTasks(): void {
    if (!this.workflow?.processInstanceId) return;
    this.api.listWorkflowTasks(this.workflow.processInstanceId).subscribe({
      next: (tasks) => (this.workflowTasks = tasks),
      error: () => {}
    });
  }

  completeTask(taskId: string): void {
    this.api.completeWorkflowTask(taskId, {}).subscribe({
      next: () => this.loadWorkflowTasks(),
      error: () => {}
    });
  }
}
