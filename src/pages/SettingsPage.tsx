import React from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Key, 
  Palette, 
  Globe, 
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { 
  useUserPreferences, 
  useUpdatePreferences, 
  useAPIKeys, 
  useCreateAPIKey, 
  useDeleteAPIKey 
} from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import type { UpdatePreferencesData, CreateAPIKeyData } from '../types/user';

export function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState<'general' | 'notifications' | 'privacy' | 'api-keys' | 'account'>('general');

  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const { data: apiKeys } = useAPIKeys();
  const createAPIKey = useCreateAPIKey();
  const deleteAPIKey = useDeleteAPIKey();

  const handleUpdatePreferences = async (updates: UpdatePreferencesData) => {
    try {
      await updatePreferences.mutateAsync(updates);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account preferences and platform configuration
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors',
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeSection === 'general' && (
              <GeneralSettings
                preferences={preferences}
                onUpdate={handleUpdatePreferences}
                isLoading={updatePreferences.isPending}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationSettings
                preferences={preferences}
                onUpdate={handleUpdatePreferences}
                isLoading={updatePreferences.isPending}
              />
            )}

            {activeSection === 'privacy' && (
              <PrivacySettings
                preferences={preferences}
                onUpdate={handleUpdatePreferences}
                isLoading={updatePreferences.isPending}
              />
            )}

            {activeSection === 'api-keys' && (
              <APIKeysSettings
                apiKeys={apiKeys || []}
                onCreateKey={createAPIKey.mutateAsync}
                onDeleteKey={deleteAPIKey.mutateAsync}
                isCreating={createAPIKey.isPending}
                isDeleting={deleteAPIKey.isPending}
              />
            )}

            {activeSection === 'account' && (
              <AccountSettings />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface GeneralSettingsProps {
  preferences: any;
  onUpdate: (updates: UpdatePreferencesData) => void;
  isLoading: boolean;
}

function GeneralSettings({ preferences, onUpdate, isLoading }: GeneralSettingsProps) {
  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>

      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'system', label: 'System', icon: '💻' },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => onUpdate({ theme: theme.value as any })}
                className={cn(
                  'p-3 rounded-lg border text-center transition-colors',
                  preferences.theme === theme.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="text-2xl mb-1">{theme.icon}</div>
                <div className="text-sm font-medium">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="spanish">Spanish</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={preferences.timezone}
            onChange={(e) => onUpdate({ timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        {/* Auto-save */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-save Interval (seconds)
          </label>
          <select
            value={preferences.auto_save_interval}
            onChange={(e) => onUpdate({ auto_save_interval: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={0}>Disabled</option>
          </select>
        </div>

        {/* Default Prompt Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Structure Type
            </label>
            <select
              value={preferences.default_structure_type}
              onChange={(e) => onUpdate({ default_structure_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="standard">Standard</option>
              <option value="structured">Structured</option>
              <option value="modulized">Modulized</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Complexity
            </label>
            <select
              value={preferences.default_complexity}
              onChange={(e) => onUpdate({ default_complexity: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationSettingsProps {
  preferences: any;
  onUpdate: (updates: UpdatePreferencesData) => void;
  isLoading: boolean;
}

function NotificationSettings({ preferences, onUpdate, isLoading }: NotificationSettingsProps) {
  if (!preferences) return <div>Loading...</div>;

  const notifications = [
    {
      key: 'email_notifications',
      label: 'Email Notifications',
      description: 'Receive important updates via email',
    },
    {
      key: 'marketing_emails',
      label: 'Marketing Emails',
      description: 'Receive product updates and promotional content',
    },
    {
      key: 'weekly_digest',
      label: 'Weekly Digest',
      description: 'Get a summary of your activity and trending prompts',
    },
    {
      key: 'prompt_updates',
      label: 'Prompt Updates',
      description: 'Notifications when your prompts receive likes or comments',
    },
    {
      key: 'collaboration_invites',
      label: 'Collaboration Invites',
      description: 'Notifications for team invitations and collaboration requests',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.key} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{notification.label}</h3>
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences[notification.key]}
                onChange={(e) => onUpdate({ [notification.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PrivacySettingsProps {
  preferences: any;
  onUpdate: (updates: UpdatePreferencesData) => void;
  isLoading: boolean;
}

function PrivacySettings({ preferences, onUpdate, isLoading }: PrivacySettingsProps) {
  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        {/* Default Privacy */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Default Prompt Privacy</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                checked={!preferences.default_prompt_privacy}
                onChange={() => onUpdate({ default_prompt_privacy: false })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Private</div>
                <div className="text-sm text-gray-600">Only you can see your prompts by default</div>
              </div>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                checked={preferences.default_prompt_privacy}
                onChange={() => onUpdate({ default_prompt_privacy: true })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Public</div>
                <div className="text-sm text-gray-600">Your prompts are visible to the community by default</div>
              </div>
            </label>
          </div>
        </div>

        {/* Data Collection */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Data & Analytics</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Usage Analytics</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We collect anonymous usage data to improve the platform. This includes prompt creation patterns, 
                  feature usage, and performance metrics. No personal information or prompt content is included.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Visibility */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Profile Visibility</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your profile is always visible to other users. You can control what information is displayed 
            by editing your profile details.
          </p>
        </div>
      </div>
    </div>
  );
}

interface APIKeysSettingsProps {
  apiKeys: any[];
  onCreateKey: (data: CreateAPIKeyData) => Promise<any>;
  onDeleteKey: (keyId: string) => Promise<any>;
  isCreating: boolean;
  isDeleting: boolean;
}

function APIKeysSettings({ apiKeys, onCreateKey, onDeleteKey, isCreating, isDeleting }: APIKeysSettingsProps) {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({});

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600">
            Manage your AI provider API keys for prompt generation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add API Key</span>
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Key className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys</h3>
            <p className="text-gray-600 mb-4">
              Add your OpenAI or Anthropic API keys to enable AI-powered prompt generation
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Your First API Key
            </button>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      apiKey.provider === 'openai' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    )}>
                      {apiKey.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                    </span>
                    {apiKey.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm text-gray-600 font-mono">
                      {showKeys[apiKey.id] ? '••••••••••••••••' : apiKey.key_preview}
                    </code>
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(apiKey.created_at).toLocaleDateString()}
                    {apiKey.last_used && ` • Last used ${new Date(apiKey.last_used).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteKey(apiKey.id)}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateForm && (
        <CreateAPIKeyModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={async (data) => {
            await onCreateKey(data);
            setShowCreateForm(false);
          }}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}

interface CreateAPIKeyModalProps {
  onClose: () => void;
  onSubmit: (data: CreateAPIKeyData) => Promise<void>;
  isLoading: boolean;
}

function CreateAPIKeyModal({ onClose, onSubmit, isLoading }: CreateAPIKeyModalProps) {
  const [formData, setFormData] = React.useState<CreateAPIKeyData>({
    name: '',
    provider: 'openai',
    api_key: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.api_key.trim()) {
      await onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add API Key</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., My OpenAI Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder={formData.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored securely and never shared
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.api_key.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { user, signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    alert('Account deletion would be implemented here');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Account ID</label>
            <p className="mt-1 text-sm text-gray-600 font-mono">{user?.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
        
        <div className="space-y-4">
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>
          
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
        
        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left p-4 border border-red-200 rounded-lg hover:border-red-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <div className="text-red-400">→</div>
            </div>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently 
                remove all your prompts, collections, and account data.
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}