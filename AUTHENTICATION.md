# Villa Ekinoks Admin App - Authentication Documentation

## API Configuration

The application is configured to use the Villa Ekinoks API at: `https://api.villaekinoks.com/api/v1/`

All API responses follow the `GenericApiResponse<T>` structure:

```typescript
type GenericApiResponse<T> = {
  code: number;
  message: string;
  responsecode: string;
  object: T;
  resulthashcode?: string;
};
```

## Authentication Flow

The authentication process consists of two steps:

### Step 1: Initial Login
- **Endpoint**: `POST /oauth/login`
- **Request Body**: `AppUserLogin_WC_MLS_XAction`
  ```typescript
  {
    login: string;      // Username or email
    password: string;   // User password
  }
  ```
- **Response**: `AppUserLogin_WC_MLS_XAction_Response`
  ```typescript
  {
    ackid: string;
    requestid: string;  // Used for verification step
  }
  ```

### Step 2: Login Verification
- **Endpoint**: `POST /verification-pair-controller/login-verifications`
- **Request Body**: `Verify_LoginVerification_XAction`
  ```typescript
  {
    requestid: string;  // From step 1 response
    code: string;       // Verification code from user
  }
  ```
- **Response**: `TokenizedUser`
  ```typescript
  {
    accesstoken: string;
    refreshtoken: string;
    user: AppUser;
  }
  ```

## User Types

```typescript
type AppUser = {
  id: string;
  personalinfo: AppUserPersonalInfo;
}

type AppUserPersonalInfo = {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phonenumber: string;
  identitynumber: string;
}
```

## Usage Examples

### Using Authentication Hooks

```typescript
import { useLogin, useVerifyLogin, useAuthState } from '@/hooks/api';

function LoginComponent() {
  const loginMutation = useLogin();
  const verifyLoginMutation = useVerifyLogin();
  const { isAuthenticated } = useAuthState();

  // Step 1: Login
  const handleLogin = async (credentials: AppUserLogin_WC_MLS_XAction) => {
    const response = await loginMutation.mutateAsync(credentials);
    // Store requestId for verification step
    setRequestId(response.requestid);
  };

  // Step 2: Verify
  const handleVerification = async (code: string) => {
    await verifyLoginMutation.mutateAsync({
      requestid: requestId,
      code: code,
    });
    // Tokens are automatically stored in localStorage
  };
}
```

### Using Authentication Services Directly

```typescript
import { authApi } from '@/lib/services';

// Step 1: Login
const loginResponse = await authApi.login({
  login: 'username',
  password: 'password'
});

// Step 2: Verify
const tokenizedUser = await authApi.verifyLogin({
  requestid: loginResponse.requestid,
  code: '123456'
});

// Check authentication status
const isLoggedIn = authApi.isAuthenticated();

// Get stored tokens
const accessToken = authApi.getAccessToken();
const refreshToken = authApi.getRefreshToken();

// Logout
await authApi.logout();
```

## Token Storage

Tokens are automatically stored in `localStorage`:
- `accesstoken`: Access token for API requests
- `refreshtoken`: Refresh token for token renewal

The API client automatically includes the access token in the `Authorization` header for authenticated requests.

## Error Handling

- **401 Unauthorized**: Automatically clears tokens and redirects to login
- **Login failures**: Check credentials and try again
- **Verification failures**: Check verification code and try again

## Security Notes

- Tokens are stored in localStorage for persistence
- Access tokens are automatically attached to API requests
- Unauthorized responses trigger automatic logout
- Always use HTTPS in production