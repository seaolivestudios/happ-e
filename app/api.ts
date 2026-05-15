const API_URL = 'https://happe-backend-production.up.railway.app';
const CLOUDINARY_CLOUD = 'dspvqmbox';
const CLOUDINARY_PRESET = 'ml_default';

export const uploadMedia = async (uri: string, type: 'image' | 'video'): Promise<string> => {
  const filename = uri.split('/').pop() ?? (type === 'video' ? 'upload.mp4' : 'upload.jpg');
  const mimeType = type === 'video' ? 'video/mp4' : 'image/jpeg';
  const resourceType = type === 'video' ? 'video' : 'image';

  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: mimeType } as any);
  formData.append('upload_preset', CLOUDINARY_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? `Upload failed (HTTP ${response.status})`);
  return data.secure_url;
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  // Posts
  getPosts: async (token: string, cursor?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    const response = await fetch(`${API_URL}/posts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getTrendingPosts: async (token: string, cursor?: string) => {
    const params = new URLSearchParams({ trending: 'true' });
    if (cursor) params.set('cursor', cursor);
    const response = await fetch(`${API_URL}/posts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getNewPosts: async (token: string, since: string) => {
    const response = await fetch(
      `${API_URL}/posts?since=${encodeURIComponent(since)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getFollowingPosts: async (token: string, cursor?: string) => {
    const params = new URLSearchParams({ following: 'true' });
    if (cursor) params.set('cursor', cursor);
    const response = await fetch(`${API_URL}/posts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deletePost: async (postId: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getConversations: async (token: string) => {
    const response = await fetch(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getMessages: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  sendMessage: async (userId: string, text: string, token: string, gif_url?: string) => {
    const response = await fetch(`${API_URL}/messages/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, gif_url }),
    });
    return response.json();
  },

  getUnreadMessageCount: async (token: string) => {
    const response = await fetch(`${API_URL}/messages/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteComment: async (postId: string, commentId: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  reportPost: async (postId: string, reason: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  markMessagesRead: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/messages/${userId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getPostsByCategory: async (category: string) => {
    const response = await fetch(`${API_URL}/posts?category=${encodeURIComponent(category)}`);
    return response.json();
  },

  getPostsForYou: async (token: string, cursor?: string) => {
    const params = new URLSearchParams({ mood: 'true' });
    if (cursor) params.set('cursor', cursor);
    const response = await fetch(`${API_URL}/posts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getPost: async (id: string) => {
    const response = await fetch(`${API_URL}/posts/${id}`);
    return response.json();
  },

  smilePost: async (postId: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}/smile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  commentPost: async (postId: string, text: string, user: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, user }),
    });
    return response.json();
  },

  createPost: async (payload: { type: string; text: string; image_url?: string; video_url?: string; category?: string; widescreen?: boolean }, token: string) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  registerPushToken: async (pushToken: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pushToken }),
    });
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },

  deleteAccount: async (password: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    return response.json();
  },

  getMyInterests: async (token: string) => {
    const response = await fetch(`${API_URL}/profile/me/interests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateInterests: async (interests: string[], token: string) => {
    const response = await fetch(`${API_URL}/profile/me/interests`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ interests }),
    });
    return response.json();
  },

  completeOnboarding: async (interests: string[], token: string) => {
    const response = await fetch(`${API_URL}/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interests }),
    });
    return response.json();
  },

  getMyPosts: async (token: string) => {
    const response = await fetch(`${API_URL}/profile/me/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Users
  searchUsers: async (q: string) => {
    const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`);
    return response.json();
  },

  getSuggestedUsers: async () => {
    const response = await fetch(`${API_URL}/users/suggested`);
    return response.json();
  },

  getUser: async (userId: string) => {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },

  checkFollow: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/follows/${userId}/check`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  follow: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/follows/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  unfollow: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/follows/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Notifications
  getNotifications: async (token: string) => {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  markAllNotificationsRead: async (token: string) => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Sparks
  getCurrentSpark: async () => {
    const response = await fetch(`${API_URL}/sparks/current`);
    return response.json();
  },

  getSparkResponses: async () => {
    const response = await fetch(`${API_URL}/sparks/current/responses`);
    return response.json();
  },

  respondToSpark: async (payload: { type: string; text: string; image_url?: string; video_url?: string }, token: string) => {
    const response = await fetch(`${API_URL}/sparks/current/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    return response.json();
  },

  // Blocked users
  blockUser: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/users/${userId}/block`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  unblockUser: async (userId: string, token: string) => {
    const response = await fetch(`${API_URL}/users/${userId}/block`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getBlockedUsers: async (token: string) => {
    const response = await fetch(`${API_URL}/users/blocked`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Notification preferences
  updateNotificationPrefs: async (prefs: { push: boolean; inspire: boolean; comments: boolean; likes: boolean }, token: string) => {
    const response = await fetch(`${API_URL}/profile/me/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(prefs),
    });
    return response.json();
  },

  // Post editing
  editPost: async (postId: string, text: string, token: string) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    return response.json();
  },

  // Post search
  searchPosts: async (q: string) => {
    const response = await fetch(`${API_URL}/posts/search?q=${encodeURIComponent(q)}`);
    return response.json();
  },

  // Profile update with handle
  updateProfile: async (data: { name: string; bio: string; category: string; location: string; website: string; avatar_url?: string; handle?: string }, token: string) => {
    const response = await fetch(`${API_URL}/profile/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};