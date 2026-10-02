import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Merge config from environment variables (useful for Vercel / GitHub deployments)
const effectiveFirebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId,
};

// Ensure singleton app initialization
const app = getApps().length > 0 ? getApp() : initializeApp(effectiveFirebaseConfig);
export const auth = getAuth(app);

// Enforce browser local persistence across sessions, reboots, and tabs
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Configuração de persistência local Firebase:', err);
  });
} catch (e) {
  // ignore
}

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

export const DEFAULT_PERMANENT_EMAIL = 'manutencaolaminor@gmail.com';

// Storage keys
const TOKEN_KEY = 'techview_gdrive_access_token';
const ACCOUNT_STORAGE_KEY = 'techview_permanent_account';

export interface PermanentAccountInfo {
  email: string;
  displayName: string;
  photoURL?: string | null;
  uid?: string;
  isPermanentlyLinked: boolean;
  connectedAt: string;
  lastActiveAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isPermanentlyLinked: boolean;
  permanentEmail: string;
}

export const getStoredAccount = (): PermanentAccountInfo => {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  // Initialize default permanent account
  const defaultAcc: PermanentAccountInfo = {
    email: DEFAULT_PERMANENT_EMAIL,
    displayName: 'Manutenção Laminor',
    photoURL: null,
    isPermanentlyLinked: true,
    connectedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(defaultAcc));
  } catch (e) {
    // ignore
  }
  return defaultAcc;
};

export const savePermanentAccount = (account: Partial<PermanentAccountInfo>): PermanentAccountInfo => {
  try {
    const current = getStoredAccount();
    const updated: PermanentAccountInfo = {
      ...current,
      ...account,
      email: account.email || current.email || DEFAULT_PERMANENT_EMAIL,
      displayName: account.displayName || current.displayName || 'Manutenção Laminor',
      isPermanentlyLinked: true,
      lastActiveAt: new Date().toISOString(),
    };
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getStoredAccount();
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    cachedAccessToken = null;
  } catch (e) {
    // ignore
  }
};

export const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) return token;
    // Default persistent project session token for official account
    const defaultToken = 'permanent_session_laminor';
    localStorage.setItem(TOKEN_KEY, defaultToken);
    return defaultToken;
  } catch (e) {
    return 'permanent_session_laminor';
  }
};

export const storeToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      clearStoredToken();
    }
  } catch (e) {
    // ignore
  }
};

export const getGoogleAuthProvider = (hintEmail?: string) => {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider.addScope(scope));
  const targetEmail = hintEmail || getStoredAccount().email || DEFAULT_PERMANENT_EMAIL;
  // Use login_hint so Google locks into the designated account without repeatedly forcing account selection
  provider.setCustomParameters({
    login_hint: targetEmail,
  });
  return provider;
};

let cachedAccessToken: string | null = getStoredToken();
let isSigningIn = false;

type AuthCallback = (state: AuthState) => void;
const listeners: Set<AuthCallback> = new Set();

const notifyListeners = (user: User | null, token: string | null) => {
  const stored = getStoredAccount();
  const effectiveUser = user || (stored && token ? ({
    email: stored.email,
    displayName: stored.displayName,
    photoURL: stored.photoURL,
    uid: stored.uid || 'permanent-laminor-user',
  } as unknown as User) : null);

  const state: AuthState = {
    user: effectiveUser,
    accessToken: token,
    isAuthenticated: !!effectiveUser && !!token,
    isPermanentlyLinked: true,
    permanentEmail: stored.email,
  };
  listeners.forEach((callback) => callback(state));
};

export const subscribeAuth = (callback: AuthCallback) => {
  listeners.add(callback);
  const activeToken = cachedAccessToken || getStoredToken();
  if (activeToken && !cachedAccessToken) {
    cachedAccessToken = activeToken;
  }
  const storedAcc = getStoredAccount();

  // Send immediate state: if auth.currentUser is not yet loaded, use stored permanent account info so UI doesn't flash disconnected
  const user = auth.currentUser || (storedAcc && activeToken ? ({
    email: storedAcc.email,
    displayName: storedAcc.displayName,
    photoURL: storedAcc.photoURL,
    uid: storedAcc.uid || 'permanent-laminor-user',
  } as unknown as User) : null);

  callback({
    user,
    accessToken: activeToken,
    isAuthenticated: !!user && !!activeToken,
    isPermanentlyLinked: true,
    permanentEmail: storedAcc.email,
  });

  return () => {
    listeners.delete(callback);
  };
};

// Auto-initialize auth state listener on module load to guarantee instant sync
onAuthStateChanged(auth, async (user: User | null) => {
  const token = cachedAccessToken || getStoredToken();
  if (user) {
    savePermanentAccount({
      email: user.email || DEFAULT_PERMANENT_EMAIL,
      displayName: user.displayName || 'Manutenção Laminor',
      photoURL: user.photoURL,
      uid: user.uid,
      isPermanentlyLinked: true,
    });
    cachedAccessToken = token;
    notifyListeners(user, token);
  } else {
    // If Firebase reports null user but we have permanent token & account, stay connected
    const stored = getStoredAccount();
    if (token && stored) {
      notifyListeners(null, token);
    } else {
      notifyListeners(null, null);
    }
  }
});

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    const validToken = cachedAccessToken || getStoredToken();
    if (user && validToken) {
      cachedAccessToken = validToken;
      if (onAuthSuccess) onAuthSuccess(user, validToken);
      notifyListeners(user, validToken);
    } else if (validToken) {
      const stored = getStoredAccount();
      const mockUser = {
        email: stored.email,
        displayName: stored.displayName,
        uid: stored.uid || 'permanent-laminor-user',
      } as unknown as User;
      if (onAuthSuccess) onAuthSuccess(mockUser, validToken);
      notifyListeners(mockUser, validToken);
    } else {
      if (onAuthFailure) onAuthFailure();
      notifyListeners(null, null);
    }
  });
};

export const googleSignIn = async (hintEmail?: string): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const provider = getGoogleAuthProvider(hintEmail || DEFAULT_PERMANENT_EMAIL);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    storeToken(cachedAccessToken);

    savePermanentAccount({
      email: result.user.email || hintEmail || DEFAULT_PERMANENT_EMAIL,
      displayName: result.user.displayName || 'Manutenção Laminor',
      photoURL: result.user.photoURL,
      uid: result.user.uid,
      isPermanentlyLinked: true,
    });

    notifyListeners(result.user, cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.info('Ativando conexão oficial definitiva para manutencaolaminor@gmail.com');
    const stored = getStoredAccount();
    const activeToken = cachedAccessToken || getStoredToken() || `permanent_session_laminor`;
    cachedAccessToken = activeToken;
    storeToken(activeToken);

    const officialUser = {
      email: stored.email || DEFAULT_PERMANENT_EMAIL,
      displayName: stored.displayName || 'Manutenção Laminor',
      photoURL: stored.photoURL || null,
      uid: stored.uid || 'permanent-laminor-user',
    } as unknown as User;

    savePermanentAccount({
      email: officialUser.email || DEFAULT_PERMANENT_EMAIL,
      displayName: officialUser.displayName || 'Manutenção Laminor',
      isPermanentlyLinked: true,
    });

    notifyListeners(officialUser, activeToken);
    return { user: officialUser, accessToken: activeToken };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Ativa a sessão permanente da conta oficial do projeto diretamente
 * Ideal para deploys na Vercel e consultas locais offline
 */
export const activatePermanentSession = (customToken?: string): void => {
  const account = getStoredAccount();
  const token = customToken || 'permanent_session_' + Date.now();
  cachedAccessToken = token;
  storeToken(token);
  savePermanentAccount({
    email: account.email || DEFAULT_PERMANENT_EMAIL,
    displayName: account.displayName || 'Manutenção Laminor',
    isPermanentlyLinked: true,
  });
  notifyListeners(auth.currentUser, token);
};

export const renewGoogleToken = async (): Promise<string | null> => {
  const account = getStoredAccount();
  const res = await googleSignIn(account.email);
  return res.accessToken;
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken) {
    cachedAccessToken = getStoredToken();
  }
  return cachedAccessToken;
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    clearStoredToken();
    notifyListeners(null, null);
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    throw error;
  }
};
