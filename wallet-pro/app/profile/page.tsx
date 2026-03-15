'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (!formData.name.trim()) {
      setError('Name is required');
      setIsSaving(false);
      return;
    }

    try {
      // TODO: Implement profile update API endpoint
      // For now, just show success
      setSuccess('Profile updated successfully');
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Profile Card */}
          <Card className="p-6 border-primary/20 bg-card/50">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your account information</p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-600 rounded-md text-sm">
                {success}
              </div>
            )}

            {isEditing ? (
              // Edit Mode
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled
                    className="h-10 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-foreground">{formData.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-foreground">{formData.email}</p>
                  </div>
                </div>

                {user?.createdAt && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card className="p-4 bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">Account Status</p>
              <p className="text-xl font-semibold text-green-600">Active</p>
            </Card>
            <Card className="p-4 bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">Verification</p>
              <p className="text-xl font-semibold text-foreground">Email Verified</p>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
