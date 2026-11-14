import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/phantom_theme.dart';
import 'user_avatar.dart';

class AvatarPickerSheet extends StatefulWidget {
  final String fullName;
  final Uint8List? currentBytes;
  final void Function(Uint8List bytes, String? path) onSave;
  final VoidCallback onRemove;

  const AvatarPickerSheet({
    super.key,
    required this.fullName,
    required this.currentBytes,
    required this.onSave,
    required this.onRemove,
  });

  @override
  State<AvatarPickerSheet> createState() => _AvatarPickerSheetState();
}

class _AvatarPickerSheetState extends State<AvatarPickerSheet> {
  final ImagePicker _picker = ImagePicker();
  Uint8List? _previewBytes;
  String? _previewPath;
  bool _loading = false;
  String? _error;

  Future<void> _pick(ImageSource source) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 720,
        maxHeight: 720,
        imageQuality: 85,
      );
      if (file != null) {
        final bytes = await file.readAsBytes();
        if (mounted) {
          setState(() {
            _previewBytes = bytes;
            _previewPath = file.path;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = source == ImageSource.camera
              ? 'Camera access is unavailable on this device or simulator.'
              : 'Unable to read image from gallery.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activePreview = _previewBytes ?? widget.currentBytes;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Profile Photo',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 4),
          Text(
            'Upload from your gallery, capture with camera, preview, or remove.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 20),
          UserAvatar(
            fullName: widget.fullName,
            avatarBytes: activePreview,
            size: 108,
          ),
          if (_previewBytes != null) ...[
            const SizedBox(height: 10),
            const Text(
              'Preview ready — tap Save Photo to apply',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: PhantomColors.accent,
              ),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 10),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: PhantomColors.rose, fontSize: 12.5),
            ),
          ],
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : () => _pick(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('Gallery'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : () => _pick(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Camera'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_previewBytes != null)
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () {
                  widget.onSave(_previewBytes!, _previewPath);
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Save Photo'),
              ),
            ),
          if (widget.currentBytes != null || _previewBytes != null) ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: () {
                  widget.onRemove();
                  Navigator.of(context).pop();
                },
                style: TextButton.styleFrom(foregroundColor: PhantomColors.rose),
                icon: const Icon(Icons.delete_outline),
                label: const Text('Remove Photo'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
