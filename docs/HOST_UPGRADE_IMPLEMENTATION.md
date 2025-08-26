# Host Upgrade Implementation

This document describes the new secure host upgrade system implemented in the Nawartu Syrian Stays application.

## Overview

The previous implementation allowed users to directly update their profile role to "host" by updating the `profiles` table. This was a security vulnerability as it bypassed proper validation and could potentially allow unauthorized role escalation.

The new implementation uses a secure RPC (Remote Procedure Call) function `request_host_upgrade()` that:
- Runs on the server-side with proper security context
- Validates user authentication and permissions
- Prevents unauthorized role changes
- Provides clear success/failure feedback

## Database Changes

### New RPC Function

The `request_host_upgrade()` function is defined in the migration file:
`supabase/migrations/20250825172809_request_host_upgrade_function.sql`

```sql
CREATE OR REPLACE FUNCTION public.request_host_upgrade()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

**Key Features:**
- `SECURITY DEFINER`: Runs with the privileges of the function creator
- `SET search_path TO 'public'`: Prevents search path injection attacks
- Returns `true` on success, `false` on failure
- Includes proper error handling and logging

### Security Improvements

- **Role Escalation Prevention**: The existing `prevent_role_escalation()` trigger prevents direct table updates
- **Server-side Validation**: All role upgrade logic runs on the server
- **Audit Trail**: Role changes are properly logged and tracked

## Frontend Implementation

### 1. Utility Function

Located at `src/lib/hostUpgrade.ts`:

```typescript
export async function requestHostUpgrade(): Promise<HostUpgradeResult> {
  const { data, error } = await supabase
    .rpc('request_host_upgrade')
    .single();
  
  // Returns structured result with success status and message
}
```

### 2. React Hook

Located at `src/hooks/useHostUpgrade.ts`:

```typescript
export function useHostUpgrade(): UseHostUpgradeReturn {
  const [isLoading, setIsLoading] = useState(false);
  
  const upgradeToHost = async (): Promise<HostUpgradeResult> => {
    // Handles loading state and calls utility function
  };
  
  return { isLoading, upgradeToHost, reset };
}
```

### 3. Updated Components

#### BecomeHost.tsx
The main host registration page now uses the new hook:

```typescript
const { isLoading, upgradeToHost } = useHostUpgrade();

const handleSubmit = async (e: React.FormEvent) => {
  const result = await upgradeToHost();
  
  if (result.success) {
    // Handle success
  } else {
    // Handle failure
  }
};
```

#### HostRegistrationButton.tsx
A reusable component that can be used anywhere in the app:

```typescript
export function HostRegistrationButton({ variant, size, className, onSuccess }) {
  const { isLoading, upgradeToHost } = useHostUpgrade();
  
  // Automatically handles loading states and user feedback
}
```

## Usage Examples

### Basic Usage in Any Component

```typescript
import { useHostUpgrade } from '@/hooks/useHostUpgrade';

function MyComponent() {
  const { isLoading, upgradeToHost } = useHostUpgrade();
  
  const handleUpgrade = async () => {
    const result = await upgradeToHost();
    if (result.success) {
      console.log('Upgraded to host!');
    }
  };
  
  return (
    <button onClick={handleUpgrade} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Become Host'}
    </button>
  );
}
```

### Using the Utility Function Directly

```typescript
import { requestHostUpgrade } from '@/lib/hostUpgrade';

async function handleUpgrade() {
  const result = await requestHostUpgrade();
  // Handle result
}
```

### Using the Reusable Button Component

```typescript
import { HostRegistrationButton } from '@/components/HostRegistrationButton';

function MyPage() {
  return (
    <div>
      <h1>Welcome to Nawartu</h1>
      <HostRegistrationButton 
        variant="outline" 
        size="lg"
        onSuccess={() => console.log('Host upgrade successful!')}
      />
    </div>
  );
}
```

## Migration Guide

### From Old Implementation

**Before (Direct table update):**
```typescript
const { error } = await supabase
  .from("profiles")
  .update({ role: "host" })
  .eq("user_id", user.id);
```

**After (Using RPC function):**
```typescript
const result = await requestHostUpgrade();
if (result.success) {
  // Handle success
}
```

### Benefits of New Implementation

1. **Security**: Server-side validation prevents unauthorized role changes
2. **Consistency**: All role upgrades go through the same validation logic
3. **Maintainability**: Centralized upgrade logic is easier to modify and debug
4. **User Experience**: Better error handling and feedback
5. **Audit Trail**: All role changes are properly logged

## Error Handling

The new system provides structured error responses:

```typescript
interface HostUpgradeResult {
  success: boolean;
  message: string;
}
```

**Common Error Scenarios:**
- User not authenticated
- User already a host/admin
- Database connection issues
- Server-side validation failures

## Testing

To test the new implementation:

1. **Apply the migration** to create the RPC function
2. **Test with authenticated user** who is not a host
3. **Verify role update** in the database
4. **Test error cases** (already host, unauthenticated, etc.)

## Future Enhancements

Potential improvements to consider:

1. **Additional Validation**: Email verification, profile completion requirements
2. **Admin Approval**: Require admin approval for host upgrades
3. **Rate Limiting**: Prevent rapid upgrade attempts
4. **Notification System**: Email notifications for successful upgrades
5. **Analytics**: Track upgrade patterns and success rates

## Security Considerations

- The RPC function runs with elevated privileges (`SECURITY DEFINER`)
- All user input is validated server-side
- Role changes are logged for audit purposes
- The function prevents unauthorized role escalation
- Proper error handling prevents information leakage
