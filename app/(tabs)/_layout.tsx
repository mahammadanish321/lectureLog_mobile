import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { LayoutDashboard, Calendar, User, Clock, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const [layouts, setLayouts] = React.useState<Record<number, { width: number, x: number, tabX: number }>>({});
  
  const pillWidth = useSharedValue(0);
  const pillX = useSharedValue(0);

  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  const activeRoute = state.routes[state.index];
  const visibleIndex = visibleRoutes.findIndex(r => r.key === activeRoute.key);

  useEffect(() => {
    if (visibleIndex !== -1 && layouts[visibleIndex]) {
      const { width: w, x, tabX } = layouts[visibleIndex];
      pillWidth.value = withSpring(w + 24, { damping: 20, stiffness: 150 });
      pillX.value = withSpring(tabX + x - 12, { damping: 20, stiffness: 150 });
    }
  }, [visibleIndex, layouts]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      width: pillWidth.value,
      transform: [{ translateX: pillX.value }],
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={100} tint="dark" style={styles.tabBar}>
        <Animated.View style={[styles.activePill, animatedPillStyle]} />

        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = activeRoute.key === route.key;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const activeColor = '#fff';
          const inactiveColor = 'rgba(255,255,255,0.4)';

          const renderIcon = (color: string) => {
            const size = 20;
            const strokeWidth = isFocused ? 2.5 : 2;
            switch (route.name) {
              case 'index': return <LayoutDashboard size={size} color={color} strokeWidth={strokeWidth} />;
              case 'students': return <Users size={size} color={color} strokeWidth={strokeWidth} />;
              case 'sessions': return <Clock size={size} color={color} strokeWidth={strokeWidth} />;
              case 'schedule': return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
              case 'you': return <User size={size} color={color} strokeWidth={strokeWidth} />;
              default: return <LayoutDashboard size={size} color={color} strokeWidth={strokeWidth} />;
            }
          };

          const [tabX, setTabX] = React.useState(0);

          return (
            <TouchableOpacity 
              key={route.key} 
              onPress={onPress} 
              style={styles.tabItem} 
              activeOpacity={0.8}
              onLayout={(e) => setTabX(e.nativeEvent.layout.x)}
            >
              <View 
                onLayout={(e) => {
                  const { width: w, x } = e.nativeEvent.layout;
                  setLayouts(prev => ({ ...prev, [index]: { width: w, x, tabX } }));
                }}
                style={styles.iconContainer}
              >
                {renderIcon(isFocused ? activeColor : inactiveColor)}
                {isFocused && <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="students" options={{ title: 'Students', href: isTeacher ? '/students' : null }} />
        <Tabs.Screen name="sessions" options={{ title: 'Sessions', href: isTeacher ? '/sessions' : null }} />
        <Tabs.Screen name="schedule" options={{ title: 'Routine' }} />
        <Tabs.Screen name="you" options={{ title: 'You' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 20,
    right: 20,
    height: 70,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 35,
    overflow: 'hidden',
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activePill: {
    position: 'absolute',
    height: 52,
    backgroundColor: '#105934',
    borderRadius: 26,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
