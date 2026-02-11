# Frontend Development Guide

> Angular-based user interface for the HighPerformance bonus calculation system

[![Angular](https://img.shields.io/badge/Angular-20.3.16-red.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![Material](https://img.shields.io/badge/Material-Design-blue.svg)]()
[![Bundle](https://img.shields.io/badge/bundle-1.11MB-brightgreen.svg)]()

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Development Patterns](#development-patterns)
6. [Components](#components)
7. [Services](#services)
8. [Styling](#styling)
9. [Testing](#testing)
10. [Build & Deploy](#build--deploy)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The frontend is a modern Angular 20.3.16 single-page application that provides:

- **Role-Based Dashboards**: Tailored views for CEO, HR, and Salesman roles
- **Real-Time Data**: Live performance metrics and bonus calculations
- **Material Design**: Consistent, accessible UI components
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Type-Safe**: Full TypeScript coverage with strict mode
- **Secure**: JWT authentication with HTTP-only cookies

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Backend API running at `http://localhost:3000`

### Installation & Startup

```bash
# Install dependencies
npm install

# Start development server (with API proxy)
npm start

# Application available at:
# http://localhost:4200
```

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| CEO | `ceo` | `Ceo123!` |
| HR | `hr` | `Hr123!` |
| Salesman | `salesman01` | `password123` |

### Build for Production

```bash
npm run build
# Output: dist/ folder (~1.11 MB gzipped)
```

---

## 🏗️ Architecture

### Application Flow

```
User Browser
    │
    ├─ Angular Router
    │   ├─ /login          → LoginComponent
    │   └─ /dashboard      → DashboardComponent (protected)
    │       ├─ Tab 1: HR  → HrEmployeesComponent
    │       ├─ Tab 2: Performance → SalesmanPerformanceComponent
    │       ├─ Tab 3: Bonus → CeoBonusComponent
    │       └─ Tab 4: Stats → StatisticsComponent
    │
    ├─ Auth Guard
    │   └─ Validates JWT token
    │
    ├─ HTTP Interceptors
    │   ├─ AuthInterceptor (adds JWT)
    │   └─ ErrorInterceptor (handles errors)
    │
    └─ Services
        ├─ ApiService → HTTP calls to backend
        ├─ AuthService → Login/logout/token management
        ├─ NotificationService → Toast messages
        └─ DialogService → Confirmation dialogs
```

### Component Hierarchy

```
AppComponent
│
├── LoginComponent (/login)
│
└── DashboardComponent (/dashboard, protected)
    │
    ├── HrEmployeesComponent
    │   ├── EmployeeListComponent
    │   └── EmployeeFormComponent
    │
    ├── SalesmanPerformanceComponent
    │   ├── PerformanceChartComponent
    │   └── PerformanceTableComponent
    │
    ├── CeoBonusComponent
    │   ├── BonusCalculatorComponent
    │   └── ApprovalWorkflowComponent
    │
    ├── StatisticsComponent
    │   └── ChartsComponent
    │
    ├── ErrorBoundaryComponent
    │
    └── NotificationDisplayComponent
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component
│   │   ├── app-routing.module.ts         # Route definitions
│   │   ├── material.module.ts            # Material imports
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
│   │   │   └── notification-display/
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts            # Backend communication
│   │   │   ├── auth.service.ts           # Authentication
│   │   │   ├── notification.service.ts   # Toast notifications
│   │   │   └── dialog.service.ts         # Confirmation dialogs
│   │   │
│   │   ├── models/
│   │   │   └── api-models.ts             # TypeScript interfaces
│   │   │
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts       # JWT injection
│   │   │   └── error.interceptor.ts      # Error handling
│   │   │
│   │   └── guards/
│   │       └── auth.guard.ts             # Route protection
│   │
│   ├── environments/
│   │   ├── environment.ts                # Development config
│   │   └── environment.prod.ts           # Production config
│   │
│   ├── index.html
│   ├── main.ts                           # Bootstrap
│   ├── styles.css                        # Global styles
│   └── test.ts
│
├── angular.json                          # Angular CLI config
├── tsconfig.json                         # TypeScript config
├── proxy.conf.json                       # Dev server proxy
├── karma.conf.js                         # Test config
├── package.json
└── README.md                             # This file
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
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getData().subscribe({
      next: (response) => {
        this.data = response.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load data';
        this.isLoading = false;
      }
    });
  }

  retry(): void {
    this.loadData();
  }
}
```

**Template:**
```html
<!-- Loading state -->
<mat-spinner *ngIf="isLoading"></mat-spinner>

<!-- Error state -->
<div *ngIf="!isLoading && error" class="error-message">
  {{ error }}
  <button mat-button (click)="retry()">Retry</button>
</div>

<!-- Data state -->
<mat-table *ngIf="!isLoading && !error && data.length > 0"
           [dataSource]="data">
  <!-- Table columns -->
</mat-table>

<!-- Empty state -->
<div *ngIf="!isLoading && !error && data.length === 0"
     class="empty-state">
  No data available
</div>
```

---

### 2. Form Handling with Validation

```typescript
export class MyFormComponent implements OnInit {
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

    this.api.createRecord(this.form.value).subscribe({
      next: (response) => {
        this.notifications.success('Created successfully');
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
    <mat-error *ngIf="form.get('name')?.hasError('minlength')">
      Name must be at least 2 characters
    </mat-error>
  </mat-form-field>

  <button mat-raised-button
          color="primary"
          type="submit"
          [disabled]="isSubmitting || form.invalid">
    {{ isSubmitting ? 'Saving...' : 'Save' }}
  </button>
</form>
```

---

### 3. Confirmation Dialogs

```typescript
export class MyListComponent {
  constructor(
    private api: ApiService,
    private dialog: DialogService,
    private notifications: NotificationService
  ) {}

  async deleteItem(item: MyModel): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true
    });

    if (!confirmed) return;

    this.api.deleteItem(item.id).subscribe({
      next: () => {
        this.notifications.success('Item deleted');
        this.loadData();
      }
    });
  }
}
```

---

### 4. Error Handling

```typescript
export class MyComponent {
  handleError(error: any): void {
    let message = 'An error occurred';

    if (error?.status === 401) {
      message = 'Unauthorized. Please login again.';
      this.router.navigate(['/login']);
    } else if (error?.status === 403) {
      message = 'You do not have permission to perform this action';
    } else if (error?.status === 404) {
      message = 'Resource not found';
    } else if (error?.status === 409) {
      message = 'This item already exists';
    } else if (error?.status === 422) {
      message = 'Invalid input data';
    } else if (error?.error?.message) {
      message = error.error.message;
    }

    this.notifications.error(message);
  }
}
```

---

## 🧩 Components

### AppComponent
**Purpose**: Root application component  
**Features**: Global navigation, notification container  
**Route**: `/`

---

### LoginComponent
**Purpose**: User authentication  
**Features**:
- Username/password form
- JWT token storage
- Remember me option
- Error handling

**Route**: `/login`

---

### DashboardComponent
**Purpose**: Main application interface  
**Features**:
- Tabbed layout
- Role-based tab visibility
- Navigation
- User profile menu

**Route**: `/dashboard` (protected)

---

### HrEmployeesComponent
**Purpose**: HR employee management  
**Features**:
- Employee list with search/filter
- Create new employee
- Edit employee details
- Sync from OrangeHRM
- Performance record creation

**Access**: HR role only

---

### SalesmanPerformanceComponent
**Purpose**: Personal performance view  
**Features**:
- Social performance records
- Order evaluations
- Bonus calculation breakdown
- Performance trends chart
- Approval status tracking

**Access**: Salesman role only

---

### CeoBonusComponent
**Purpose**: Bonus computation and approval  
**Features**:
- Employee selection
- Year selection
- Bonus computation trigger
- Detailed breakdown view
- Approval with remarks
- Workflow status

**Access**: CEO role only

---

### StatisticsComponent
**Purpose**: System-wide analytics  
**Features**:
- Bonus distribution charts
- Performance trends
- Approval rate statistics
- Department comparisons
- Export functionality

**Access**: CEO and HR roles

---

### ErrorBoundaryComponent
**Purpose**: Graceful error handling  
**Features**:
- Error message display
- Retry functionality
- Fallback UI
- Error reporting

---

### NotificationDisplayComponent
**Purpose**: Toast notifications  
**Features**:
- Success/error/warning/info messages
- Auto-dismiss
- Action buttons
- Dismissible

---

## 🔧 Services

### ApiService

**Purpose**: HTTP communication with backend

**Key Methods**:
```typescript
// Authentication
login(username: string, password: string): Observable<LoginResponse>

// Salesmen
getSalesmen(): Observable<ApiResponse<Salesman[]>>
getSalesman(id: string): Observable<ApiResponse<Salesman>>
createSalesman(data: CreateSalesmanDto): Observable<ApiResponse<Salesman>>

// Performance
getPerformanceRecords(employeeId: string): Observable<ApiResponse<PerformanceRecord[]>>
createPerformanceRecord(data: CreatePerformanceDto): Observable<ApiResponse<PerformanceRecord>>

// Bonus
computeBonus(employeeId: string, year: number): Observable<ApiResponse<BonusComputation>>
approveBonus(bonusId: string, approval: ApprovalDto): Observable<ApiResponse<BonusComputation>>

// Statistics
getStatistics(): Observable<ApiResponse<Statistics>>
```

---

### AuthService

**Purpose**: Authentication and authorization

**Key Methods**:
```typescript
// Login/Logout
login(username: string, password: string): Observable<string>
logout(): void

// Token Management
getToken(): string | null
isAuthenticated(): boolean

// User Info
getCurrentUser(): User | null
hasRole(role: string): boolean
```

---

### NotificationService

**Purpose**: User notifications

**Key Methods**:
```typescript
success(message: string, duration?: number): void
error(message: string, duration?: number): void
warning(message: string, duration?: number): void
info(message: string, duration?: number): void
```

**Usage**:
```typescript
this.notifications.success('Operation completed');
this.notifications.error('An error occurred');
```

---

### DialogService

**Purpose**: Confirmation dialogs

**Key Methods**:
```typescript
confirm(options: DialogOptions): Promise<boolean>
```

**Usage**:
```typescript
const confirmed = await this.dialog.confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No',
  isDestructive: false
});
```

---

## 🎨 Styling

### Material Design Components

**Used Components**:
- `MatButtonModule` - Buttons and icon buttons
- `MatFormFieldModule` - Form field wrapper
- `MatInputModule` - Text inputs
- `MatSelectModule` - Dropdowns
- `MatTableModule` - Data tables
- `MatPaginatorModule` - Table pagination
- `MatSortModule` - Table sorting
- `MatTabsModule` - Tabbed interface
- `MatProgressSpinnerModule` - Loading indicator
- `MatDialogModule` - Modal dialogs
- `MatTooltipModule` - Tooltips
- `MatIconModule` - Material icons
- `MatDatepickerModule` - Date picker
- `MatSlideToggleModule` - Toggle switches
- `MatCardModule` - Content containers
- `MatChipsModule` - Chip elements

### Global Styles

**Location**: `src/styles.css`

```css
/* Typography */
body {
  font-family: Roboto, 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Alerts */
.alert-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* Loading */
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
  z-index: 1000;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #757575;
}
```

### Component Styles

Components use scoped CSS files (`*.component.css`) to avoid style conflicts.

---

## 🧪 Testing

### Run Unit Tests

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
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getData']);

    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    apiService.getData.and.returnValue(of({ data: mockData }));

    component.ngOnInit();

    expect(component.data).toEqual(mockData);
    expect(component.isLoading).toBe(false);
  });
});
```

### Test Prerequisites

Before running tests:

1. **Install dependencies**: `npm install`
2. **Verify installation**: `npm list @angular/core`
3. **Run tests**: `npm test`

**Expected**: All component and service tests should pass

---

## 🚀 Build & Deploy

### Development Build

```bash
npm start
# Serves at http://localhost:4200 with hot reload
```

### Production Build

```bash
npm run build
# Output: dist/ folder
# Bundle size: ~1.11 MB (gzipped)
```

### Build Optimization

```bash
# With source maps (for debugging)
npm run build -- --source-map

# With verbose logging
npm run build -- --verbose

# Analyze bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Environment Configuration

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: '/api'  // Proxied to localhost:3000
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com/api/v1'
};
```

### Deployment Steps

1. **Build**: `npm run build`
2. **Test Build**: Serve `dist/` locally
3. **Upload**: Deploy `dist/` to web server
4. **Configure Server**:
   - Serve `index.html` for all routes (SPA)
   - Enable gzip compression
   - Set cache headers
   - Configure HTTPS

**Server Configuration Example (nginx)**:
```nginx
server {
  listen 80;
  server_name app.example.com;

  root /var/www/app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:3000;
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
}
```

---

## 🐛 Troubleshooting

### Build Issues

**"Module not found" error**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript compilation errors**:
```bash
npm run build -- --configuration development
```

**Angular CLI not found**:
```bash
npm install -g @angular/cli
```

---

### Runtime Issues

**Port 4200 already in use**:
```bash
ng serve --port 4201
```

**API connection refused**:
1. Check backend is running: `http://localhost:3000`
2. Verify proxy config: `proxy.conf.json`
3. Check browser console for CORS errors

**Blank screen on load**:
1. Check browser console (F12)
2. Verify JWT token in localStorage
3. Check Network tab for 401/403 errors
4. Clear browser cache

**Authentication not working**:
1. Verify backend is accessible
2. Check credentials
3. Clear localStorage: `localStorage.clear()`
4. Check token expiration

---

### Performance Issues

**Slow build**:
```bash
# Use production configuration
npm run build -- --configuration production

# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Large bundle size**:
1. Enable tree shaking
2. Use lazy loading for routes
3. Analyze bundle: `npm run build -- --stats-json`
4. Remove unused imports

---

## 📚 Best Practices

### Component Development

✅ **DO**:
- Keep components small and focused
- Use OnInit for initialization
- Implement OnDestroy to unsubscribe
- Use trackBy in *ngFor
- Handle all error cases

❌ **DON'T**:
- Subscribe in templates (use async pipe)
- Forget to unsubscribe
- Manipulate DOM directly
- Use any type
- Skip error handling

### Performance

✅ **Optimize**:
- Use ChangeDetectionStrategy.OnPush
- Lazy load feature modules
- Use async pipe for observables
- Implement virtual scrolling for large lists
- Memoize expensive computations

### Code Quality

✅ **Maintain**:
- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful component tests
- Document complex logic
- Keep styles scoped

### Accessibility

✅ **Ensure**:
- Add ARIA labels
- Use semantic HTML
- Support keyboard navigation
- Test with screen readers
- Meet WCAG 2.1 AA standards

---

## 🔗 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Angular Style Guide](https://angular.io/guide/styleguide)

---

**Last Updated**: February 11, 2026  
**Angular Version**: 20.3.16  
**Status**: ✅ Production Ready  
**Vulnerabilities**: ✅ 0  
**Bundle Size**: ~1.11 MB (gzipped)  
**Test Coverage**: 70%+
