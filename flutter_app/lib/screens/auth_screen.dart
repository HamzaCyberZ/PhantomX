import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';

class AuthScreen extends StatefulWidget {
  final PhantomController controller;

  const AuthScreen({super.key, required this.controller});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController(text: 'elena.vance@phantomx.io');
  final _passwordCtrl = TextEditingController(text: 'PhantomGuard#2026');

  bool _isSignUp = false;
  bool _obscurePassword = true;
  bool _submitting = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  double get _passwordStrength {
    final val = _passwordCtrl.text;
    if (val.isEmpty) return 0;
    double score = 0.25;
    if (val.length >= 8) score += 0.25;
    if (RegExp(r'[A-Z]').hasMatch(val) && RegExp(r'[0-9]').hasMatch(val)) {
      score += 0.25;
    }
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(val)) score += 0.25;
    return score;
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _submitting = true);
    await widget.controller.authenticate(
      isSignUp: _isSignUp,
      email: _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
      fullName: _nameCtrl.text,
    );
    if (mounted) {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(22),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(13),
                                gradient: const LinearGradient(
                                  colors: [
                                    PhantomColors.accent,
                                    PhantomColors.accentDark,
                                  ],
                                ),
                              ),
                              child: const Icon(
                                Icons.security_rounded,
                                color: Color(0xFF04101C),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'PhantomX Console',
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                Text(
                                  'Network Security Workspace',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 22),
                        SegmentedButton<bool>(
                          segments: const [
                            ButtonSegment(value: false, label: Text('Sign In')),
                            ButtonSegment(
                                value: true, label: Text('Create Account')),
                          ],
                          selected: {_isSignUp},
                          onSelectionChanged: (val) =>
                              setState(() => _isSignUp = val.first),
                        ),
                        const SizedBox(height: 20),
                        if (_isSignUp) ...[
                          TextFormField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Full Name',
                              prefixIcon: Icon(Icons.person_outline),
                            ),
                            validator: (v) {
                              if (_isSignUp &&
                                  (v == null || v.trim().length < 2)) {
                                return 'Enter your full name';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 14),
                        ],
                        TextFormField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Work Email',
                            prefixIcon: Icon(Icons.mail_outline),
                          ),
                          validator: (v) {
                            if (v == null ||
                                !v.contains('@') ||
                                !v.contains('.')) {
                              return 'Enter a valid email address';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _passwordCtrl,
                          obscureText: _obscurePassword,
                          onChanged: (_) => setState(() {}),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline),
                            suffixIcon: IconButton(
                              onPressed: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                              ),
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.length < 6) {
                              return 'Minimum 6 characters required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _passwordStrength,
                            minHeight: 5,
                            color: _passwordStrength >= 0.75
                                ? PhantomColors.emerald
                                : PhantomColors.amber,
                          ),
                        ),
                        const SizedBox(height: 22),
                        SizedBox(
                          height: 50,
                          child: FilledButton(
                            onPressed: _submitting ? null : _submit,
                            child: _submitting
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(_isSignUp
                                    ? 'Create Analyst Account'
                                    : 'Sign In to PhantomX'),
                          ),
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: _submitting
                              ? null
                              : () {
                                  widget.controller.setStage(AppStage.home);
                                  widget.controller.initializeTelemetry();
                                },
                          child: const Text('Quick Access as Elena Vance'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
