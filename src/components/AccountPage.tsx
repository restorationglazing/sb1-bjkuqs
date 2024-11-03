import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Save, ArrowLeft, Crown, Loader } from 'lucide-react';
import { auth, getUserData, updateUserData, type UserData, signOutUser } from '../utils/firebase';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    dietaryRestrictions: [] as string[],
    servingSize: 2,
    theme: 'light' as 'light' | 'dark'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        try {
          setIsLoading(true);
          // Force refresh to get latest premium status
          const data = await getUserData(auth.currentUser.uid, true);
          setUserData(data);
          setFormData({
            username: data.username,
            dietaryRestrictions: data.preferences.dietaryRestrictions,
            servingSize: data.preferences.servingSize,
            theme: data.preferences.theme
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load user data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateUserData(auth.currentUser.uid, {
        username: formData.username,
        preferences: {
          dietaryRestrictions: formData.dietaryRestrictions,
          servingSize: formData.servingSize,
          theme: formData.theme
        }
      });
      setIsEditing(false);
      // Refresh user data
      const updatedData = await getUserData(auth.currentUser.uid, true);
      setUserData(updatedData);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Failed to update account settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading account settings...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load account data</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Membership Status */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-4">
            <Crown className={`w-8 h-8 ${userData.isPremium ? 'text-amber-500' : 'text-gray-400'}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Membership Status</h3>
              <p className={`text-lg ${userData.isPremium ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                {userData.isPremium ? 'Premium Member' : 'Free Account'}
              </p>
              {userData.isPremium && userData.premiumSince && (
                <p className="text-sm text-gray-500 mt-1">
                  Member since: {new Date(userData.premiumSince).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
              />
            ) : (
              <p className="text-gray-600">{userData.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-600">{userData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Serving Size
            </label>
            {isEditing ? (
              <select
                value={formData.servingSize}
                onChange={(e) => setFormData({ ...formData, servingSize: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-600">
                {userData.preferences.servingSize} {userData.preferences.servingSize === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Restrictions
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'].map((restriction) => (
                  <label key={restriction} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.dietaryRestrictions.includes(restriction)}
                      onChange={(e) => {
                        const newRestrictions = e.target.checked
                          ? [...formData.dietaryRestrictions, restriction]
                          : formData.dietaryRestrictions.filter((r) => r !== restriction);
                        setFormData({ ...formData, dietaryRestrictions: newRestrictions });
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{restriction}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {userData.preferences.dietaryRestrictions.length > 0
                  ? userData.preferences.dietaryRestrictions.join(', ')
                  : 'None'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            {isEditing ? (
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            ) : (
              <p className="text-gray-600 capitalize">{userData.preferences.theme}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="pt-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;