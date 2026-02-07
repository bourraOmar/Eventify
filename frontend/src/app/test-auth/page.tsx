'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';

export default function TestAuthPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [localToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [localUser] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('user') : null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const testAuth = async () => {
    setTestError(null);
    setTestResult(null);
    try {
      const response = await api.get('/auth/me');
      setTestResult(response.data);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setTestError(error.response?.data?.message || error.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Authentication Test Page</h1>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Auth Context State</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>Token (from context):</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>LocalStorage State</h2>
        <p><strong>Token:</strong> {localToken ? `${localToken.substring(0, 20)}...` : 'null'}</p>
        <p><strong>User:</strong> {localUser || 'null'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testAuth}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test /auth/me Endpoint
        </button>
      </div>

      {testResult && (
        <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>✅ Success!</h3>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      {testError && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
          <h3>❌ Error</h3>
          <p>{testError}</p>
        </div>
      )}
    </div>
  );
}
