import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/api_endpoints.dart';
import '../../constants/app_icons.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';

class AdminAccountsScreen extends StatefulWidget {
  const AdminAccountsScreen({super.key});

  @override
  State<AdminAccountsScreen> createState() => _AdminAccountsScreenState();
}

class _AdminAccountsScreenState extends State<AdminAccountsScreen> {
  List<UserModel> _users = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedFilter = 'ALL'; // ALL, PASSENGER, DRIVER, SUSPENDED, BLOCKED

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.get(ApiEndpoints.users);
      if (res.success && res.data is List) {
        final list = (res.data as List).map((json) => UserModel.fromJson(json)).toList();
        setState(() {
          _users = list;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateAccountStatus(UserModel user, String newStatus) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${newStatus.toUpperCase()} Account?'),
        content: Text('Are you sure you want to set status for "${user.name}" to $newStatus?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: newStatus == 'BLOCKED' ? AppColors.sosRed : (newStatus == 'SUSPENDED' ? AppColors.warning : AppColors.success),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(newStatus, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final res = await ApiService.put(ApiEndpoints.userStatus(user.id), {
      'status': newStatus,
    });

    if (res.success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Account "${user.name}" updated to $newStatus successfully.'),
          backgroundColor: newStatus == 'BLOCKED' ? AppColors.sosRed : AppColors.success,
        ),
      );
      _fetchUsers();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.message ?? 'Update failed'), backgroundColor: AppColors.sosRed),
      );
    }
  }

  Future<void> _showUpdateAccountDialog(UserModel user) async {
    final nameController = TextEditingController(text: user.name);
    final phoneController = TextEditingController(text: user.phone ?? '');
    String selectedRole = user.role;

    final updated = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('Update Account: ${user.name}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(LucideIcons.user, size: 18)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneController,
                  decoration: const InputDecoration(labelText: 'Phone Number', prefixIcon: Icon(LucideIcons.phone, size: 18)),
                ),
                const SizedBox(height: 16),
                const Text('Role Authorization', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: selectedRole,
                  items: const [
                    DropdownMenuItem(value: 'PASSENGER', child: Text('PASSENGER')),
                    DropdownMenuItem(value: 'DRIVER', child: Text('DRIVER')),
                    DropdownMenuItem(value: 'ADMIN', child: Text('ADMIN')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => selectedRole = val);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );

    if (updated == true) {
      final res = await ApiService.put(ApiEndpoints.userStatus(user.id), {
        'name': nameController.text.trim(),
        'phone': phoneController.text.trim(),
        'role': selectedRole,
      });

      if (res.success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account details updated successfully!'), backgroundColor: AppColors.success),
        );
        _fetchUsers();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.message ?? 'Update failed'), backgroundColor: AppColors.sosRed),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    // Filter users
    final filtered = _users.where((u) {
      final q = _searchQuery.toLowerCase();
      final matchesSearch = u.name.toLowerCase().contains(q) ||
          u.email.toLowerCase().contains(q) ||
          (u.phone?.toLowerCase().contains(q) ?? false);

      if (!matchesSearch) return false;

      if (_selectedFilter == 'PASSENGER') return u.role == 'PASSENGER';
      if (_selectedFilter == 'DRIVER') return u.role == 'DRIVER';
      if (_selectedFilter == 'SUSPENDED') return u.status == 'SUSPENDED';
      if (_selectedFilter == 'BLOCKED') return u.status == 'BLOCKED';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        title: const Text('Manage Accounts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            tooltip: 'Refresh',
            onPressed: _fetchUsers,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(16),
            color: cardBg,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: TextStyle(color: textPrimary, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Search by name, email, or phone...',
                    prefixIcon: const Icon(LucideIcons.search, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    filled: true,
                    fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All (${_users.length})'),
                      const SizedBox(width: 8),
                      _buildFilterChip('PASSENGER', 'Passengers'),
                      const SizedBox(width: 8),
                      _buildFilterChip('DRIVER', 'Drivers'),
                      const SizedBox(width: 8),
                      _buildFilterChip('SUSPENDED', 'Suspended'),
                      const SizedBox(width: 8),
                      _buildFilterChip('BLOCKED', 'Blocked'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // User Accounts List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : filtered.isEmpty
                    ? Center(
                        child: Text(
                          'No accounts found matching criteria.',
                          style: TextStyle(color: isDark ? Colors.white54 : Colors.black54),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final user = filtered[index];
                          return _buildUserCard(user, cardBg, isDark, textPrimary);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      selected: isSelected,
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.black : null,
        ),
      ),
      selectedColor: AppColors.primary,
      onSelected: (_) => setState(() => _selectedFilter = key),
    );
  }

  Widget _buildUserCard(UserModel user, Color cardBg, bool isDark, Color textPrimary) {
    Color statusColor;
    if (user.status == 'BLOCKED') {
      statusColor = AppColors.sosRed;
    } else if (user.status == 'SUSPENDED') {
      statusColor = AppColors.warning;
    } else {
      statusColor = AppColors.success;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: user.status == 'BLOCKED'
              ? AppColors.sosRed.withValues(alpha: 0.5)
              : (isDark ? AppColors.borderDark : AppColors.borderLight),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                child: Text(
                  user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            user.name,
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: textPrimary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: user.role == 'DRIVER'
                                ? Colors.blue.withValues(alpha: 0.2)
                                : (user.role == 'ADMIN' ? Colors.purple.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            user.role,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: user.role == 'DRIVER'
                                  ? Colors.blue
                                  : (user.role == 'ADMIN' ? Colors.purple : AppColors.primary),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(user.email, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  user.status,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 10),
          // Action Buttons: Block, Suspend, Update
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Update Button
              TextButton.icon(
                style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                icon: const Icon(LucideIcons.edit2, size: 14),
                label: const Text('Update', style: TextStyle(fontSize: 12)),
                onPressed: () => _showUpdateAccountDialog(user),
              ),
              const SizedBox(width: 6),

              // Suspend / Unsuspend
              if (user.status == 'SUSPENDED')
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    side: const BorderSide(color: AppColors.success),
                  ),
                  icon: const Icon(LucideIcons.checkCircle, size: 14, color: AppColors.success),
                  label: const Text('Activate', style: TextStyle(fontSize: 12, color: AppColors.success)),
                  onPressed: () => _updateAccountStatus(user, 'ACTIVE'),
                )
              else
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    side: const BorderSide(color: AppColors.warning),
                  ),
                  icon: const Icon(LucideIcons.pauseCircle, size: 14, color: AppColors.warning),
                  label: const Text('Suspend', style: TextStyle(fontSize: 12, color: AppColors.warning)),
                  onPressed: () => _updateAccountStatus(user, 'SUSPENDED'),
                ),
              const SizedBox(width: 6),

              // Block / Unblock
              if (user.status == 'BLOCKED')
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    backgroundColor: AppColors.success,
                  ),
                  icon: const Icon(LucideIcons.check, size: 14, color: Colors.white),
                  label: const Text('Unblock', style: TextStyle(fontSize: 12, color: Colors.white)),
                  onPressed: () => _updateAccountStatus(user, 'ACTIVE'),
                )
              else
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    backgroundColor: AppColors.sosRed,
                  ),
                  icon: const Icon(LucideIcons.ban, size: 14, color: Colors.white),
                  label: const Text('Block', style: TextStyle(fontSize: 12, color: Colors.white)),
                  onPressed: () => _updateAccountStatus(user, 'BLOCKED'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
