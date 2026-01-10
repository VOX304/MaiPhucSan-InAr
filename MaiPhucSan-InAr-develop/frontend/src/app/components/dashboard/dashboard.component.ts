import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/api-models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get user(): AuthUser | null {
    return this.auth.user;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
