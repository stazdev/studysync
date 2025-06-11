import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type StudyMaterial = Database['public']['Tables']['study_materials']['Row']
type StudyMaterialInsert = Database['public']['Tables']['study_materials']['Insert']

export const uploadService = {
  async uploadFile(
    file: File, 
    bucket: string, 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error uploading file:', error)
      return { data: null, error }
    }
  },

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { data, error } = await this.uploadFile(file, 'avatars', filePath)
      if (error) throw error

      const publicUrl = await this.getPublicUrl('avatars', filePath)

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw error
    }
  },

  async uploadStudyMaterial(
    file: File, 
    userId: string, 
    analysis: any,
    groupId?: string,
    isPublic: boolean = false
  ): Promise<StudyMaterial> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${userId}/${fileName}`

      const { data, error } = await this.uploadFile(file, 'study-materials', filePath)
      if (error) throw error

      const fileUrl = await this.getPublicUrl('study-materials', filePath)

      // Save material record
      const { data: material, error: materialError } = await supabase
        .from('study_materials')
        .insert({
          title: file.name,
          file_name: file.name,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          analysis,
          uploaded_by: userId,
          group_id: groupId,
          is_public: isPublic
        })
        .select()
        .single()

      if (materialError) throw materialError
      return material
    } catch (error) {
      console.error('Error uploading study material:', error)
      throw error
    }
  },

  async uploadChatFile(file: File, userId: string, groupId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${userId}/${groupId}/${fileName}`

      const { data, error } = await this.uploadFile(file, 'chat-files', filePath)
      if (error) throw error

      const fileUrl = await this.getPublicUrl('chat-files', filePath)
      return fileUrl
    } catch (error) {
      console.error('Error uploading chat file:', error)
      throw error
    }
  },

  async getUserMaterials(userId: string): Promise<StudyMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user materials:', error)
      return []
    }
  },

  async getGroupMaterials(groupId: string): Promise<StudyMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select(`
          *,
          profiles:uploaded_by (
            username,
            profile_image_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching group materials:', error)
      return []
    }
  },

  async deleteMaterial(materialId: string): Promise<void> {
    try {
      // Get material info first
      const { data: material, error: fetchError } = await supabase
        .from('study_materials')
        .select('file_url')
        .eq('id', materialId)
        .single()

      if (fetchError) throw fetchError

      // Extract file path from URL
      const url = new URL(material.file_url)
      const filePath = url.pathname.split('/').slice(-2).join('/')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('study-materials')
        .remove([filePath])

      if (storageError) console.warn('Error deleting file from storage:', storageError)

      // Delete from database
      const { error: dbError } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', materialId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting material:', error)
      throw error
    }
  }
}