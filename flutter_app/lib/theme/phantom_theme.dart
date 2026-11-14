import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PhantomColors {
  static const Color darkCanvas = Color(0xFF060911);
  static const Color darkSurface = Color(0xFF0D1422);
  static const Color darkElevated = Color(0xFF131C2E);
  static const Color darkBorder = Color(0x2494A3B8);

  static const Color lightCanvas = Color(0xFFF3F6FA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightElevated = Color(0xFFF8FAFC);
  static const Color lightBorder = Color(0x1A0F172A);

  static const Color accent = Color(0xFF38BDF8);
  static const Color accentDark = Color(0xFF0284C7);
  static const Color emerald = Color(0xFF10B981);
  static const Color amber = Color(0xFFF59E0B);
  static const Color rose = Color(0xFFF43F5E);
}

class PhantomTheme {
  static ThemeData darkTheme() {
    final base = ThemeData.dark(useMaterial3: true);
    final textTheme = GoogleFonts.plusJakartaSansTextTheme(base.textTheme).copyWith(
      displaySmall: GoogleFonts.outfit(
        fontWeight: FontWeight.w700,
        color: const Color(0xFFF1F5F9),
      ),
      headlineMedium: GoogleFonts.outfit(
        fontWeight: FontWeight.w700,
        color: const Color(0xFFF1F5F9),
      ),
      titleLarge: GoogleFonts.outfit(
        fontWeight: FontWeight.w600,
        color: const Color(0xFFF1F5F9),
      ),
    );

    return base.copyWith(
      scaffoldBackgroundColor: PhantomColors.darkCanvas,
      colorScheme: const ColorScheme.dark(
        primary: PhantomColors.accent,
        onPrimary: Color(0xFF06101C),
        surface: PhantomColors.darkSurface,
        onSurface: Color(0xFFF1F5F9),
        error: PhantomColors.rose,
      ),
      textTheme: textTheme,
      cardTheme: CardThemeData(
        color: PhantomColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: PhantomColors.darkBorder),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: PhantomColors.darkSurface,
        foregroundColor: Color(0xFFF1F5F9),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: PhantomColors.darkElevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.accent, width: 1.5),
        ),
      ),
    );
  }

  static ThemeData lightTheme() {
    final base = ThemeData.light(useMaterial3: true);
    final textTheme = GoogleFonts.plusJakartaSansTextTheme(base.textTheme).copyWith(
      displaySmall: GoogleFonts.outfit(
        fontWeight: FontWeight.w700,
        color: const Color(0xFF0B1120),
      ),
      headlineMedium: GoogleFonts.outfit(
        fontWeight: FontWeight.w700,
        color: const Color(0xFF0B1120),
      ),
      titleLarge: GoogleFonts.outfit(
        fontWeight: FontWeight.w600,
        color: const Color(0xFF0B1120),
      ),
    );

    return base.copyWith(
      scaffoldBackgroundColor: PhantomColors.lightCanvas,
      colorScheme: const ColorScheme.light(
        primary: PhantomColors.accentDark,
        onPrimary: Colors.white,
        surface: PhantomColors.lightSurface,
        onSurface: Color(0xFF0B1120),
        error: PhantomColors.rose,
      ),
      textTheme: textTheme,
      cardTheme: CardThemeData(
        color: PhantomColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: PhantomColors.lightBorder),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: PhantomColors.lightSurface,
        foregroundColor: Color(0xFF0B1120),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: PhantomColors.lightElevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: PhantomColors.accentDark, width: 1.5),
        ),
      ),
    );
  }
}
