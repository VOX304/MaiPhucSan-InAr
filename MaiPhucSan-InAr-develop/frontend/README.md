# Frontend Development Guide

> Complete frontend development documentation including setup, architecture, components, services, and development patterns.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Development Patterns](#development-patterns)
6. [Components Reference](#components-reference)
7. [Services Reference](#services-reference)
8. [Styling & Material](#styling--material)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Backend API running at http://localhost:3000 (or configured in proxy)

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server (with API proxy)
npm start
# Frontend: http://localhost:4200
# API proxy: http://localhost:3000 → http://localhost:4200/api

# 3. Demo credentials
# CEO:      ceo / Ceo123!
# HR:       hr / Hr123!
# Salesman: salesman01 / password123
```

### Build for Production

```bash
npm run build
# Output: dist/ folder (production-ready, ~1.11 MB)
```

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────┐
│   Angular 20.3.16 Frontend              │
│   (TypeScript + Material Design)        │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
    ┌────▼────┐          ┌───────▼──────┐
    │ Router  │          │   Guards &   │
    │ (Lazy)  │          │ Interceptor  │
    └────┬────┘          └───────┬──────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼──────────┐
         │  Service Layer       │
         │  ┌────────────────┐  │
         │  │ ApiService     │  │
         │  │ AuthService    │  │
         │  │ NotifService   │  │
         │  │ DialogService  │  │
         │  └────────────────┘  │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │ HttpClient           │
         │ + AuthInterceptor    │
         │ + ErrorInterceptor   │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────────────────┐
         │  Backend API /api/v1/            │
         │  - Express.js :3000              │
         │  - MongoDB                       │
         │  - External Systems              │
         └──────────────────────────────────┘
```

### Component Hierarchy

```
AppComponent
├── LoginComponent (route: /login)
├── DashboardComponent (route: /dashboard, protected)
│   ├── HrEmployeesComponent (tab 1)
│   │   ├── EmployeeListComponent
│   │   └── EmployeeFormComponent
│   ├── SalesmanPerformanceComponent (tab 2)
│   │   ├── PerformanceChartComponent
│   │   └── PerformanceTableComponent
│   ├── CeoBonusComponent (tab 3)
│   │   ├── BonusCalculatorComponent
│   │   └── ApprovalWorkflowComponent
│   ├── StatisticsComponent (tab 4)
│   │   └── ChartsComponent (Chart.js)
│   └── ErrorBoundaryComponent (error handling)
└── NotificationDisplayComponent (global toast)
```

---

## 📦 Installation

### Prerequisites Check

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Install Dependencies

```bash
cd frontend
npm install
```

### Verify Installation

```bash
npm list | head -20
npm list @angular
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts           # Root component
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app-routing.module.ts      # Routes
│   │   ├── app.module.ts              # Module (if not standalone)
│   │   ├── material.module.ts         # Material imports
│   │   │
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── dashboard/
│   │   │   ├── hr-employees/
│   │   │   ├── salesman-performance/
│   │   │   ├── ceo-bonus/
│   │   │   ├── statistics/
│   │   │   ├── error-boundary/
│   │   │   ├── notification-display/
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts         # HTTP API calls
│   │   │   ├── auth.service.ts        # Authentication
│   │   │   ├── notification.service.ts# Toast notifications
│   │   │   ├── dialog.service.ts      # Confirmation dialogs
│   │   │   └── ...
│   │   │
│   │   ├── models/
│   │   │   └── api-models.ts          # TypeScript interfaces
│   │   │
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    # JWT token injection
│   │   │   └── error.interceptor.ts   # Error handling
│   │   │
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Route protection
│   │   │
│   │   └── FRONTEND_BEST_PRACTICES.ts # Development guide
│   │
│   ├── environments/
│   │   ├── environment.ts             # Dev config
│   │   └── environment.prod.ts        # Prod config
│   │
│   ├── index.html
│   ├── main.ts                        # Bootstrap
│   ├── polyfills.ts
│   ├── styles.css                     # Global styles
│   └── test.ts
│
├── angular.json                       # Angular CLI config
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── proxy.conf.json                    # Dev server proxy
├── karma.conf.js
├── package.json
└── package-lock.json
```

---

## 💻 Development Patterns

### 1. Data Loading with Loading State

```typescript
export class MyComponent implements OnInit {
  data: MyModel[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;
    
    this.api.getSalesmenPerformance().subscribe({
      next: (response) => {
        this.data = response.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.data = [];
        this.isLoading = false;
      }
    });
  }

  retry(): void {
    this.load();
  }
}
```

**Template:**
```html
<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

<div *ngIf="!isLoading && error" class="alert alert-error">
  {{ error }}
  <button (click)="retry()">Retry</button>
</div>

<mat-table *ngIf="!isLoading && data.length > 0" [dataSource]="data">
  <!-- Table columns -->
</mat-table>

<div *ngIf="!isLoading && data.length === 0" class="empty-state">
  No data available
</div>
```

### 2. Form Submission with Validation

```typescript
export class MyFormComponent {
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private notifications: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: [null, [Validators.required, Validators.min(18)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notifications.warning('Please fix validation errors');
      return;
    }

    this.isSubmitting = true;

    this.api.createUser(this.form.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.notifications.success(response.message || 'Created successfully');
        this.router.navigate(['/list']);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
```

**Template:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <mat-form-field>
    <mat-label>Name</mat-label>
    <input matInput formControlName="name" required>
    <mat-error *ngIf="form.get('name')?.hasError('required')">
      Name is required
    </mat-error>
  </mat-form-field>

  <button mat-raised-button color="primary" [disabled]="isSubmitting">
    {{ isSubmitting ? 'Saving...' : 'Save' }}
  </button>
</form>
```

### 3. Confirmation Dialog

```typescript
export class MyListComponent {
  items: MyModel[] = [];

  constructor(
    private api: ApiService,
    private dialog: DialogService,
    private notifications: NotificationService
  ) {}

  async delete(item: MyModel): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true
    });

    if (!confirmed) return;

    this.api.deleteUser(item.id).subscribe({
      next: (response) => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.notifications.success(response.message || 'Deleted');
      }
    });
  }
}
```

### 4. Error Handling & Recovery

```typescript
export class MyComponent {
  handleError(error: any): void {
    const message = error?.error?.message || 'An error occurred';
    
    if (error?.status === 409) {
      this.notifications.error('This item already exists');
    } else if (error?.status === 422) {
      this.notifications.error('Please check your input');
    } else if (error?.status === 503) {
      this.notifications.error('Service unavailable. Please try again later');
    } else {
      this.notifications.error(message);
    }
  }
}
```

---

## 🧩 Components Reference

### AppComponent
Root component that wraps the entire application.

### LoginComponent
User authentication page. Submits username/password and stores JWT token.

### DashboardComponent
Main tabbed interface with role-based views:
- **HR Tab**: Employee management and performance records
- **Salesman Tab**: Personal performance and bonus viewing
- **CEO Tab**: Bonus computation and approvals
- **Statistics Tab**: Charts and visualizations

### HrEmployeesComponent
HR dashboard for employee management.
- List all employees
- Create new employee
- Sync from OrangeHRM
- Edit employee details

### SalesmanPerformanceComponent
Salesman view of personal performance.
- Social performance records
- Order evaluations
- Calculated bonus
- Performance charts

### CeoBonusComponent
CEO bonus computation and approval interface.
- Select employee and year
- Compute bonus
- Review breakdown
- Approve/reject with remarks

### StatisticsComponent
System-wide statistics and charts.
- Total bonuses by salesman
- Performance trends
- Approval status
- Export reports

### ErrorBoundaryComponent
Catches and displays errors gracefully.
- Error message display
- Retry button
- Fallback UI

---

## 🔧 Services Reference

### ApiService
Handles all HTTP communication with backend.

```typescript
// Usage
this.api.getSalesmenPerformance().subscribe(response => {
  this.data = response.data;
});
```

### AuthService
Manages authentication and JWT tokens.

```typescript
// Login
this.auth.login(username, password).subscribe(token => {
  // Token stored automatically
});

// Get current user
const user = this.auth.getCurrentUser();

// Logout
this.auth.logout();
```

### NotificationService
Shows toast notifications.

```typescript
this.notifications.success('Operation successful');
this.notifications.error('An error occurred');
this.notifications.warning('Please confirm');
this.notifications.info('Information message');
```

### DialogService
Shows confirmation dialogs.

```typescript
const confirmed = await this.dialog.confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No'
});
```

---

## 🎨 Styling & Material

### Material Components Used
- `MatButtonModule` - Buttons
- `MatFormFieldModule` - Form fields
- `MatInputModule` - Text inputs
- `MatSelectModule` - Dropdowns
- `MatTableModule` - Data tables
- `MatTabsModule` - Tabbed interface
- `MatProgressSpinnerModule` - Loading spinner
- `MatDialogModule` - Dialogs
- `MatTooltipModule` - Tooltips
- `MatIconModule` - Icons
- `MatDatepickerModule` - Date picker
- `MatSlideToggleModule` - Toggles

### Global Styles
```css
/* src/styles.css */
body {
  font-family: Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Test Structure
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [MockApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should display loaded data', () => {
    component.data = [{ id: 1, name: 'Test' }];
    fixture.detectChanges();
    
    expect(component.data.length).toBe(1);
  });
});
```

---

## 🐛 Troubleshooting

### Build Issues

**Angular compilation error**
```bash
npm run build -- --configuration development
```

**Module not found**
```bash
npm install
npm cache clean --force
```

**TypeScript errors**
```bash
npm run build -- --verbose
```

### Runtime Issues

**Port 4200 already in use**
```bash
ng serve --port 4201
```

**API connection refused**
- Check backend is running: `npm run dev` in backend/
- Check proxy configuration: `proxy.conf.json`
- Verify API URL in environment

**Blank screen on load**
- Check browser console for errors (F12)
- Verify JWT token in localStorage
- Check Network tab for 401/403 errors

### Performance

**Slow build**
```bash
npm run build -- --optimization
```

**Large bundle**
- Check what's imported: `npm install -g webpack-bundle-analyzer`
- Enable lazy loading for routes
- Tree-shake unused code

---

## 📝 Development Workflow

### Start Development
```bash
npm start
# Opens http://localhost:4200 automatically
```

### Make Changes
- Edit component files in `src/app/`
- Hot reload happens automatically
- Check browser console for errors

### Add New Component
```bash
ng generate component components/my-component
# Creates files in src/app/components/my-component/
```

### Add New Service
```bash
ng generate service services/my-service
# Creates files in src/app/services/
```

### Build for Production
```bash
npm run build
# Output in dist/
```

---

## 🚀 Production Deployment

### Build Artifacts
```bash
npm run build
# Creates production-ready files in dist/
```

### Size Report
```bash
npm run build -- --stats-json
```

### Environment Configuration
Edit `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com'
};
```

### Deployment Steps
1. Run `npm run build`
2. Upload `dist/` contents to web server
3. Configure server to serve `index.html` for all routes
4. Enable gzip compression
5. Set up HTTPS

---

## 📚 Best Practices

### Component Development
- Keep components small and focused
- Use OnInit lifecycle hook for setup
- Implement OnDestroy to unsubscribe
- Use trackBy in *ngFor for performance
- Always handle errors in subscriptions

### Performance
- Use ChangeDetectionStrategy.OnPush when possible
- Lazy load feature modules
- Use async pipe for subscriptions
- Unsubscribe from observables
- Use virtual scrolling for large lists

### Code Quality
- Follow Angular style guide
- Use TypeScript strict mode
- Add comments for complex logic
- Write tests for services
- Keep styles scoped to components

### Accessibility
- Add ARIA labels
- Use semantic HTML
- Ensure keyboard navigation
- Test with screen readers
- Meet WCAG 2.1 AA standards

---

## 📖 Additional Resources

- [Angular Docs](https://angular.io/docs)
- [Angular Material Docs](https://material.angular.io)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated**: February 10, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready  
**Vulnerabilities**: ✅ 0  
**Bundle Size**: ~1.11 MB (gzipped)
