import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/api-models';
import { WelcomeComponent } from '../welcome/welcome.component';
import { HrEmployeesComponent } from '../hr-employees/hr-employees.component';
import { CeoBonusComponent } from '../ceo-bonus/ceo-bonus.component';
import { SalesmanPerformanceComponent } from '../salesman-performance/salesman-performance.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        WelcomeComponent,
        HrEmployeesComponent,
        CeoBonusComponent,
        SalesmanPerformanceComponent
    ]
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Simulate data loading - dashboard initializes with components
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    } catch (err) {
      this.error = 'Failed to load dashboard';
      this.isLoading = false;
      console.error('Dashboard loading error:', err);
    }
  }

  get user(): AuthUser | null {
    return this.auth.user;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  retry(): void {
    this.loadDashboardData();
  }
}
