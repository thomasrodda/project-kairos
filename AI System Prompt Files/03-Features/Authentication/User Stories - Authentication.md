# User Stories - Authentication

_Comprehensive authentication user stories for Project Kairos, covering Firebase Auth integration, user management, workspace creation, and session handling. These stories document the complete authentication flow from initial sign-in through workspace setup._

## Authentication & User Management

### 1. **Google OAuth Login**

> User Story:
>
> As a user, I want to sign in with my Google account, so that I can access my work securely without creating a new password.

**Acceptance Criteria:**

- [x] Clicking "Sign in with Google" authenticates the user via Firebase Auth
- [x] New users are automatically created in the backend database
- [x] Returning users are signed in and redirected to their workspace
- [x] Authentication tokens are automatically attached to all API requests via Authorization header
- [x] User profile information (name, email, avatar) is retrieved from Google
- [x] Loading spinner is shown during authentication process
- [x] Specific error messages displayed: "Authentication failed. Please try again." for general errors, "Network error. Please check your connection." for connectivity issues
- [x] OAuth cancellation redirects back to login page without error

Notes:

- Firebase ID tokens are stored in memory and sessionStorage for persistence
- Tokens are automatically included in Authorization header as `Bearer ${token}`
- OAuth popup blockers are detected and user is prompted to allow popups
- Profile photos from Google are cached for performance

**Status:** Complete

**Dependencies:**

- Firebase project with Google OAuth provider enabled
- Backend auth endpoints (`/api/auth/login`)
- Supabase PostgreSQL database

**Components:**

- `AuthContext.tsx` - Main authentication state management
- `auth.ts` - Firebase authentication service
- Backend auth middleware for token validation

**Priority:** High  
**Complexity:** Medium

---

### 2. **Email/Password Authentication**

> User Story:
>
> As a user, I want to sign up and sign in with my email and password, so that I can use the application without a Google account.

**Acceptance Criteria:**

- [x] User can create an account with email and password
- [x] Email verification is sent to new users within 30 seconds
- [x] Password requirements shown: minimum 6 characters, at least one number
- [x] User can sign in with email/password credentials (case-insensitive email)
- [x] "Forgot password" flow sends password reset email with 1-hour expiration
- [x] Form validation on blur: email format check, password strength indicator
- [x] Specific authentication errors: "Email already in use", "Invalid email or password", "Please verify your email before signing in"
- [x] Password visibility toggle available on all password fields

Notes:

- Email addresses are normalized to lowercase before storage
- Password reset tokens expire after 1 hour for security
- Unverified users can request new verification emails every 60 seconds
- Form shows inline validation errors below each field

**Status:** Complete

**Dependencies:**

- Firebase Auth with email provider enabled
- Email verification templates configured
- Backend user creation endpoint

**Components:**

- `AuthContext.tsx` - Handles email/password auth methods
- Login/Signup forms (implementation location varies)
- Firebase Auth email templates

**Priority:** High  
**Complexity:** Medium

---

### 3. **Workspace Creation for New Users**

> User Story:
>
> As a new user, I want a workspace automatically created when I first sign in, so that I can immediately start using the application.

**Acceptance Criteria:**

- [x] New users trigger workspace creation after successful authentication
- [ ] User is taken to workspace creation screen
- [x] Default workspace is named "{User's Name}'s Workspace" or "My Workspace" if no display name
- [x] User is automatically redirected to their new workspace after creation completes
- [x] Workspace creation failures show "Unable to create workspace. Please try again." with retry button
- [x] Full-screen loading overlay with "Setting up your workspace..." message
- [x] User becomes owner of the created workspace with full permissions
- [x] Initial welcome page created with title "Welcome to Kairos" and starter content
- [x] Workspace creation wrapped in database transaction for consistency

Notes:

- Workspace creation is idempotent - multiple attempts won't create duplicates
- If browser closes during setup, workspace creation resumes on next login
- Welcome page includes tips for getting started and keyboard shortcuts
- Failed workspace creation attempts are logged for debugging

**Status:** In Progress

**Dependencies:**

- Backend workspace creation endpoint (`/api/workspaces`)
- User authentication completed
- Database schema for workspaces

**Components:**

- `AuthContext.tsx` - Handles post-login workspace check
- Backend workspace service
- Database migrations for workspace schema

**Priority:** High  
**Complexity:** Medium

---

### 4. **Session Management & Token Refresh**

> User Story:
>
> As a user, I want my session to stay active while I'm using the app and refresh automatically, so that I don't get logged out unexpectedly.

**Acceptance Criteria:**

- [x] Firebase ID tokens are automatically refreshed before expiration
- [x] Token refresh scheduled when token lifetime reaches 5 minutes remaining
- [x] API requests retry once with refreshed token on 401 errors before failing
- [x] User remains logged in via Firebase persistence set to 'local'
- [x] Session persists across page refreshes using onAuthStateChanged listener
- [x] Logout clears Firebase auth, sessionStorage, and all API client tokens
- [x] Background token refresh uses silent refresh without UI interruption
- [x] Token refresh failures trigger re-authentication flow

Notes:

- Token refresh uses setTimeout based on token expiration time
- Failed API requests queue while token refreshes to prevent multiple refresh attempts
- Logout also revokes refresh tokens server-side for security
- Session restoration shows loading state until auth check completes
- Not sure how accurate this documentation is

**Status:** Complete

**Dependencies:**

- Firebase Auth SDK
- API client with interceptors
- Local storage for session persistence

**Components:**

- `AuthContext.tsx` - Token refresh logic
- `api/client.ts` - Request interceptors for token injection
- Firebase Auth persistence settings

**Priority:** High  
**Complexity:** High

---

### 5. **Protected Route Navigation**

> User Story:
>
> As a user, I want to be redirected to login when accessing protected pages while unauthenticated, so that my data remains secure.

**Acceptance Criteria:**

- [x] Unauthenticated users are redirected to /login when accessing protected routes
- [x] Original destination URL is preserved in query parameter `?redirect=/original/path`
- [x] Loading skeleton shown for 500ms max while checking authentication
- [x] Authenticated users can access all /workspace/\* routes
- [x] Public pages (/, /login, /signup, /about) accessible without authentication
- [x] Deep links work correctly after authentication using redirect parameter
- [x] 404 pages don't trigger authentication redirect

Notes:

- Protected route component wraps all authenticated pages
- Redirect parameter is validated to prevent open redirect vulnerabilities
- Loading state prevents layout shift during auth check
- Direct navigation to workspace subpages works after login

**Status:** Complete

**Dependencies:**

- React Router for navigation
- AuthContext for authentication state
- Protected route wrapper component

**Components:**

- `AuthContext.tsx` - Provides authentication state
- Protected route components
- App routing configuration

**Priority:** High  
**Complexity:** Low

---

### 6. **User Profile Management**

> User Story:
>
> As a user, I want to view and update my profile information, so that my workspace displays accurate information about me.

**Acceptance Criteria:**

- [ ] User can view their profile information (name, email, avatar)
- [ ] Display name can be updated
- [ ] Profile photo can be changed (via Google account for OAuth users)
- [ ] Email address is shown but read-only for OAuth users
- [ ] Changes are immediately reflected across the application
- [ ] Profile updates sync with backend database
- [ ] Validation prevents empty or invalid display names

Notes:

- _No additional notes yet_

**Status:** 🚧 Planned

**Dependencies:**

- Backend user update endpoints
- Profile UI components
- Image upload handling (if custom avatars)

**Components:**

- User profile page/modal (to be implemented)
- `AuthContext.tsx` - User state management
- Backend user service

**Priority:** Medium  
**Complexity:** Medium

---

### 7. **Multi-Factor Authentication (Future)**

> User Story:
>
> As a user, I want to enable two-factor authentication, so that my account has an extra layer of security.

**Acceptance Criteria:**

- [ ] User can enable/disable 2FA in account settings
- [ ] QR code generated for authenticator app setup
- [ ] Backup codes provided for account recovery
- [ ] 2FA required on login when enabled
- [ ] Clear instructions for 2FA setup process
- [ ] Recovery flow for lost authenticator device

Notes:

- _No additional notes yet_

**Status:** 📋 Backlog

**Dependencies:**

- Firebase Auth MFA support
- Authenticator app integration
- Secure backup code storage

**Components:**

- 2FA settings page (future)
- Login flow modifications
- Backend MFA configuration

**Priority:** Low  
**Complexity:** High

---

## Technical Implementation Notes

### Current Architecture

1. **Frontend Authentication Flow:**

   - Firebase Auth handles OAuth and email/password authentication
   - AuthContext provides centralized state management
   - Automatic token injection for all API requests
   - Token refresh with 5-minute buffer

2. **Backend Integration:**

   - Firebase Admin SDK validates tokens
   - User creation/sync on first login
   - Workspace auto-creation for new users
   - Protected API endpoints with auth middleware

3. **Key Features Implemented:**
   - Google OAuth integration
   - Email/password authentication
   - Automatic workspace creation
   - Token refresh logic
   - Session persistence
   - Protected routes
   - Backend user sync

### Security Considerations

- All API requests require valid Firebase ID tokens
- Tokens are never stored in cookies (only memory/session storage)
- Backend validates tokens on every request
- User permissions checked at API level
- Sensitive operations require fresh authentication
