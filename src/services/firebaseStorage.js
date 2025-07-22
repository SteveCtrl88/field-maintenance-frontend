// Firebase Storage Service
// Handles image uploads and storage operations

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set, get, update } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIbB5Q308o7aEkEZJVavnrWQ51JQpOvc0",
  authDomain: "field-maintenance.firebaseapp.com",
  databaseURL: "https://field-maintenance-default-rtdb.firebaseio.com",
  projectId: "field-maintenance",
  storageBucket: "field-maintenance.firebasestorage.app",
  messagingSenderId: "31273972276",
  appId: "1:31273972276:web:7400ea06e61980df52d061"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

class FirebaseStorageService {
  constructor() {
    this.storage = storage;
    this.database = database;
  }

  // Upload image to Firebase Storage
  async uploadImage(file, inspectionId, questionId) {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${inspectionId}_${questionId}_${timestamp}.jpg`;
      const imagePath = `inspections/${inspectionId}/images/${filename}`;
      
      // Create storage reference
      const imageRef = ref(this.storage, imagePath);
      
      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        data: {
          filename,
          path: imagePath,
          url: downloadURL,
          size: snapshot.metadata.size,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(this.storage, imagePath);
      await deleteObject(imageRef);
      
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save inspection data to Firebase Realtime Database
  async saveInspectionData(inspectionId, data) {
    try {
      const inspectionRef = dbRef(this.database, `inspections/${inspectionId}`);
      await set(inspectionRef, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Inspection data saved successfully'
      };
    } catch (error) {
      console.error('Error saving inspection data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update inspection data in Firebase Realtime Database
  async updateInspectionData(inspectionId, updates) {
    try {
      const inspectionRef = dbRef(this.database, `inspections/${inspectionId}`);
      await update(inspectionRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Inspection data updated successfully'
      };
    } catch (error) {
      console.error('Error updating inspection data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get inspection data from Firebase Realtime Database
  async getInspectionData(inspectionId) {
    try {
      const inspectionRef = dbRef(this.database, `inspections/${inspectionId}`);
      const snapshot = await get(inspectionRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        };
      } else {
        return {
          success: false,
          error: 'Inspection not found'
        };
      }
    } catch (error) {
      console.error('Error getting inspection data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save image metadata to database
  async saveImageMetadata(inspectionId, questionId, imageData, note = '') {
    try {
      const imageMetadata = {
        filename: imageData.filename,
        url: imageData.url,
        path: imageData.path,
        size: imageData.size,
        questionId: questionId,
        note: note,
        timestamp: imageData.timestamp,
        created_at: new Date().toISOString()
      };

      // Save to images collection
      const imagesRef = dbRef(this.database, `inspections/${inspectionId}/images`);
      const newImageRef = push(imagesRef);
      await set(newImageRef, imageMetadata);

      return {
        success: true,
        data: {
          id: newImageRef.key,
          ...imageMetadata
        }
      };
    } catch (error) {
      console.error('Error saving image metadata:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save notes to database
  async saveNote(inspectionId, questionId, note) {
    try {
      const noteData = {
        questionId: questionId,
        note: note,
        timestamp: new Date().toISOString()
      };

      const notesRef = dbRef(this.database, `inspections/${inspectionId}/notes/${questionId}`);
      await set(notesRef, noteData);

      return {
        success: true,
        data: noteData
      };
    } catch (error) {
      console.error('Error saving note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get notes for a question
  async getNote(inspectionId, questionId) {
    try {
      const noteRef = dbRef(this.database, `inspections/${inspectionId}/notes/${questionId}`);
      const snapshot = await get(noteRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        };
      } else {
        return {
          success: true,
          data: null
        };
      }
    } catch (error) {
      console.error('Error getting note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert file to blob for upload
  async fileToBlob(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], { type: file.type });
        resolve(blob);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Capture image from camera and upload
  async captureAndUploadImage(inspectionId, questionId, note = '') {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available on this device');
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());

      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      // Upload image
      const uploadResult = await this.uploadImage(blob, inspectionId, questionId);
      
      if (uploadResult.success) {
        // Save image metadata
        const metadataResult = await this.saveImageMetadata(
          inspectionId, 
          questionId, 
          uploadResult.data, 
          note
        );
        
        if (metadataResult.success) {
          return {
            success: true,
            data: {
              image: uploadResult.data,
              metadata: metadataResult.data
            }
          };
        } else {
          return metadataResult;
        }
      } else {
        return uploadResult;
      }
    } catch (error) {
      console.error('Error capturing and uploading image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
let firebaseStorageService;
try {
  firebaseStorageService = new FirebaseStorageService();
} catch (error) {
  console.error('Error initializing Firebase Storage Service:', error);
  firebaseStorageService = null;
}
export default firebaseStorageService;

