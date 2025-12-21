import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import { API_BASE_URL } from '../constants/translations';

export interface UploadResult {
  success: boolean;
  objectPath?: string;
  error?: string;
}

async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      '需要相簿權限',
      'Mibu 需要存取您的相簿才能上傳照片。請在設定中開啟權限。',
      [{ text: '好' }]
    );
    return false;
  }
  
  return true;
}

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      '需要相機權限',
      'Mibu 需要使用相機才能拍攝照片。請在設定中開啟權限。',
      [{ text: '好' }]
    );
    return false;
  }
  
  return true;
}

export async function pickImageFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}

export async function takePhotoWithCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}

export async function uploadImage(asset: ImagePicker.ImagePickerAsset): Promise<UploadResult> {
  try {
    const fileName = asset.uri.split('/').pop() || 'photo.jpg';
    const fileSize = asset.fileSize || 0;
    const contentType = asset.mimeType || 'image/jpeg';

    const urlResponse = await fetch(`${API_BASE_URL}/api/uploads/request-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        size: fileSize,
        contentType,
      }),
    });

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || '無法取得上傳網址',
      };
    }

    const { uploadURL, objectPath } = await urlResponse.json();

    const imageResponse = await fetch(asset.uri);
    const blob = await imageResponse.blob();

    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: '上傳失敗，請稍後再試',
      };
    }

    return {
      success: true,
      objectPath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: '上傳時發生錯誤',
    };
  }
}

export function getImageUrl(objectPath: string): string {
  return `${API_BASE_URL}/objects/${objectPath}`;
}

export async function pickAndUploadImage(): Promise<UploadResult> {
  const asset = await pickImageFromLibrary();
  if (!asset) {
    return { success: false, error: '未選擇照片' };
  }
  return uploadImage(asset);
}

export async function captureAndUploadImage(): Promise<UploadResult> {
  const asset = await takePhotoWithCamera();
  if (!asset) {
    return { success: false, error: '未拍攝照片' };
  }
  return uploadImage(asset);
}
