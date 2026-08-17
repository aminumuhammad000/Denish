import { GOOGLE_CLIENT_IDS } from '../constants/Config';

export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (typeof document !== 'undefined' && !document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        clearInterval(checkInterval);

        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_IDS.webClientId,
            scope: 'openid email profile',
            callback: (response) => {
              if (response.error) {
                reject(new Error(response.error_description || response.error));
              } else if (response.access_token) {
                resolve({
                  token: response.access_token,
                  isAccessToken: true
                });
              } else {
                reject(new Error('Google Sign-In web: No access token received'));
              }
            },
            error_callback: (err) => {
              reject(err);
            }
          });
          client.requestAccessToken();
        } catch (err) {
          reject(err);
        }
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Failed to load Google Sign-In SDK. Please refresh the page and try again.'));
    }, 15000);
  });
};

export const signOutWithGoogle = async () => {
  // Web signout logic (stateless or handled by auth storage clear)
};
