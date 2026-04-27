const API_URL = 'https://happe-backend-production.up.railway.app';

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

  createPost: async (formData: FormData, token: string) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },
};