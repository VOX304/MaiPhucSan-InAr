/**
 * FRONTEND INTEGRATION GUIDE
 * 
 * This file documents best practices for integrating the frontend
 * with the optimized backend API.
 */

/**
 * 1. COMPONENT BEST PRACTICES
 * ============================
 * 
 * When creating new components that interact with the API:
 * 
 * a) Use the NotificationService for user feedback:
 *    - Success messages after operations
 *    - Error messages from API failures
 *    - Don't display errors in the template
 * 
 * b) Use the DialogService for confirmations:
 *    - Destructive operations (delete, approve, confirm)
 *    - State-changing actions
 * 
 * c) Handle loading states with isLoading boolean:
 *    - Show LoadingSpinnerComponent when true
 *    - Disable buttons during operations
 * 
 * d) Separate data loading concerns:
 *    - loadXyz() methods for GET requests
 *    - actionXyz() methods for POST/PATCH requests
 */

/**
 * 2. API SERVICE PATTERNS
 * =======================
 * 
 * a) For GET endpoints that return data:
 *    - Return Observable<ApiResponse<T>>
 *    - Component extracts res.data
 *    - Example: listSocial() returns records and totals
 * 
 * b) For POST/PATCH endpoints that mutate data:
 *    - Return Observable<ApiActionResponse>
 *    - Extract res.id, res.message, res.status
 *    - Show notification from res.message
 *    - Example: createSocial() returns {id, message, bonusEur}
 * 
 * c) Always use proper types:
 *    - Don't use 'any' for API responses
 *    - Use ApiActionResponse for action endpoints
 *    - Define custom types for complex responses
 */

/**
 * 3. ERROR HANDLING PATTERN
 * =========================
 * 
 * The AuthInterceptor automatically:
 * - Extracts error messages from response
 * - Shows error notification
 * - Logs out on 401 Unauthorized
 * 
 * In components:
 * - Subscribe with error callback, but don't show message
 * - Let the interceptor handle display
 * - Use finally() to reset loading state
 * 
 * Example:
 *   this.api.someCall().subscribe({
 *     next: (res) => { this.data = res.data; this.isLoading = false; },
 *     error: () => { this.isLoading = false; } // Interceptor shows message
 *   });
 */

/**
 * 4. NOTIFICATION SERVICE
 * =======================
 * 
 * Inject NotificationService for user feedback:
 * 
 *   this.notifications.success('Saved successfully'); // 3s auto-close
 *   this.notifications.error('Invalid request');      // 5s auto-close
 *   this.notifications.warning('Please verify data'); // 4s auto-close
 *   this.notifications.info('Loading data...');       // 3s auto-close
 * 
 * Or provide custom duration:
 *   this.notifications.success('Done', 2000);
 * 
 * To keep a notification visible:
 *   this.notifications.info('Processing...', 0); // 0 = no auto-close
 * 
 * To manually remove:
 *   const id = 'notif_123'; // returned from add()
 *   this.notifications.remove(id);
 */

/**
 * 5. DIALOG SERVICE
 * =================
 * 
 * For confirmation dialogs:
 * 
 *   const confirmed = await this.dialog.confirm({
 *     title: 'Confirm Action',
 *     message: 'Are you sure?',
 *     confirmText: 'Yes',
 *     cancelText: 'No',
 *     isDestructive: true // Shows red button
 *   });
 * 
 *   if (confirmed) {
 *     // Perform action
 *   }
 */

/**
 * 6. RESPONSE FORMAT PATTERNS
 * ============================
 * 
 * GET endpoints (list/get):
 *   { data: { records: [...], totalEur: 100 } }
 *   { data: { _id, field1, field2 } }
 * 
 * POST/PATCH endpoints (create/update):
 *   { id: "123", message: "Created", status?: "PENDING", bonusEur?: 100 }
 * 
 * Error responses:
 *   Interceptor extracts .error.error or .error.message
 *   Shows via NotificationService
 * 
 * Extract pattern:
 *   res.data for GET endpoints
 *   res.message for action confirmations
 *   res.status for state changes
 */

/**
 * 7. ASYNC/AWAIT WITH DIALOGS
 * ============================
 * 
 * When using async/await with dialogs:
 * 
 *   async performAction(): Promise<void> {
 *     const confirmed = await this.dialog.confirm({...});
 *     if (!confirmed) return;
 *     
 *     this.isLoading = true;
 *     this.api.action().subscribe({
 *       next: (res) => {
 *         this.isLoading = false;
 *         this.notifications.success(res.message);
 *         this.reload();
 *       },
 *       error: () => { this.isLoading = false; }
 *     });
 *   }
 */

/**
 * 8. ENVIRONMENT CONFIGURATION
 * ============================
 * 
 * environment.ts (development):
 *   apiBaseUrl: '/api/v1' // Proxy configured in proxy.conf.json
 * 
 * environment.prod.ts (production):
 *   apiBaseUrl: 'https://api.example.com/api/v1'
 * 
 * proxy.conf.json (development):
 *   {
 *     "/api/v1": {
 *       "target": "http://localhost:3000",
 *       "secure": false
 *     }
 *   }
 */

export const FRONTEND_INTEGRATION_GUIDE = 'See this file for best practices';
