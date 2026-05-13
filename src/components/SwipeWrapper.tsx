import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export const SwipeWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const routes = ['/', '/schedule', '/profile'];
  const currentIndex = routes.indexOf(pathname === '/index' ? '/' : pathname);

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;

    if (Math.abs(translationX) > SWIPE_THRESHOLD) {
      if (translationX > 0 && currentIndex > 0) {
        // Swipe Right -> Go Left
        router.push(routes[currentIndex - 1] as any);
      } else if (translationX < 0 && currentIndex < routes.length - 1) {
        // Swipe Left -> Go Right
        router.push(routes[currentIndex + 1] as any);
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-20, 20]} // Sensitivity
      failOffsetY={[-20, 20]}  // Don't intercept vertical scroll
    >
      <View style={styles.container}>
        {children}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
