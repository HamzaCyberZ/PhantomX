import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';

class ThreatIntelScreen extends StatefulWidget {
  final PhantomController controller;

  const ThreatIntelScreen({super.key, required this.controller});

  @override
  State<ThreatIntelScreen> createState() => _ThreatIntelScreenState();
}

class _ThreatIntelScreenState extends State<ThreatIntelScreen> {
  final TextEditingController _questionCtrl = TextEditingController();
  final List<(String question, String answer)> _history = [];
  bool _asking = false;

  @override
  void dispose() {
    _questionCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendQuestion([String? preset]) async {
    final text = (preset ?? _questionCtrl.text).trim();
    if (text.isEmpty || _asking) return;
    setState(() => _asking = true);
    if (preset == null) _questionCtrl.clear();
    final reply = await widget.controller.askThreatAssistant(text);
    if (mounted) {
      setState(() {
        _history.insert(0, (text, reply));
        _asking = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final briefing = widget.controller.aiBriefing;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.auto_awesome_rounded,
                      color: PhantomColors.accent,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'PhantomX Threat Intelligence',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(briefing.executiveSummary),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: PhantomColors.amber.withValues(alpha: 0.12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Inferred Attack Chain',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: PhantomColors.amber,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(briefing.attackChain),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                ...briefing.immediateActions.map(
                  (action) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.check_circle_outline,
                          size: 17,
                          color: PhantomColors.emerald,
                        ),
                        const SizedBox(width: 8),
                        Expanded(child: Text(action)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: widget.controller.isAnalyzingAi
                        ? null
                        : widget.controller.runAiAnalysis,
                    icon: widget.controller.isAnalyzingAi
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.refresh_rounded),
                    label: Text(
                      widget.controller.isAnalyzingAi
                          ? 'Synthesizing Telemetry...'
                          : 'Re-run Deep Behavioural Analysis',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ask Threat Investigation Console',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(
                      label: const Text('Explain TCP SYN sweep'),
                      onPressed: () =>
                          _sendQuestion('Explain the lateral TCP SYN port scan'),
                    ),
                    ActionChip(
                      label: const Text('Inspect unrecognized-esp-9f2'),
                      onPressed: () => _sendQuestion(
                        'Why is unrecognized-esp-9f2 flagged high risk?',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _questionCtrl,
                        onSubmitted: (_) => _sendQuestion(),
                        decoration: const InputDecoration(
                          hintText: 'Ask about an IP, port, or anomaly...',
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _asking ? null : () => _sendQuestion(),
                      icon: const Icon(Icons.send_rounded),
                    ),
                  ],
                ),
                if (_history.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  ..._history.map(
                    (entry) => Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Theme.of(context)
                            .colorScheme
                            .primary
                            .withValues(alpha: 0.08),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.$1,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(entry.$2),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
