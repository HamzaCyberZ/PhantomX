# PhantomX — Flutter & Dart Mobile App

Complete Flutter & Dart frontend for **PhantomX – Intelligent Network Behaviour Guardian**, integrated with Supabase and the PhantomX AI backend API.

## Run Locally

1. Install dependencies:
   ```bash
   cd flutter_app
   flutter pub get
   ```

2. Run with your Supabase project and backend API URL:
   ```bash
   flutter run \
     --dart-define=SUPABASE_URL=https://ufamecgfayoarbnodqul.supabase.co \
     --dart-define=SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY \
     --dart-define=API_BASE_URL=http://localhost:3000
   ```

## Features Included
- Splash Screen & 3-Step Onboarding (`lib/screens/splash_onboarding_screen.dart`)
- Login & Sign-Up with Form Validation & Password Strength (`lib/screens/auth_screen.dart`)
- Security Dashboard with CustomPainter Score Arc & 24h Traffic Chart (`lib/screens/dashboard_screen.dart`)
- Connected Devices & Unknown Device Detection (`lib/screens/devices_screen.dart`)
- Suspicious Traffic Analysis & Port Scan Detection (`lib/screens/traffic_ports_screen.dart`)
- AI Threat Intelligence & Investigation Console (`lib/screens/threat_intel_screen.dart`)
- Security Alerts Management (`lib/screens/alerts_screen.dart`)
- Network Risk Assessment & Security Reports Export (`lib/screens/risk_reports_screen.dart`)
- Profile Picture Picker (Gallery, Camera, Preview, Update, Remove) & Personal Information Editor (`lib/screens/profile_screen.dart`)
