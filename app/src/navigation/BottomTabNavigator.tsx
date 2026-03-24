import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';
import { Home as HomeIcon, Scan as ScanIcon, Map as MapIcon, ClipboardList, BookOpen } from 'lucide-react-native';
import { colors } from '../theme';

// Screen Implementations
import HomeScreen from '../screens/Home/HomeScreen';
import ScanScreen from '../screens/Scan/ScanScreen';
import ScanResultScreen from '../screens/Scan/ScanResultScreen';
import DetailedReportScreen from '../screens/Report/DetailedReportScreen';
import VendorMapScreen from '../screens/Map/VendorMapScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import EduGuardScreen from '../screens/EduGuard/EduGuardScreen';

import { BottomTabParamList, ScanStackParamList, HistoryStackParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

function ScanNavigator() {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen name="ScanScreen" component={ScanScreen} />
      <ScanStack.Screen name="ScanResultScreen" component={ScanResultScreen} />
      <ScanStack.Screen name="DetailedReportScreen" component={DetailedReportScreen} />
    </ScanStack.Navigator>
  );
}

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryScreen" component={HistoryScreen} />
      <HistoryStack.Screen name="DetailedReportScreen" component={DetailedReportScreen} />
    </HistoryStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let IconComp;
          let iconColor = color;
          let iconSize = size;

          if (route.name === 'Home') IconComp = HomeIcon;
          else if (route.name === 'Scan') {
            IconComp = ScanIcon;
            iconColor = focused ? colors.textInverse : color;
            iconSize = 32;
          }
          else if (route.name === 'Map') IconComp = MapIcon;
          else if (route.name === 'History') IconComp = ClipboardList;
          else if (route.name === 'EduGuard') IconComp = BookOpen;
          
          if (!IconComp) return null;

          if (route.name === 'Scan') {
            return (
              <View style={[styles.scanTab, { backgroundColor: focused ? colors.primaryDark : colors.accent }]}>
                <IconComp color={iconColor} size={iconSize} />
              </View>
            );
          }

          return (
            <View style={styles.iconContainer}>
              <IconComp color={iconColor} size={iconSize} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={VendorMapScreen} />
      <Tab.Screen name="Scan" component={ScanNavigator} options={{ tabBarLabel: 'Scan' }} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="EduGuard" component={EduGuardScreen} options={{ tabBarLabel: 'Learn' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: colors.primaryDark,
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  },
  scanTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
