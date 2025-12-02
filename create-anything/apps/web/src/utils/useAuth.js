import { useCallback } from 'react';
import { signIn, signOut } from "@auth/create/react";
import { logger } from './logger';

function useAuth() {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = useCallback(async (options) => {
    logger.auth('Sign in attempt started', null, { provider: 'credentials' });
    
    try {
      const result = await signIn("credentials-signin", {
        ...options,
        callbackUrl: callbackUrl ?? options.callbackUrl
      });
      
      if (result?.error) {
        logger.error('Sign in failed', result.error, { provider: 'credentials' });
      } else {
        logger.auth('Sign in successful', null, { provider: 'credentials' });
      }
      
      return result;
    } catch (error) {
      logger.error('Sign in error', error, { provider: 'credentials' });
      throw error;
    }
  }, [callbackUrl]);

  const signUpWithCredentials = useCallback(async (options) => {
    logger.auth('Sign up attempt started', null, { provider: 'credentials' });
    
    try {
      const result = await signIn("credentials-signup", {
        ...options,
        callbackUrl: callbackUrl ?? options.callbackUrl
      });
      
      if (result?.error) {
        logger.error('Sign up failed', result.error, { provider: 'credentials' });
      } else {
        logger.auth('Sign up successful', null, { provider: 'credentials' });
      }
      
      return result;
    } catch (error) {
      logger.error('Sign up error', error, { provider: 'credentials' });
      throw error;
    }
  }, [callbackUrl]);

  const signInWithGoogle = useCallback(async (options) => {
    logger.auth('Sign in attempt started', null, { provider: 'google' });
    
    try {
      const result = await signIn("google", {
        ...options,
        callbackUrl: callbackUrl ?? options.callbackUrl
      });
      
      if (result?.error) {
        logger.error('Sign in failed', result.error, { provider: 'google' });
      } else {
        logger.auth('Sign in successful', null, { provider: 'google' });
      }
      
      return result;
    } catch (error) {
      logger.error('Sign in error', error, { provider: 'google' });
      throw error;
    }
  }, [callbackUrl]);

  const signInWithFacebook = useCallback(async (options) => {
    logger.auth('Sign in attempt started', null, { provider: 'facebook' });
    
    try {
      const result = await signIn("facebook", options);
      
      if (result?.error) {
        logger.error('Sign in failed', result.error, { provider: 'facebook' });
      } else {
        logger.auth('Sign in successful', null, { provider: 'facebook' });
      }
      
      return result;
    } catch (error) {
      logger.error('Sign in error', error, { provider: 'facebook' });
      throw error;
    }
  }, []);

  const signInWithTwitter = useCallback(async (options) => {
    logger.auth('Sign in attempt started', null, { provider: 'twitter' });
    
    try {
      const result = await signIn("twitter", options);
      
      if (result?.error) {
        logger.error('Sign in failed', result.error, { provider: 'twitter' });
      } else {
        logger.auth('Sign in successful', null, { provider: 'twitter' });
      }
      
      return result;
    } catch (error) {
      logger.error('Sign in error', error, { provider: 'twitter' });
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async (options) => {
    logger.auth('Sign out attempt started', null);
    
    try {
      const result = await signOut(options);
      logger.auth('Sign out successful', null);
      return result;
    } catch (error) {
      logger.error('Sign out error', error);
      throw error;
    }
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: signOutUser,
  };
}

export default useAuth;