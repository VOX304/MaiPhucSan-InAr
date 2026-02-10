import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { CeoBonusComponent } from './components/ceo-bonus/ceo-bonus.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HrEmployeesComponent } from './components/hr-employees/hr-employees.component';
import { LoginComponent } from './components/login/login.component';
import { SalesmanPerformanceComponent } from './components/salesman-performance/salesman-performance.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NotificationDisplayComponent } from './components/notification-display/notification-display.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AppRoutingModule,
    AppComponent,
    LoginComponent,
    DashboardComponent,
    WelcomeComponent,
    CeoBonusComponent,
    SalesmanPerformanceComponent,
    HrEmployeesComponent,
    NotificationDisplayComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    ErrorDisplayComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
