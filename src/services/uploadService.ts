import api from '../lib/api';

export const uploadService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadFile(
    _file: File,
    _bucket: string,
    _path: string,
    _onProgress?: (progress: number) => void
  ): Promise<{ data: any; error: any }> {
    // Not using buckets, just generic upload
    // We can simulate success or implement a generic file upload endpoint if needed
    return { data: { path: _path }, error: null };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getPublicUrl(_bucket: string, _path: string): Promise<string> {
    // Not applicable
    return '';
  },

  async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const { data } = await api.post('/auth/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return data.avatarUrl;
    } catch (error) {
        console.error("Error uploading profile image", error);
        throw error;
    }
  },

  async uploadStudyMaterial(
    file: File, 
    userId: string, 
    analysis: any,
    groupId?: string,
    isPublic: boolean = false
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('type', file.type.startsWith('image') ? 'image' : 'pdf'); // Simplification
      formData.append('content', 'File content'); // Placeholder
      formData.append('analysis', JSON.stringify(analysis));
      if (groupId) formData.append('groupId', groupId);
      formData.append('isPublic', String(isPublic));

      const { data } = await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      console.error('Error uploading study material:', error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadChatFile(_file: File, _userId: string, _groupId: string): Promise<string> {
    // Not implemented
    return '';
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserMaterials(userId: string): Promise<any[]> {
    try {
      const { data } = await api.get('/materials');
      return data;
    } catch (error) {
      console.error('Error fetching user materials:', error);
      return [];
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGroupMaterials(groupId: string): Promise<any[]> {
     // Not specifically implemented in backend to filter by group in getMaterials yet,
     // but we can fetch all and filter or add endpoint.
     // The backend `getMaterials` currently returns all user materials.
     // TODO: Implement group filter in backend or here
     return [];
  },

  async deleteMaterial(materialId: string): Promise<void> {
    try {
      await api.delete(`/materials/${materialId}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};
