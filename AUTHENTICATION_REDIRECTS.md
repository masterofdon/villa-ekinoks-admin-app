# Authentication Redirects & Route Protection

This document explains how authentication-based redirects work in the Villa Ekinoks Admin App.

## Automatic Redirects

### Root Path (`/`)

When users visit the root URL (`/`), the app automatically checks their authentication status:

```typescript
// src/app/page.tsx
export default function HomePage() {
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard'); // ✅ Logged in users go to dashboard
    } else {
      router.push('/login');     // ❌ Non-authenticated users go to login
    }
  }, [isAuthenticated, router]);
}
```

**Behavior:**
- ✅ **Authenticated users** → Redirected to `/dashboard`
- ❌ **Non-authenticated users** → Redirected to `/login`

### Login Page (`/login`)

The login page prevents already authenticated users from accessing it:

```typescript
// src/app/login/page.tsx
export default function LoginPage() {
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard'); // ✅ Already logged in users go to dashboard
    }
  }, [isAuthenticated, router]);
}
```

**Behavior:**
- ✅ **Authenticated users** → Redirected to `/dashboard`
- ❌ **Non-authenticated users** → Can access login form

## Protected Routes

All administrative pages are protected with the `AuthGuard` component:

### Protected Pages:
- `/dashboard` - Main dashboard
- `/villas` - Villa listings
- `/villa-management/[id]` - Villa creation/editing

### AuthGuard Implementation

```typescript
// src/components/auth/AuthGuard.tsx
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login'); // ❌ Non-authenticated users redirected to login
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return fallback || <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}
```

**Usage in protected pages:**
```typescript
// Example: Dashboard page
export default function DashboardPage() {
  return (
    <AuthGuard>
      <Sidebar>
        {/* Dashboard content */}
      </Sidebar>
    </AuthGuard>
  );
}
```

## Complete User Journey

### 1. New User Visit
```
User visits: https://app.villaekinoks.com
↓
Root page (/) checks authentication
↓
❌ Not authenticated
↓
Redirect to: /login
```

### 2. Successful Login
```
User fills login form
↓
Step 1: Username/password → Gets requestId
↓
Step 2: Verification code → Gets tokens + user data
↓
Tokens stored in localStorage
↓
Redirect to: /dashboard
```

### 3. Authenticated User Returns
```
User visits: https://app.villaekinoks.com
↓
Root page (/) checks authentication
↓
✅ Authenticated (tokens found in localStorage)
↓
Redirect to: /dashboard
```

### 4. Direct Access to Protected Route
```
User visits: https://app.villaekinoks.com/villas
↓
AuthGuard checks authentication
↓
✅ Authenticated → Show villas page
❌ Not authenticated → Redirect to /login
```

### 5. Authenticated User Visits Login
```
User visits: https://app.villaekinoks.com/login
↓
Login page checks authentication
↓
✅ Already authenticated
↓
Redirect to: /dashboard
```

## Route Map

| Route | Authentication Required | Redirect Behavior |
|-------|------------------------|-------------------|
| `/` | No | ✅ Auth → `/dashboard`<br>❌ No Auth → `/login` |
| `/login` | No | ✅ Auth → `/dashboard`<br>❌ No Auth → Show login form |
| `/dashboard` | Yes | ✅ Auth → Show dashboard<br>❌ No Auth → `/login` |
| `/villas` | Yes | ✅ Auth → Show villas<br>❌ No Auth → `/login` |
| `/villa-management/*` | Yes | ✅ Auth → Show form<br>❌ No Auth → `/login` |

## Authentication State Detection

The app uses several methods to determine authentication state:

### 1. localStorage Token Check
```typescript
// Quick client-side check
const isAuthenticated = !!localStorage.getItem('accesstoken');
```

### 2. React Query Hook
```typescript
// Reactive authentication state
const { isAuthenticated, user } = useAuthState();
```

### 3. API Response Handling
```typescript
// Automatic logout on 401 responses
if (error.response?.status === 401) {
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

## Security Considerations

### Token Validation
- Tokens are validated on the server side for each API request
- Invalid/expired tokens result in 401 responses
- 401 responses trigger automatic logout and redirect to login

### Client-Side Checks
- Client-side authentication checks are for UX optimization only
- Server-side validation is the authoritative security layer
- All API endpoints require valid authentication

### Session Persistence
- Authentication state persists across browser sessions via localStorage
- Users remain logged in until tokens expire or they manually logout
- Page refreshes maintain authentication state

## Implementation Details

### useAuthState Hook
```typescript
export const useAuthState = () => {
  return {
    isAuthenticated: authApi.isAuthenticated(),
    accessToken: authApi.getAccessToken(),
    refreshToken: authApi.getRefreshToken(),
    user: authApi.getCurrentUser(),
  };
};
```

### Route Protection Pattern
```typescript
// All protected pages follow this pattern:
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <Sidebar>
        {/* Page content */}
      </Sidebar>
    </AuthGuard>
  );
}
```

This authentication system ensures:
- ✅ Seamless user experience with automatic redirects
- 🔒 Security through route protection
- 🔄 Persistent login sessions
- 🚀 Fast authentication state checks
- 📱 Consistent behavior across all pages