import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  type User, 
  type UserCredential,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query,
  where
} from 'firebase/firestore';

interface UserData {
  username: string;
  email: string;
  isAdmin?: boolean;
  createdAt?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<UserCredential | void>;
  login: (emailOrUsername: string, password: string) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  getUserData: (userId: string) => Promise<UserData | null>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  function isAdmin(): boolean {
    return Boolean(userData?.isAdmin);
  }

  // Check if this is the first user
  const checkIfFirstUser = async (): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.empty;
    } catch (error) {
      // Silent fail for production - return false as safe default
      return false;
    }
  };

  // Get user data by UID
  const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      // Silent fail for production
      return null;
    }
  };

  async function fetchUserData(user: User) {
    if (!user) return;
    
    try {
      const data = await getUserData(user.uid);
      if (data) {
        setUserData(data);
      } else {
        // If no user data exists yet, create a basic record with email
        setUserData({
          username: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          isAdmin: false
        });
      }
    } catch (error) {
      // Silent fail for production
    }
  }

  // Invitation code validation removed

  async function signup(email: string, password: string, username: string) {
    try {
      // Trim and normalize inputs
      const trimmedEmail = email.trim().toLowerCase();
      
      // Check if this is the first user
      const firstUser = await checkIfFirstUser();
      
      // Create user account
      const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      
      // Store user data in Firestore
      const userData: UserData = {
        username,
        email: trimmedEmail,
        isAdmin: firstUser, // First user becomes admin automatically
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      setUserData(userData);
      
      return result;
    } catch (error) {
      // Silent fail for production
      throw error;
    }
  }

  async function findEmailByUsername(username: string): Promise<string | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Get the first matching user's email
      const userData = snapshot.docs[0].data();
      return userData.email || null;
    } catch (error) {
      // Silent fail for production
      return null;
    }
  }

  async function login(emailOrUsername: string, password: string) {
    try {
      const username = emailOrUsername.trim();
      const userPassword = password.trim();
      
      // Check for static admin credentials
      if (username === 'mahdiassi' && userPassword === '11441144') {
        // Create a mock user object for static admin
        const mockUser = {
          uid: 'static-admin-uid',
          email: 'mahdiassi@admin.com',
          displayName: 'mahdiassi',
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          providerId: 'password'
        };
        
        // Set user data for static admin
        const adminUserData = {
          username: 'mahdiassi',
          email: 'mahdiassi@admin.com',
          isAdmin: true,
          createdAt: new Date()
        };
        
        setCurrentUser(mockUser as any);
        setUserData(adminUserData);
        
        // Save static admin session to localStorage
        try {
          localStorage.setItem('static-admin-session', 'true');
        } catch (error) {
          // Silent fail for production
        }
        
        return { user: mockUser } as any;
      }
      
      // Fallback to Firebase authentication for other users
      let emailToUse = username;
      
      // Check if it looks like an email (contains @)
      if (!emailToUse.includes('@')) {
        // It's probably a username, try to find the email
        const foundEmail = await findEmailByUsername(emailToUse);
        if (!foundEmail) {
          throw new Error('Username not found');
        }
        emailToUse = foundEmail;
      }
      
      const result = await signInWithEmailAndPassword(auth, emailToUse, userPassword);
      await fetchUserData(result.user);
      return result;
    } catch (error) {
      // Silent fail for production
      throw error;
    }
  }

  async function logout() {
    try {
      // Check if current user is static admin
      if (currentUser?.uid === 'static-admin-uid') {
        setCurrentUser(null);
        setUserData(null);
        
        // Clear static admin session from localStorage
        try {
          localStorage.removeItem('static-admin-session');
        } catch (error) {
          // Silent fail for production
        }
        
        return;
      }
      
      // Regular Firebase logout
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      // Silent fail for production
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      // Silent fail for production
      throw error;
    }
  }

  useEffect(() => {
    try {
      // Check for static admin session in localStorage
      const savedAdminSession = localStorage.getItem('static-admin-session');
      if (savedAdminSession === 'true') {
        // Restore static admin session
        const mockUser = {
          uid: 'static-admin-uid',
          email: 'mahdiassi@admin.com',
          displayName: 'mahdiassi',
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          providerId: 'password'
        };
        
        const adminUserData = {
          username: 'mahdiassi',
          email: 'mahdiassi@admin.com',
          isAdmin: true,
          createdAt: new Date()
        };
        
        setCurrentUser(mockUser as any);
        setUserData(adminUserData);
        setLoading(false);
        return;
      }

      // Regular Firebase authentication
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user) {
          await fetchUserData(user);
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      }, (_error) => {
        // Silent fail for production
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      // Silent fail for production
      setLoading(false);
      return () => {};
    }
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    getUserData,
    resetPassword,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 