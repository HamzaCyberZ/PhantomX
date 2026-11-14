import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';
import '../widgets/user_avatar.dart';
import 'alerts_screen.dart';
import 'dashboard_screen.dart';
import 'devices_screen.dart';
import 'profile_screen.dart';
import 'risk_reports_screen.dart';
import 'threat_intel_screen.dart';
import 'traffic_ports_screen.dart';

class HomeShell extends StatefulWidget {
  final PhantomController controller;

  const HomeShell({super.key, required this.controller});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  // Indices 0-3 map to main tabs; 4=Traffic&Ports, 5=Risk&Reports, 6=Profile
  int? _extraModuleIndex;

  String get _title {
    switch (_extraModuleIndex) {
      case 4:
        return 'Traffic & Port Scans';
      case 5:
        return 'Risk & Reports';
      case 6:
        return 'Profile & Settings';
    }
    switch (widget.controller.currentTabIndex) {
      case 0:
        return 'PhantomX';
      case 1:
        return widget.controller.showOnlyUnknownDevices
            ? 'Unknown Devices'
            : 'Connected Devices';
      case 2:
        return 'Security Alerts';
      case 3:
        return 'Threat Intelligence';
      default:
        return 'PhantomX';
    }
  }

  void _openMoreSheet() {
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            ListTile(
              leading: const Icon(Icons.help_outline_rounded,
                  color: PhantomColors.amber),
              title: const Text('Unknown Device Detection'),
              subtitle: Text(
                '${widget.controller.unknownDevicesCount} flagged / unrecognized endpoints',
              ),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _extraModuleIndex = null);
                widget.controller.setTab(1, unknownOnly: true);
              },
            ),
            ListTile(
              leading: const Icon(Icons.waves_rounded, color: PhantomColors.rose),
              title: const Text('Suspicious Traffic & Port Scans'),
              subtitle: const Text('Inspect outbound beacons and TCP SYN sweeps'),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _extraModuleIndex = 4);
              },
            ),
            ListTile(
              leading: const Icon(Icons.assessment_outlined,
                  color: PhantomColors.accent),
              title: const Text('Risk Assessment & Security Reports'),
              subtitle: const Text('Interactive remediation checklist & audit export'),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _extraModuleIndex = 5);
              },
            ),
            ListTile(
              leading: const Icon(Icons.person_outline_rounded,
                  color: PhantomColors.emerald),
              title: const Text('Profile, Photo & Settings'),
              subtitle: const Text('Update profile picture and personal info'),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _extraModuleIndex = 6);
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _activeBody() {
    switch (_extraModuleIndex) {
      case 4:
        return TrafficPortsScreen(controller: widget.controller);
      case 5:
        return RiskReportsScreen(controller: widget.controller);
      case 6:
        return ProfileScreen(controller: widget.controller);
    }

    switch (widget.controller.currentTabIndex) {
      case 0:
        return DashboardScreen(
          controller: widget.controller,
          onOpenProfile: () => setState(() => _extraModuleIndex = 6),
        );
      case 1:
        return DevicesScreen(controller: widget.controller);
      case 2:
        return AlertsScreen(controller: widget.controller);
      case 3:
        return ThreatIntelScreen(controller: widget.controller);
      default:
        return DashboardScreen(
          controller: widget.controller,
          onOpenProfile: () => setState(() => _extraModuleIndex = 6),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedNav =
        _extraModuleIndex != null ? 4 : widget.controller.currentTabIndex;

    return Scaffold(
      appBar: AppBar(
        leading: _extraModuleIndex != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => setState(() => _extraModuleIndex = null),
              )
            : const Padding(
                padding: EdgeInsets.only(left: 14),
                child: Icon(
                  Icons.security_rounded,
                  color: PhantomColors.accent,
                ),
              ),
        title: Text(_title),
        actions: [
          IconButton(
            onPressed: widget.controller.toggleThemeMode,
            icon: Icon(
              widget.controller.themeMode == ThemeMode.dark
                  ? Icons.light_mode_outlined
                  : Icons.dark_mode_outlined,
            ),
            tooltip: 'Toggle Theme',
          ),
          Padding(
            padding: const EdgeInsets.only(right: 14, left: 4),
            child: Center(
              child: UserAvatar(
                fullName: widget.controller.profile.fullName,
                avatarBytes: widget.controller.avatarBytes,
                size: 36,
                showOnlineBadge: true,
                onTap: () => setState(() => _extraModuleIndex = 6),
              ),
            ),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: KeyedSubtree(
          key: ValueKey('$_extraModuleIndex-${widget.controller.currentTabIndex}'),
          child: _activeBody(),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedNav,
        onDestinationSelected: (idx) {
          if (idx == 4) {
            _openMoreSheet();
            return;
          }
          setState(() => _extraModuleIndex = null);
          widget.controller.setTab(idx);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.devices_outlined),
            selectedIcon: Icon(Icons.devices_rounded),
            label: 'Devices',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            selectedIcon: Icon(Icons.notifications_rounded),
            label: 'Alerts',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome_rounded),
            label: 'Threat AI',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view_rounded),
            label: 'More',
          ),
        ],
      ),
    );
  }
}
