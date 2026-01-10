import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BonusComputation } from '../../models/api-models';

@Component({
  selector: 'app-ceo-bonus',
  templateUrl: './ceo-bonus.component.html'
})
export class CeoBonusComponent {
  employeeId = 'E1001';
  year = new Date().getFullYear();

  bonus: BonusComputation | null = null;
  workflow: any | null = null;
  workflowTasks: any[] = [];

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
    this.api.getBonus(this.employeeId, this.year).subscribe({
      next: (res) => (this.bonus = res.data),
      error: (err) => (this.error = err?.error?.error || 'Bonus not found. Compute first.')
    });
  }

  computeBonus(): void {
    this.error = null;
    this.api.computeBonus(this.employeeId, this.year).subscribe({
      next: (res) => (this.bonus = res.data),
      error: (err) => (this.error = err?.error?.error || 'Compute failed')
    });
  }

  approveCeo(): void {
    this.error = null;
    this.api.approveCeo(this.employeeId, this.year).subscribe({
      next: (res) => (this.bonus = res.data),
      error: (err) => (this.error = err?.error?.error || 'CEO approval failed')
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
    this.api.startWorkflow(this.employeeId, this.year).subscribe({
      next: (res) => {
        this.workflow = res.data;
        this.workflowTasks = [];
      },
      error: (err) => (this.error = err?.error?.error || 'Start workflow failed (Camunda not running?)')
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
