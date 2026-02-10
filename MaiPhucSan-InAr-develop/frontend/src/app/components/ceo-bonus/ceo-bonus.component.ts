import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../services/api.service';
import { BonusComputation } from '../../models/api-models';

@Component({
    selector: 'app-ceo-bonus',
    templateUrl: './ceo-bonus.component.html',
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
export class CeoBonusComponent {
  employeeId = 'E1001';
  year = new Date().getFullYear();

  bonus: BonusComputation | null = null;
  workflow: any | null = null;
  workflowTasks: any[] = [];

  // Loading and state flags
  isLoading = false;
  isComputing = false;
  isApproving = false;
  isWorkflowStarting = false;
  error: string | null = null;

  remarkForm = this.fb.group({
    text: ['', Validators.required]
  });

  qualificationForm = this.fb.group({
    title: ['Top Performer', Validators.required],
    description: ['Awarded for excellent performance'],
    storeInOrangeHrm: [false]
  });

  constructor(private api: ApiService, private fb: FormBuilder) {}

  loadBonus(): void {
    this.error = null;
    this.isLoading = true;
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.bonus = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Bonus not found. Compute first.';
        this.isLoading = false;
      }
    });
  }

  computeBonus(): void {
    this.error = null;
    this.isComputing = true;
    this.api.computeBonus(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.bonus = res.data;
        this.isComputing = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Compute failed';
        this.isComputing = false;
      }
    });
  }

  approveCeo(): void {
    this.error = null;
    this.isApproving = true;
    this.api.approveCeo(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.isApproving = false;
        if (res.status === 'CEO_APPROVED') {
          this.bonus = { ...this.bonus!, status: 'CEO_APPROVED' as any };
        }
      },
      error: (err) => {
        this.error = err?.error?.error || 'CEO approval failed';
        this.isApproving = false;
      }
    });
  }

  addRemark(): void {
    this.error = null;
    if (this.remarkForm.invalid) return;
    const text = this.remarkForm.value.text || '';
    this.api.addRemark(this.employeeId, text, this.year).subscribe({
      next: (res) => {
        this.bonus = res.data;
        this.remarkForm.reset();
      },
      error: (err) => (this.error = err?.error?.error || 'Add remark failed')
    });
  }

  createQualification(): void {
    this.error = null;
    if (this.qualificationForm.invalid) return;

    const v = this.qualificationForm.value as any;
    this.api
      .createQualification(this.employeeId, {
        year: this.year,
        title: v.title,
        description: v.description || '',
        storeInOrangeHrm: !!v.storeInOrangeHrm
      })
      .subscribe({
        next: () => {
          // show message via JSON only
        },
        error: (err) => (this.error = err?.error?.error || 'Create qualification failed')
      });
  }

  // Camunda workflow (N_FR2)
  startWorkflow(): void {
    this.error = null;
    this.isWorkflowStarting = true;
    this.api.startWorkflow(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.workflow = res.data;
        this.workflowTasks = [];
        this.isWorkflowStarting = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Start workflow failed (Camunda not running?)';
        this.isWorkflowStarting = false;
      }
    });
  }

  loadWorkflowTasks(): void {
    if (!this.workflow?.id) return;
    this.api.listWorkflowTasks(this.workflow.id).subscribe({
      next: (res) => (this.workflowTasks = res.data),
      error: (err) => (this.error = err?.error?.error || 'List tasks failed')
    });
  }

  completeTask(taskId: string): void {
    this.api.completeWorkflowTask(taskId, {}).subscribe({
      next: () => this.loadWorkflowTasks(),
      error: (err) => (this.error = err?.error?.error || 'Complete task failed')
    });
  }
}
