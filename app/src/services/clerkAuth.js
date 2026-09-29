import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useSSO, useClerk } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { googleAuthApi } from './api';
import { setAuthSession } from './authStorage';

// Complete pending auth sessions on web/native
WebBrowser.maybeCompleteAuthSession();

export const useClerkGoogleAuth = (role = 'customer', navigation = null) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();

  const handleGoogleAuth = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'denish',
        path: 'oauth-native-callback',
      });

      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }

        // Retrieve user info from Clerk session or user
        const sessionObj = clerk.client?.sessions?.find((s) => s.id === createdSessionId);
        const clerkUser = sessionObj?.user || clerk.user;

        const email =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          signUp?.emailAddress ||
          signIn?.identifier;

        const name =
          clerkUser?.fullName ||
          `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() ||
          (signUp?.firstName ? `${signUp.firstName} ${signUp.lastName || ''}`.trim() : 'User');

        const picture = clerkUser?.imageUrl || '';
        const clerkId = clerkUser?.id || createdSessionId;
        const sessionToken = (await clerk.session?.getToken()) || createdSessionId;

        const response = await googleAuthApi({
          token: sessionToken,
          role,
          isClerk: true,
          email,
          name,
          picture,
          clerkId,
        });

        if (response && response.success) {
          let screenName = 'CustomerHome';
          const sessionPayload = {
            role,
            token: response.token,
          };

          if (role === 'customer') {
            screenName = 'CustomerHome';
            sessionPayload.user = response.user;
            sessionPayload.screen = screenName;
          } else if (role === 'vendor') {
            const isApproved = response.user?.status === 'Approved';
            screenName = isApproved ? 'Dashboard' : 'Dashboard';
            sessionPayload.vendor = response.user;
            sessionPayload.screen = screenName;
          } else if (role === 'driver') {
            screenName = 'DriverDashboard';
            sessionPayload.driver = response.user;
            sessionPayload.screen = screenName;
          }

          await setAuthSession(sessionPayload);

          if (navigation) {
            navigation.reset({
              index: 0,
              routes: [{ name: screenName }],
            });
          }

          return { success: true, user: response.user };
        } else {
          const err = response?.error || 'Google Sign-In failed';
          setErrorMsg(err);
          Alert.alert('Authentication Error', err);
          return { success: false, error: err };
        }
      } else {
        // User closed or cancelled OAuth flow
        return { success: false, cancelled: true };
      }
    } catch (err) {
      console.error('Clerk Google Auth Error:', err);
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'An error occurred during Google Sign-In with Clerk.';
      setErrorMsg(message);
      Alert.alert('Sign-In Error', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [role, navigation, startSSOFlow, clerk]);

  return {
    handleGoogleAuth,
    loading,
    errorMsg,
  };
};
