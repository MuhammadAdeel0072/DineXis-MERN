import { AuthProvider, useAuth, useProfile } from './AuthContext';

/**
 * UserContext.jsx
 * This file serves as a compatibility layer and bridge to AuthContext.jsx.
 * It ensures that legacy imports or specific 'UserContext' requirements 
 * are met while maintaining a single source of truth for authentication.
 */

// Re-export the AuthProvider and hooks
export { AuthProvider, useAuth, useProfile };

// If anything specifically needs the "UserProvider" name:
export const UserProvider = AuthProvider;

