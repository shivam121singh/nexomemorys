// Base URL for the Express API
const API_BASE_URL = 'http://localhost:5000/api';

const LoreAPI = {
  // Fetch all stored memories
  async fetchMemories() {
    try {
      const res = await fetch(`${API_BASE_URL}/memories`);
      if (!res.ok) throw new Error('Could not fetch vault records');
      return await res.json();
    } catch (err) {
      console.error('API Error [fetchMemories]:', err);
      return [];
    }
  },

  // Upload new photo/video
  async uploadMemory(formData) {
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Increment like count
  async likeMemory(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/memories/${id}/like`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      console.error('API Error [likeMemory]:', err);
    }
  }
};