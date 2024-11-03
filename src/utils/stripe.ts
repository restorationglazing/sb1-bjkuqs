import { loadStripe } from '@stripe/stripe-js';
import { auth, addPremiumUser, getUserData, verifyPremiumStatus, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripePromise = loadStripe('pk_test_51QGTC8Csm96Q1cqsYUBh721olyEc8XZGdRWfVXYMGgvjGoXzJvJRYvnZ8pdG6OPDY7yls084RrRiC2naDRKm2qGm00GAxAEnhT');

const getDomain = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('netlify.app') || !hostname.includes('localhost')) {
    return `https://${hostname}`;
  }
  
  return 'http://localhost:5173';
};

export const handlePremiumCheckout = async () => {
  if (!auth.currentUser) {
    throw new Error('Must be signed in to upgrade to premium');
  }

  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    const domain = getDomain();

    const session = {
      lineItems: [{
        price: 'price_1QH2KpCsm96Q1cqshQTDWV37',
        quantity: 1,
      }],
      mode: 'subscription',
      successUrl: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${domain}/`,
      clientReferenceId: auth.currentUser.uid,
      customerEmail: auth.currentUser.email,
    };

    const result = await stripe.redirectToCheckout(session);
    
    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const handleSuccessfulPayment = async (sessionId: string) => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user found during payment completion');
  }

  try {
    // Immediately mark user as premium in Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      isPremium: true,
      premiumSince: new Date().toISOString(),
      lastVerified: new Date().toISOString(),
      stripeSessionId: sessionId,
      stripeSubscriptionActive: true
    });

    // Add to premium users collection
    if (auth.currentUser.email) {
      await addPremiumUser(auth.currentUser.email);
    }

    // Force verify premium status
    const verificationResult = await verifyPremiumStatus(auth.currentUser.uid);
    if (!verificationResult.isPremium) {
      throw new Error('Premium status verification failed after payment');
    }

    // Update local storage cache
    localStorage.setItem('premiumStatus', JSON.stringify({
      isPremium: true,
      timestamp: Date.now(),
      userId: auth.currentUser.uid,
      sessionId
    }));

    // Force refresh user data
    await getUserData(auth.currentUser.uid, true);

    return true;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};