import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'screens/splash_onboarding_screen.dart';
import 'state/phantom_controller.dart';
import 'theme/phantom_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://ufamecgfayoarbnodqul.supabase.co',
  );
  const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  if (supabaseAnonKey.isNotEmpty) {
    try {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
    } catch (_) {}
  }

  runApp(const PhantomXApp());
}

class PhantomXApp extends StatefulWidget {
  const PhantomXApp({super.key});

  @override
  State<PhantomXApp> createState() => _PhantomXAppState();
}

class _PhantomXAppState extends State<PhantomXApp> {
  final PhantomController _controller = PhantomController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return MaterialApp(
          title: 'PhantomX',
          debugShowCheckedModeBanner: false,
          theme: PhantomTheme.lightTheme(),
          darkTheme: PhantomTheme.darkTheme(),
          themeMode: _controller.themeMode,
          home: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: switch (_controller.stage) {
              AppStage.splash => SplashOnboardingScreen(
                  key: const ValueKey('stage-splash'),
                  controller: _controller,
                ),
              AppStage.auth => AuthScreen(
                  key: const ValueKey('stage-auth'),
                  controller: _controller,
                ),
              AppStage.home => HomeShell(
                  key: const ValueKey('stage-home'),
                  controller: _controller,
                ),
            },
          ),
        );
      },
    );
  }
}
