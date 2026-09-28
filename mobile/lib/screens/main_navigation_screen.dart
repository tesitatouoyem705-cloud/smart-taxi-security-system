import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import 'passenger/passenger_home_screen.dart';
import 'driver/driver_dashboard_screen.dart';
import 'admin/admin_accounts_screen.dart';
import 'chat/ai_safety_chat_screen.dart';
import 'trip/trip_history_screen.dart';
import 'emergency/incidents_list_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDriver = auth.isDriver;
    final isAdmin = auth.isAdmin;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final List<Widget> pages;
    final List<BottomNavigationBarItem> navItems;

    if (isAdmin) {
      pages = const [
        AdminAccountsScreen(),
        PassengerHomeScreen(), // Monitor Area & Map
        IncidentsListScreen(),
        AiSafetyChatScreen(), // Chat with AI (Gemini)
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.users, size: 20),
          activeIcon: Icon(LucideIcons.users, size: 22),
          label: 'Accounts',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.map, size: 20),
          activeIcon: Icon(LucideIcons.map, size: 22),
          label: 'Monitor Area',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.shieldAlert, size: 20),
          activeIcon: Icon(LucideIcons.shieldAlert, size: 22),
          label: 'Incidents',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.bot, size: 20),
          activeIcon: Icon(LucideIcons.bot, size: 22),
          label: 'AI Chat',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.user, size: 20),
          activeIcon: Icon(LucideIcons.user, size: 22),
          label: 'Profile',
        ),
      ];
    } else if (isDriver) {
      pages = const [
        DriverDashboardScreen(),
        TripHistoryScreen(),
        IncidentsListScreen(), // Browse incidents history
        AiSafetyChatScreen(), // Chat with AI (Gemini)
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.car, size: 20),
          activeIcon: Icon(LucideIcons.car, size: 22),
          label: 'Drive',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.history, size: 20),
          activeIcon: Icon(LucideIcons.history, size: 22),
          label: 'Trips',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.shieldAlert, size: 20),
          activeIcon: Icon(LucideIcons.shieldAlert, size: 22),
          label: 'Incidents',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.bot, size: 20),
          activeIcon: Icon(LucideIcons.bot, size: 22),
          label: 'AI Chat',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.user, size: 20),
          activeIcon: Icon(LucideIcons.user, size: 22),
          label: 'Profile',
        ),
      ];
    } else {
      // Passenger
      pages = const [
        PassengerHomeScreen(), // Scan QR, Live Trip, Area Monitor, Contacts
        TripHistoryScreen(),
        IncidentsListScreen(), // Report Incidents
        AiSafetyChatScreen(), // Chat with AI (Gemini)
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.home, size: 20),
          activeIcon: Icon(LucideIcons.home, size: 22),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.history, size: 20),
          activeIcon: Icon(LucideIcons.history, size: 22),
          label: 'Trips',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.shieldAlert, size: 20),
          activeIcon: Icon(LucideIcons.shieldAlert, size: 22),
          label: 'Incidents',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.bot, size: 20),
          activeIcon: Icon(LucideIcons.bot, size: 22),
          label: 'AI Chat',
        ),
        BottomNavigationBarItem(
          icon: Icon(LucideIcons.user, size: 20),
          activeIcon: Icon(LucideIcons.user, size: 22),
          label: 'Profile',
        ),
      ];
    }

    final safeIndex = _currentIndex >= pages.length ? 0 : _currentIndex;

    return Scaffold(
      body: IndexedStack(
        index: safeIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          border: Border(top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: safeIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: isDark ? AppColors.cardDark : AppColors.cardLight,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          items: navItems,
        ),
      ),
    );
  }
}
