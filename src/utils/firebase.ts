import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCyZX1BlQXRnQ92xf-s-fHlMrsG4Dxmng",
  authDomain: "cellular-unity-440317-d2.firebaseapp.com",
  projectId: "cellular-unity-440317-d2",
  storageBucket: "cellular-unity-440317-d2.firebasestorage.app",
  messagingSenderId: "611379941787",
  appId: "1:611379941787:web:2dd7a30444ad7bef99d13e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserData {
  username: string;
  email: string;
  isPremium: boolean;
  premiumSince?: string;
  stripeSessionId?: string;
  stripeSubscriptionActive?: boolean;
  stripeCustomerId?: string;
  savedRecipes: any[];
  mealPlans: any[];
  preferences: {
    dietaryRestrictions: string[];
    servingSize: number;
    theme: 'light' | 'dark';
  };
  lastVerified?: string;
  createdAt: string;
  updatedAt: string;
}

export const getUserData = async (userId: string, forceRefresh = false): Promise<UserData> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data() as UserData;
    
    if (forceRefresh) {
      try {
        const verificationResult = await verifyPremiumStatus(userId);
        if (verificationResult.isPremium !== userData.isPremium) {
          await updateDoc(userRef, {
            isPremium: verificationResult.isPremium,
            lastVerified: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          return { ...userData, isPremium: verificationResult.isPremium };
        }
      } catch (error) {
        console.error('Error during premium verification:', error);
      }
    }
    
    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const addPremiumUser = async (email: string) => {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const normalizedEmail = email.toLowerCase();
    
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }

    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const premiumUsersRef = collection(db, 'premiumUsers');
    const q = query(premiumUsersRef, where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    let premiumDocId;

    if (!querySnapshot.empty) {
      premiumDocId = querySnapshot.docs[0].id;
      await updateDoc(doc(premiumUsersRef, premiumDocId), {
        active: true,
        updatedAt: new Date().toISOString(),
        stripeSubscriptionActive: true,
        userId: userId
      });
    } else {
      const premiumUserData = {
        email: normalizedEmail,
        userId: userId,
        active: true,
        stripeSubscriptionActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(premiumUsersRef);
      await setDoc(docRef, premiumUserData);
      premiumDocId = docRef.id;
    }

    await updateDoc(userRef, {
      isPremium: true,
      premiumSince: new Date().toISOString(),
      email: normalizedEmail,
      premiumDocId,
      stripeSubscriptionActive: true,
      updatedAt: new Date().toISOString(),
      lastVerified: new Date().toISOString()
    });

    try {
      const verificationResult = await verifyPremiumStatus(userId);
      if (!verificationResult.isPremium) {
        console.warn('Premium status verification failed after update');
      }
    } catch (error) {
      console.error('Error during premium verification:', error);
    }

    return true;
  } catch (error) {
    console.error('Error in addPremiumUser:', error);
    throw error;
  }
};

export const verifyPremiumStatus = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return {
        isPremium: false,
        lastVerified: new Date().toISOString(),
        error: 'User not found'
      };
    }
    
    const userData = userDoc.data();
    
    if (!userData.email) {
      return {
        isPremium: false,
        lastVerified: new Date().toISOString(),
        error: 'User email not found'
      };
    }

    const premiumUsersRef = collection(db, 'premiumUsers');
    const q = query(
      premiumUsersRef,
      where('email', '==', userData.email.toLowerCase()),
      where('active', '==', true),
      where('stripeSubscriptionActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const isPremium = !querySnapshot.empty;
    
    await updateDoc(userRef, {
      isPremium,
      lastVerified: new Date().toISOString(),
      stripeSubscriptionActive: isPremium,
      updatedAt: new Date().toISOString()
    });
    
    return {
      isPremium,
      lastVerified: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error verifying premium status:', error);
    return {
      isPremium: false,
      lastVerified: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error during verification'
    };
  }
};

export const createUser = async (email: string, password: string, username: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    
    const userData: UserData = {
      username,
      email: email.toLowerCase(),
      isPremium: false,
      savedRecipes: [],
      mealPlans: [],
      preferences: {
        dietaryRestrictions: [],
        servingSize: 2,
        theme: 'light'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    try {
      const verificationResult = await verifyPremiumStatus(userCredential.user.uid);
      if (verificationResult.isPremium) {
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          isPremium: true,
          lastVerified: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error during initial premium verification:', error);
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('auth/email-already-in-use');
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    try {
      const verificationResult = await verifyPremiumStatus(userCredential.user.uid);
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        isPremium: verificationResult.isPremium,
        lastVerified: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error during sign-in premium verification:', error);
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error.code === 'auth/invalid-credential') {
      throw new Error('auth/invalid-login');
    }
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};