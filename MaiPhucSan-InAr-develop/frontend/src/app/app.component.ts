import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationDisplayComponent } from './components/notification-display/notification-display.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        CommonModule,
        MatButtonModule,
        MatToolbarModule,
        RouterModule,
        NotificationDisplayComponent
    ]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
