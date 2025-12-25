'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  licenseNumber?: string;
  isAdmin: boolean;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'NURSE',
    department: '',
    licenseNumber: '',
    password: '',
    isAdmin: false,
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('isActive', statusFilter);

      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/unlock`, {
        method: 'POST',
      });

      if (response.ok) {
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'ロック解除に失敗しました');
      }
    } catch (error) {
      console.error('Unlock user error:', error);
      alert('ロック解除中にエラーが発生しました');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeletingUser(null);
        // ページをリロードして変更を反映
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'NURSE',
      department: '',
      licenseNumber: '',
      password: '',
      isAdmin: false,
      isActive: true,
    });
    setShowAddModal(true);
    setEditingUser(null);
  };

  const handleOpenEditModal = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department || '',
      licenseNumber: user.licenseNumber || '',
      password: '',
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'NURSE',
      department: '',
      licenseNumber: '',
      password: '',
      isAdmin: false,
      isActive: true,
    });
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const body: any = {
        fullName: formData.fullName,
        role: formData.role,
        department: formData.department || null,
        isAdmin: formData.isAdmin,
        isActive: formData.isActive,
      };

      // Only include username, password, and auto-generated email for new users
      if (!editingUser) {
        body.username = formData.username;
        body.password = formData.password;
        body.email = `${formData.username}@dialog-ehr.local`; // Auto-generate email from username
        body.licenseNumber = null;
      } else {
        // For editing, include email and licenseNumber
        body.email = formData.email;
        body.licenseNumber = formData.licenseNumber || null;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        handleCloseModal();
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || (editingUser ? '更新に失敗しました' : '作成に失敗しました'));
      }
    } catch (error) {
      console.error('Submit user error:', error);
      alert(editingUser ? '更新中にエラーが発生しました' : '作成中にエラーが発生しました');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'NURSE': return 'bg-green-100 text-green-800';
      case 'PHARMACIST': return 'bg-purple-100 text-purple-800';
      case 'MEDICAL_CLERK': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      DOCTOR: '医師',
      NURSE: '看護師',
      PHARMACIST: '薬剤師',
      MEDICAL_CLERK: '医療事務',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 md:gap-6">
          <h1 className="text-white text-base md:text-lg font-semibold tracking-wide">Dialog Hospital</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors"
          >
            患者一覧
          </Link>
          <Link
            href="/settings"
            className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors"
          >
            設定
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">ユーザー管理</h2>
          <p className="text-sm text-gray-600 mt-1">システムユーザーの管理</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="氏名、ユーザー名、メールで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全ての役割</option>
                <option value="DOCTOR">医師</option>
                <option value="NURSE">看護師</option>
                <option value="PHARMACIST">薬剤師</option>
                <option value="MEDICAL_CLERK">医療事務</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全てのステータス</option>
                <option value="true">有効</option>
                <option value="false">無効</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              検索
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              + ユーザー追加
            </button>
          </div>
        </div>

        {/* User Table - Desktop */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">役割</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理者</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">部署</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終ログイン</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{user.username}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isAdmin && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        管理者
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.department || '-'}</td>
                  <td className="px-4 py-3">
                    {user.isLocked ? (
                      <span className="flex items-center text-xs text-red-600">
                        🔒 ロック中
                      </span>
                    ) : user.isActive ? (
                      <span className="flex items-center text-xs text-green-600">
                        ✓ 有効
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-gray-600">
                        ○ 無効
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ja-JP') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="編集"
                      >
                        編集
                      </button>
                      {user.isLocked && (
                        <button
                          onClick={() => handleUnlockUser(user.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                          title="ロック解除"
                        >
                          解除
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="削除"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ユーザーが見つかりません
            </div>
          )}
        </div>

        {/* User Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                  <p className="text-sm text-gray-600 font-mono">@{user.username}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  {user.isAdmin && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      管理者
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">メール:</span>
                  <span className="text-gray-700">{user.email}</span>
                </div>
                {user.department && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">部署:</span>
                    <span className="text-gray-700">{user.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">ステータス:</span>
                  {user.isLocked ? (
                    <span className="text-red-600">🔒 ロック中</span>
                  ) : user.isActive ? (
                    <span className="text-green-600">✓ 有効</span>
                  ) : (
                    <span className="text-gray-600">○ 無効</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  編集
                </button>
                {user.isLocked && (
                  <button
                    onClick={() => handleUnlockUser(user.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    解除
                  </button>
                )}
                <button
                  onClick={() => setDeletingUser(user)}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              ユーザーが見つかりません
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingUser ? 'ユーザー編集' : 'ユーザー追加'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username - only for new users */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ユーザー名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin"
                    />
                  </div>
                )}

                {/* Email - only for editing */}
                {editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>
                )}

                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田 太郎"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役割 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DOCTOR">医師</option>
                    <option value="NURSE">看護師</option>
                    <option value="PHARMACIST">薬剤師</option>
                    <option value="MEDICAL_CLERK">医療事務</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部署
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="内科"
                  />
                </div>

                {/* Admin Permission */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isAdmin}
                      onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">管理者権限を付与</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    管理者権限を持つユーザーは、ユーザー管理や設定変更など、すべての機能にアクセスできます。
                  </p>
                </div>

                {/* License Number - only for editing */}
                {editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      免許番号
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="医師免許番号など"
                    />
                  </div>
                )}

                {/* Password - only for new users */}
                {!editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      初期パスワード <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8文字以上、大文字・小文字・数字・記号を含む"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      8文字以上、大文字・小文字・数字・記号を各1文字以上含めてください
                    </p>
                  </div>
                )}

                {/* Active Status - only for editing */}
                {editingUser && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">アカウントを有効化</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingUser ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ユーザー削除の確認</h3>
              <p className="text-gray-600 mb-4">
                本当に以下のユーザーを削除しますか？
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-800">{deletingUser.fullName}</p>
                <p className="text-sm text-gray-600">@{deletingUser.username}</p>
                <p className="text-sm text-gray-600">{deletingUser.email}</p>
              </div>
              <p className="text-sm text-red-600 mb-6">
                ※ この操作は取り消せません。アカウントは無効化されます。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
