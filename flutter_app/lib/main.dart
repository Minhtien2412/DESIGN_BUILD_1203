import 'package:flutter/material.dart';
import 'screens/customer_home_screen.dart';
import 'screens/worker_home_screen.dart';
import 'theme/app_colors.dart';

void main() {
  runApp(const BaoTienWebApp());
}

/// Root app widget with bottom navigation to switch between
/// Customer and Worker home screens.
class BaoTienWebApp extends StatelessWidget {
  const BaoTienWebApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BaoTienWeb',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryOrange,
          surface: AppColors.surface,
        ),
        scaffoldBackgroundColor: AppColors.surface,
        useMaterial3: true,
      ),
      home: const HomeShell(),
    );
  }
}

/// Shell with bottom tabs to demo both screens.
/// In production, route to one based on the user's role.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _currentIndex = 0;

  static const _screens = [
    CustomerHomeScreen(),
    WorkerHomeScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Khách hàng',
          ),
          NavigationDestination(
            icon: Icon(Icons.engineering_outlined),
            selectedIcon: Icon(Icons.engineering),
            label: 'Thợ',
          ),
        ],
      ),
    );
  }
}
