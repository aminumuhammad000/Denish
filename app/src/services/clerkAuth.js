import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useSSO, useClerk } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { googleAuthApi } from './api';
import { setAuthSession } from './authStorage';

// Complete pending auth sessions on web/native with skipRedirectCheck
WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });

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
        let sessionObj = clerk.client?.sessions?.find((s) => s.id === createdSessionId) || clerk.session;
        let clerkUser = sessionObj?.user || clerk.user || clerk.client?.users?.[0];

        let email =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          signUp?.emailAddress ||
          signIn?.identifier ||
          '';

        let name =
          clerkUser?.fullName ||
          `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() ||
          (signUp?.firstName ? `${signUp.firstName} ${signUp.lastName || ''}`.trim() : '') ||
          (signIn?.userData?.firstName ? `${signIn.userData.firstName} ${signIn.userData.lastName || ''}`.trim() : '') ||
          'User';

        if (!email) {
          // If Clerk didn't populate user synchronously, wait briefly and try reading from clerk.user or clerk.client
          await new Promise((res) => setTimeout(res, 500));
          sessionObj = clerk.client?.sessions?.find((s) => s.id === createdSessionId) || clerk.session;
          clerkUser = sessionObj?.user || clerk.user || clerk.client?.users?.[0];
          email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || signUp?.emailAddress || signIn?.identifier || '';
          if (!name || name === 'User') {
            name = clerkUser?.fullName || `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || name;
          }
        }

        const picture = clerkUser?.imageUrl || signIn?.userData?.imageUrl || '';
        const clerkId = clerkUser?.id || createdSessionId;
        const sessionToken = (await clerk.session?.getToken()) || (sessionObj?.getToken ? await sessionObj.getToken() : null) || createdSessionId;

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
          const authUser = response.user || response.vendor || response.driver;
          let screenName = 'CustomerHome';
          const sessionPayload = {
            role,
            token: response.token,
            user: authUser,
          };

          if (role === 'customer') {
            screenName = 'CustomerHome';
            sessionPayload.screen = screenName;
          } else if (role === 'vendor') {
            screenName = 'Dashboard';
            sessionPayload.vendor = authUser;
            sessionPayload.screen = screenName;
          } else if (role === 'driver') {
            screenName = 'DriverDashboard';
            sessionPayload.driver = authUser;
            sessionPayload.screen = screenName;
          }

          await setAuthSession(sessionPayload);

          if (navigation) {
            navigation.reset({
              index: 0,
              routes: [{ name: screenName }],
            });
          }

          return { success: true, user: authUser };
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
