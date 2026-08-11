import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, Platform } from 'react-native';
import { getAuthSession } from '../services/authStorage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      const session = await getAuthSession();
      if (session && session.role) {
        if (session.role === 'customer') {
          navigation.replace(session.screen || 'CustomerHome');
        } else if (session.role === 'vendor') {
          navigation.replace(session.screen || 'Dashboard');
        } else if (session.role === 'driver') {
          navigation.replace(session.screen || 'DriverDashboard');
        } else {
          navigation.replace('Onboarding');
        }
      } else {
        navigation.replace('Onboarding');
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#044A42" />
      <View style={styles.logoContainer}>
        {/* Angular Custom Geometric Brand Logo 'denish' */}
        <View style={styles.logoRow}>
          {/* d */}
          <View style={styles.letterWrapper}>
            <View style={[styles.barVertical, { height: 28, left: 16, top: 0 }]} />
            <View style={[styles.barHorizontal, { width: 18, top: 12, left: 0 }]} />
            <View style={[styles.barHorizontal, { width: 18, top: 24, left: 0 }]} />
            <View style={[styles.barVertical, { height: 16, left: 0, top: 12 }]} />
          </View>

          {/* e */}
          <View style={styles.letterWrapper}>
            <View style={[styles.barVertical, { height: 20, left: 0, top: 8 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 8, left: 0 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 16, left: 0 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 24, left: 0 }]} />
          </View>

          {/* n */}
          <View style={styles.letterWrapper}>
            <View style={[styles.barVertical, { height: 20, left: 0, top: 8 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 8, left: 0 }]} />
            <View style={[styles.barVertical, { height: 20, left: 14, top: 8 }]} />
          </View>

          {/* i */}
          <View style={[styles.letterWrapper, { width: 8 }]}>
            <View style={[styles.barVertical, { height: 20, left: 0, top: 8 }]} />
          </View>

          {/* s */}
          <View style={styles.letterWrapper}>
            <View style={[styles.barHorizontal, { width: 16, top: 8, left: 0 }]} />
            <View style={[styles.barVertical, { height: 10, left: 0, top: 8 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 16, left: 0 }]} />
            <View style={[styles.barVertical, { height: 10, left: 12, top: 16 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 24, left: 0 }]} />
          </View>

          {/* h */}
          <View style={styles.letterWrapper}>
            <View style={[styles.barVertical, { height: 28, left: 0, top: 0 }]} />
            <View style={[styles.barHorizontal, { width: 16, top: 12, left: 0 }]} />
            <View style={[styles.barVertical, { height: 16, left: 14, top: 12 }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#044A42', // Deep teal matching splash design
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    gap: 6,
  },
  letterWrapper: {
    width: 20,
    height: 30,
    position: 'relative',
  },
  barVertical: {
    position: 'absolute',
    width: 5,
    backgroundColor: '#FF6B00',
    borderRadius: 1,
  },
  barHorizontal: {
    position: 'absolute',
    height: 5,
    backgroundColor: '#FF6B00',
    borderRadius: 1,
  },
});

export default SplashScreen;
