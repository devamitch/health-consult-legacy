/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { firebaseGoogleAuth } from './src/utils/firebase-auth';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '904872255033-gjvmvh0661q29glblotlpnlfs2i31v7m.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

export const googleAuth = async () => {
  const hasPlayServices = await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  if (!hasPlayServices) {
    throw new Error('Google Play services not available');
  }

  const userInfo = await GoogleSignin.signIn();
  const { idToken, accessToken } = await GoogleSignin.getTokens();

  return {
    id: userInfo?.data?.user?.id ?? undefined,
    email: userInfo?.data?.user?.email,
    name: userInfo?.data?.user?.name ?? undefined,
    photo: userInfo?.data?.user?.photo ?? undefined,
    authToken: accessToken,
    idToken: idToken,
    provider: 'google',
  };
};

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const onGooglePress = useCallback(async () => {
    try {
      const socialData = await googleAuth();

      // Try Firebase first, fallback to Supabase
      let authResult = null;

      let access_token: string = socialData?.idToken;
      let displayName: string = socialData?.name || '';

      const firebaseResult = await firebaseGoogleAuth(access_token);

      firebaseResult?.user?.displayName;
      Alert.alert(
        'Authentication Success',
        `Welcome ${firebaseResult?.user?.displayName}`,
        [],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed';

      Alert.alert('Authentication Error', message, []);
      return null;
    } finally {
    }
  }, []);
  return (
    <View
      style={
        (styles.container,
        {
          paddingTop: safeAreaInsets.top + 100,
          flex: 1,
          paddingBottom: safeAreaInsets.bottom + 100,
        })
      }
    >
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
      <View style={{ flex: 1 }} />
      <Button onPress={onGooglePress} title="Sign in with Google" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
