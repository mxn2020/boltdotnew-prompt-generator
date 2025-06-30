import React from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { 
  useUserPreferences, 
  useUpdatePreferences, 
  useAPIKeys, 
  useCreateAPIKey, 
  useDeleteAPIKey 
} from '../hooks/useProfile';
import { PricingPlans } from '../components/payment/PricingPlans';
import { CreditsDisplaySettings } from '../components/payment/CreditsDisplaySettings';
import { SimpleThemeToggle } from '../components/SimpleThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import type { UpdatePreferencesData, CreateAPIKeyData } from '../types/user';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'general';
  const [activeSection, setActiveSection] = React.useState<'general' | 'notifications' | 'privacy' | 'billing' | 'account'>(defaultTab as any);

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
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
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
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id as any)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.label}
                  </Button>
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

            {activeSection === 'billing' && (
              <BillingSettings />
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

function BillingSettings() {
  return (
    <div className="space-y-8">
      {/* Current Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Credits & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <CreditsDisplaySettings showTransactions={true} />
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingPlans />
        </CardContent>
      </Card>
    </div>
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
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="space-y-3">
          <Label>Theme Preference</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Current Theme</p>
              <p className="text-xs text-muted-foreground">Click to cycle through Light → Dark → System</p>
            </div>
            <SimpleThemeToggle />
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Default Language</Label>
          <Select value={preferences.language} onValueChange={(value) => onUpdate({ language: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="german">German</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={preferences.timezone} onValueChange={(value) => onUpdate({ timezone: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto-save */}
        <div className="space-y-2">
          <Label>Auto-save Interval</Label>
          <Select 
            value={preferences.auto_save_interval?.toString()} 
            onValueChange={(value) => onUpdate({ auto_save_interval: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="0">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default Prompt Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Structure Type</Label>
            <Select 
              value={preferences.default_structure_type} 
              onValueChange={(value) => onUpdate({ default_structure_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
                <SelectItem value="modulized">Modulized</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Complexity</Label>
            <Select 
              value={preferences.default_complexity} 
              onValueChange={(value) => onUpdate({ default_complexity: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.key} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium">{notification.label}</h3>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
            </div>
            <Switch
              checked={preferences[notification.key]}
              onCheckedChange={(checked) => onUpdate({ [notification.key]: checked })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Privacy */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Default Prompt Privacy</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="private"
                checked={!preferences.default_prompt_privacy}
                onChange={() => onUpdate({ default_prompt_privacy: false })}
                className="text-primary focus:ring-primary"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="private" className="text-sm font-medium">
                  Private
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only you can see your prompts by default
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="public"
                checked={preferences.default_prompt_privacy}
                onChange={() => onUpdate({ default_prompt_privacy: true })}
                className="text-primary focus:ring-primary"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="public" className="text-sm font-medium">
                  Public
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your prompts are visible to the community by default
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Collection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Data & Analytics</h3>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <h4 className="font-medium">Usage Analytics</h4>
              <p className="text-sm mt-1">
                We collect anonymous usage data to improve the platform. This includes prompt creation patterns, 
                feature usage, and performance metrics. No personal information or prompt content is included.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Account Visibility */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Profile Visibility</h3>
          <p className="text-sm text-muted-foreground">
            Your profile is always visible to other users. You can control what information is displayed 
            by editing your profile details.
          </p>
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your AI provider API keys for prompt generation
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Add your OpenAI or Anthropic API keys to enable AI-powered prompt generation
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Add Your First API Key
              </Button>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge variant={apiKey.provider === 'openai' ? 'default' : 'secondary'}>
                          {apiKey.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                        </Badge>
                        {apiKey.is_active && (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-muted-foreground font-mono">
                          {showKeys[apiKey.id] ? apiKey.key_preview : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                        {apiKey.last_used && ` • Last used ${new Date(apiKey.last_used).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteKey(apiKey.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create API Key Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
            </DialogHeader>
            <CreateAPIKeyForm
              onSubmit={async (data) => {
                await onCreateKey(data);
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface CreateAPIKeyFormProps {
  onSubmit: (data: CreateAPIKeyData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function CreateAPIKeyForm({ onSubmit, onCancel, isLoading }: CreateAPIKeyFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key-name">Key Name</Label>
        <Input
          id="key-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., My OpenAI Key"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Provider</Label>
        <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value as any }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={formData.api_key}
          onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
          placeholder={formData.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
          required
        />
        <p className="text-xs text-muted-foreground">
          Your API key is stored securely and never shared
        </p>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.name.trim() || !formData.api_key.trim()}
        >
          {isLoading ? 'Adding...' : 'Add Key'}
        </Button>
      </DialogFooter>
    </form>
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
    alert('Account deletion would be implemented here');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div>
           <Label className="text-sm font-medium">Email Address</Label>
           <p className="mt-1 text-sm">{user?.email}</p>
         </div>
         
         <div>
           <Label className="text-sm font-medium">Account ID</Label>
           <p className="mt-1 text-sm text-muted-foreground font-mono">{user?.id}</p>
         </div>
         
         <div>
           <Label className="text-sm font-medium">Member Since</Label>
           <p className="mt-1 text-sm">
             {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
           </p>
         </div>
       </CardContent>
     </Card>

     {/* Security */}
     <Card>
       <CardHeader>
         <CardTitle>Security</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <Button variant="outline" className="w-full justify-between h-auto p-4">
           <div className="text-left">
             <h3 className="font-medium">Change Password</h3>
             <p className="text-sm text-muted-foreground">Update your account password</p>
           </div>
           <div className="text-muted-foreground">→</div>
         </Button>
         
         <Button variant="outline" className="w-full justify-between h-auto p-4">
           <div className="text-left">
             <h3 className="font-medium">Two-Factor Authentication</h3>
             <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
           </div>
           <div className="text-muted-foreground">→</div>
         </Button>
       </CardContent>
     </Card>

     {/* Actions */}
     <Card>
       <CardHeader>
         <CardTitle>Account Actions</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <Button
           variant="outline"
           className="w-full justify-between h-auto p-4"
           onClick={handleSignOut}
         >
           <div className="text-left">
             <h3 className="font-medium">Sign Out</h3>
             <p className="text-sm text-muted-foreground">Sign out of your account</p>
           </div>
           <div className="text-muted-foreground">→</div>
         </Button>
         
         <Button
           variant="outline"
           className="w-full justify-between h-auto p-4 border-destructive hover:bg-destructive/5"
           onClick={() => setShowDeleteConfirm(true)}
         >
           <div className="text-left">
             <h3 className="font-medium text-destructive">Delete Account</h3>
             <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
           </div>
           <div className="text-destructive">→</div>
         </Button>
       </CardContent>
     </Card>

     {/* Delete Confirmation Dialog */}
     <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
       <DialogContent>
         <DialogHeader>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
               <AlertTriangle className="w-5 h-5 text-destructive" />
             </div>
             <DialogTitle>Delete Account</DialogTitle>
           </div>
         </DialogHeader>
         
         <p className="text-muted-foreground">
           Are you sure you want to delete your account? This action cannot be undone and will permanently 
           remove all your prompts, collections, and account data.
         </p>
         
         <DialogFooter className="gap-2">
           <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
             Cancel
           </Button>
           <Button variant="destructive" onClick={handleDeleteAccount}>
             Delete Account
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 );
}