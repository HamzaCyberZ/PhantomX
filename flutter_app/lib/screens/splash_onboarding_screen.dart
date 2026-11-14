import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';

class SplashOnboardingScreen extends StatefulWidget {
  final PhantomController controller;

  const SplashOnboardingScreen({super.key, required this.controller});

  @override
  State<SplashOnboardingScreen> createState() => _SplashOnboardingScreenState();
}

class _SplashOnboardingScreenState extends State<SplashOnboardingScreen>
    with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _pageIndex = 0;
  bool _showOnboarding = false;
  late final AnimationController _pulseController;

  static const _slides = [
    (
      icon: Icons.radar_rounded,
      title: 'Zero-Blindspot Discovery',
      subtitle:
          'Fingerprint every connected endpoint, expose spoofed MAC addresses, and isolate unrecognized hardware in seconds.',
      accent: PhantomColors.accent,
    ),
    (
      icon: Icons.shield_outlined,
      title: 'Lateral Port Sweep Defense',
      subtitle:
          'Spot TCP SYN sweeps, DNS tunneling bursts, and unauthorized beaconing before attackers pivot inside your VLAN.',
      accent: PhantomColors.emerald,
    ),
    (
      icon: Icons.auto_awesome_rounded,
      title: 'PhantomX Threat Intelligence',
      subtitle:
          'Synthesize behavioural network telemetry into prioritized remediation playbooks and audit-ready security reports.',
      accent: PhantomColors.amber,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    Future.delayed(const Duration(milliseconds: 1300), () {
      if (mounted) {
        setState(() => _showOnboarding = true);
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 450),
          child: _showOnboarding ? _buildOnboarding(context) : _buildSplash(context),
        ),
      ),
    );
  }

  Widget _buildSplash(BuildContext context) {
    return Center(
      key: const ValueKey('splash'),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              final scale = 0.96 + (_pulseController.value * 0.08);
              return Transform.scale(scale: scale, child: child);
            },
            child: Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(
                  colors: [PhantomColors.accent, PhantomColors.accentDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: PhantomColors.accent.withValues(alpha: 0.35),
                    blurRadius: 28,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.security_rounded,
                size: 46,
                color: Color(0xFF04101C),
              ),
            ),
          ),
          const SizedBox(height: 22),
          Text(
            'PhantomX',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  letterSpacing: -0.5,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Intelligent Network Behaviour Guardian',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: PhantomColors.accent,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildOnboarding(BuildContext context) {
    final isLast = _pageIndex == _slides.length - 1;
    return Padding(
      key: const ValueKey('onboarding'),
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: PhantomColors.accent.withValues(alpha: 0.16),
                    ),
                    child: const Icon(
                      Icons.security_rounded,
                      size: 20,
                      color: PhantomColors.accent,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'PhantomX',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ],
              ),
              TextButton(
                onPressed: () => widget.controller.setStage(AppStage.auth),
                child: const Text('Skip'),
              ),
            ],
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: _slides.length,
              onPageChanged: (idx) => setState(() => _pageIndex = idx),
              itemBuilder: (context, idx) {
                final slide = _slides[idx];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 112,
                        height: 112,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: slide.accent.withValues(alpha: 0.14),
                          border: Border.all(
                            color: slide.accent.withValues(alpha: 0.35),
                            width: 1.5,
                          ),
                        ),
                        child: Icon(
                          slide.icon,
                          size: 52,
                          color: slide.accent,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Text(
                        slide.title,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        slide.subtitle,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              height: 1.5,
                              color: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.color
                                  ?.withValues(alpha: 0.78),
                            ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_slides.length, (i) {
              final active = i == _pageIndex;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 240),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: active ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: active
                      ? PhantomColors.accent
                      : Colors.grey.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(8),
                ),
              );
            }),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: () {
                if (!isLast) {
                  _pageController.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOut,
                  );
                } else {
                  widget.controller.setStage(AppStage.auth);
                }
              },
              child: Text(isLast ? 'Continue to Sign In' : 'Next'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () {
                widget.controller.setStage(AppStage.home);
                widget.controller.initializeTelemetry();
              },
              child: const Text('Enter Security Dashboard'),
            ),
          ),
        ],
      ),
    );
  }
}
