import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';
import '../widgets/avatar_picker_sheet.dart';
import '../widgets/user_avatar.dart';

class ProfileScreen extends StatefulWidget {
  final PhantomController controller;

  const ProfileScreen({super.key, required this.controller});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _locationCtrl;
  late final TextEditingController _roleCtrl;
  late final TextEditingController _departmentCtrl;
  late final TextEditingController _orgCtrl;
  late final TextEditingController _bioCtrl;
  late final TextEditingController _networkCtrl;
  late final TextEditingController _subnetCtrl;

  @override
  void initState() {
    super.initState();
    final p = widget.controller.profile;
    _nameCtrl = TextEditingController(text: p.fullName);
    _emailCtrl = TextEditingController(text: p.email);
    _phoneCtrl = TextEditingController(text: p.phone);
    _locationCtrl = TextEditingController(text: p.location);
    _roleCtrl = TextEditingController(text: p.role);
    _departmentCtrl = TextEditingController(text: p.department);
    _orgCtrl = TextEditingController(text: p.organization);
    _bioCtrl = TextEditingController(text: p.bio);
    _networkCtrl = TextEditingController(text: p.networkName);
    _subnetCtrl = TextEditingController(text: p.subnetCidr);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _locationCtrl.dispose();
    _roleCtrl.dispose();
    _departmentCtrl.dispose();
    _orgCtrl.dispose();
    _bioCtrl.dispose();
    _networkCtrl.dispose();
    _subnetCtrl.dispose();
    super.dispose();
  }

  void _openAvatarSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => AvatarPickerSheet(
        fullName: widget.controller.profile.fullName,
        currentBytes: widget.controller.avatarBytes,
        onSave: (bytes, path) {
          widget.controller.updateAvatar(bytes: bytes, path: path);
        },
        onRemove: widget.controller.removeAvatar,
      ),
    );
  }

  void _saveProfile() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    widget.controller.updateProfile(
      widget.controller.profile.copyWith(
        fullName: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        phone: _phoneCtrl.text.trim(),
        location: _locationCtrl.text.trim(),
        role: _roleCtrl.text.trim(),
        department: _departmentCtrl.text.trim(),
        organization: _orgCtrl.text.trim(),
        bio: _bioCtrl.text.trim(),
        networkName: _networkCtrl.text.trim(),
        subnetCidr: _subnetCtrl.text.trim(),
      ),
    );
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profile details saved successfully')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.controller.profile;
    final isDark = widget.controller.themeMode == ThemeMode.dark;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    UserAvatar(
                      fullName: profile.fullName,
                      avatarBytes: widget.controller.avatarBytes,
                      size: 96,
                      showOnlineBadge: true,
                      onTap: _openAvatarSheet,
                    ),
                    FloatingActionButton.small(
                      heroTag: 'edit_avatar_fab',
                      onPressed: _openAvatarSheet,
                      child: const Icon(Icons.camera_alt_outlined, size: 18),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  profile.fullName,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(
                  '${profile.role} · ${profile.organization}',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    FilledButton.tonalIcon(
                      onPressed: _openAvatarSheet,
                      icon: const Icon(Icons.photo_camera_outlined, size: 18),
                      label: Text(
                        widget.controller.avatarBytes == null
                            ? 'Add Profile Photo'
                            : 'Change / Preview Photo',
                      ),
                    ),
                    if (widget.controller.avatarBytes != null)
                      OutlinedButton.icon(
                        onPressed: widget.controller.removeAvatar,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: PhantomColors.rose,
                        ),
                        icon: const Icon(Icons.delete_outline, size: 18),
                        label: const Text('Remove'),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Personal & Network Information',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email Address'),
                    validator: (v) => (v == null || !v.contains('@'))
                        ? 'Enter valid email'
                        : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Phone Number'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _locationCtrl,
                    decoration: const InputDecoration(labelText: 'Location'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _roleCtrl,
                    decoration: const InputDecoration(labelText: 'Role / Title'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _departmentCtrl,
                    decoration: const InputDecoration(labelText: 'Department'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _orgCtrl,
                    decoration: const InputDecoration(labelText: 'Organization'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _bioCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Analyst Bio'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _networkCtrl,
                          decoration:
                              const InputDecoration(labelText: 'Network Label'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _subnetCtrl,
                          decoration:
                              const InputDecoration(labelText: 'Subnet CIDR'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  FilledButton.icon(
                    onPressed: _saveProfile,
                    icon: const Icon(Icons.save_outlined),
                    label: const Text('Save Personal Information'),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Column(
            children: [
              SwitchListTile(
                title: const Text('Dark Security Theme'),
                subtitle: const Text('Switch between Dark Ops and Light modes'),
                value: isDark,
                onChanged: (_) => widget.controller.toggleThemeMode(),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.logout_rounded, color: PhantomColors.rose),
                title: const Text(
                  'Sign Out',
                  style: TextStyle(
                    color: PhantomColors.rose,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                onTap: widget.controller.signOut,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
