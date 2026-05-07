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
  if (!data.secure_url) throw new Error(data.error?.message ?? 'Upload failed');
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
  getPosts: async (token: string) => {
    const response = await fetch(`${API_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getPostsByCategory: async (category: string) => {
    const response = await fetch(`${API_URL}/posts?category=${encodeURIComponent(category)}`);
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

  createPost: async (payload: { type: string; text: string; image_url?: string; video_url?: string }, token: string) => {
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
};