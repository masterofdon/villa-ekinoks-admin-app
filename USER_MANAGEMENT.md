# User Authentication & Token Management

This document explains how the authentication system works in the Villa Ekinoks Admin App, including token storage and user data management.

## Overview

The application uses a two-step authentication process with the Villa Ekinoks API:

1. **Login Request** - User provides username/password
2. **Verification** - User enters verification code
3. **Token Storage** - Tokens and user data are stored in localStorage
4. **Automatic Token Usage** - All API requests automatically include the access token

## Token Storage

After successful authentication, the following data is stored in localStorage:

### Stored Data
```typescript
// Access token for API authentication
localStorage.setItem('accesstoken', tokenizedUser.accesstoken);

// Refresh token for token renewal
localStorage.setItem('refreshtoken', tokenizedUser.refreshtoken);

// User profile information
localStorage.setItem('user', JSON.stringify(tokenizedUser.user));
```

### User Data Structure
```typescript
type AppUser = {
  id: string;
  personalinfo: AppUserPersonalInfo;
};

type AppUserPersonalInfo = {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phonenumber: string;
  identitynumber: string;
};
```

## API Integration

### Automatic Token Inclusion

All API requests automatically include the access token via an Axios interceptor:

```typescript
// Request interceptor in src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accesstoken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

When a 401 (Unauthorized) response is received, the system automatically:
- Clears all stored authentication data
- Redirects the user to the login page

```typescript
// Response interceptor in src/lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accesstoken');
      localStorage.removeItem('refreshtoken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## React Hooks for Authentication

### useCurrentUser Hook

Get the current user data with reactive updates:

```typescript
import { useCurrentUser } from '@/hooks/api';

function MyComponent() {
  const { data: user, isLoading, error } = useCurrentUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  
  return (
    <div>
      <h1>Hello, {user.personalinfo.firstname}!</h1>
      <p>Email: {user.personalinfo.email}</p>
    </div>
  );
}
```

### useAuthState Hook

Get authentication state information:

```typescript
import { useAuthState } from '@/hooks/api';

function MyComponent() {
  const { isAuthenticated, user, accessToken } = useAuthState();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome back!</div>;
}
```

### Authentication Mutations

```typescript
// Login (step 1)
const loginMutation = useLogin();
await loginMutation.mutateAsync({
  login: 'username',
  password: 'password'
});

// Verify login (step 2)
const verifyLoginMutation = useVerifyLogin();
await verifyLoginMutation.mutateAsync({
  requestid: 'request_id_from_step_1',
  code: 'verification_code'
});

// Logout
const logoutMutation = useLogout();
await logoutMutation.mutateAsync();
```

## User Profile Components

### UserProfile Component

Display user information:

```typescript
import { UserProfile } from '@/components/user/UserProfile';

<UserProfile className="p-4" />
```

### UserAvatar Component

Display user initials in a circular avatar:

```typescript
import { UserAvatar } from '@/components/user/UserProfile';

<UserAvatar className="w-10 h-10" />
```

## Route Protection

### AuthGuard Component

Protect routes that require authentication:

```typescript
import AuthGuard from '@/components/auth/AuthGuard';

function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated users</div>
    </AuthGuard>
  );
}
```

## Utility Functions

### Authentication Utilities

```typescript
import { 
  getStoredTokens, 
  getStoredUser, 
  clearAuthTokens, 
  isAuthenticated 
} from '@/lib/utils';

// Check if user is authenticated
if (isAuthenticated()) {
  console.log('User is logged in');
}

// Get stored tokens
const tokens = getStoredTokens();
console.log('Access token:', tokens?.accessToken);

// Get stored user data
const user = getStoredUser();
console.log('User email:', user?.personalinfo.email);

// Clear all auth data
clearAuthTokens();
```

## Service Functions

### Direct API Access

```typescript
import { authApi } from '@/lib/services';

// Check authentication status
if (authApi.isAuthenticated()) {
  console.log('User is authenticated');
}

// Get current user
const user = authApi.getCurrentUser();
console.log('Current user:', user);

// Get tokens
const accessToken = authApi.getAccessToken();
const refreshToken = authApi.getRefreshToken();
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage for simplicity. For production, consider more secure storage options.

2. **Token Expiration**: The system handles 401 responses by clearing tokens and redirecting to login.

3. **HTTPS**: All API requests go to HTTPS endpoints to ensure secure token transmission.

4. **Token Validation**: The API server validates tokens on each request.

## Example: Complete Authentication Flow

```typescript
import { useLogin, useVerifyLogin, useCurrentUser } from '@/hooks/api';

function LoginFlow() {
  const [step, setStep] = useState('login');
  const [requestId, setRequestId] = useState('');
  
  const loginMutation = useLogin();
  const verifyMutation = useVerifyLogin();
  const { data: user } = useCurrentUser();

  const handleLogin = async (credentials) => {
    const response = await loginMutation.mutateAsync(credentials);
    setRequestId(response.requestid);
    setStep('verification');
  };

  const handleVerification = async (code) => {
    await verifyMutation.mutateAsync({
      requestid: requestId,
      code: code
    });
    // User is now logged in, tokens are stored, redirect to dashboard
    router.push('/dashboard');
  };

  // After successful login, user data is available
  if (user) {
    return <div>Welcome, {user.personalinfo.firstname}!</div>;
  }

  return (
    <div>
      {step === 'login' ? (
        <LoginForm onSubmit={handleLogin} />
      ) : (
        <VerificationForm onSubmit={handleVerification} />
      )}
    </div>
  );
}
```

This system ensures that once a user is authenticated, their tokens are automatically included in all API requests, and their profile information is easily accessible throughout the application.