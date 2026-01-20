<template>
  <div class="files-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Files</h1>
      <p class="page-subtitle">Upload and manage your DPR files</p>
    </div>

    <!-- File Upload Section -->
    <div class="upload-section">
      <div 
        class="upload-zone"
        :class="{ 'dragover': isDragover, 'uploading': isUploading }"
        @drop="handleDrop"
        @dragover.prevent="isDragover = true"
        @dragleave="isDragover = false"
        @dragenter.prevent
      >
        <input 
          ref="fileInput"
          type="file" 
          accept=".pdf,application/pdf"
          @change="handleFileSelect"
          style="display: none"
        />
        
        <div v-if="!isUploading" class="upload-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <h3>Drop PDF file here or click to browse</h3>
          <p>Only PDF files are supported. Maximum file size: 50MB</p>
          <button class="upload-btn" @click="$refs.fileInput.click()">Choose File</button>
        </div>
        
        <div v-else class="upload-progress">
          <div class="progress-spinner"></div>
          <p>{{ uploadProgressMessage }}</p>
        </div>
      </div>
      
      <div v-if="uploadError" class="error-message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ uploadError }}</span>
      </div>
    </div>

    <!-- Files List Section -->
    <div class="files-section">
      <div class="section-header">
        <h2>Your Files</h2>
        <button 
          v-if="files.length > 0" 
          @click="refreshFiles" 
          class="refresh-btn"
          :disabled="loading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && files.length === 0" class="loading-state">
        <div class="progress-spinner"></div>
        <p>Loading files...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && files.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <h3>No files uploaded yet</h3>
        <p>Upload your first PDF file to get started</p>
      </div>

      <!-- Files List -->
      <div v-else class="files-list">
        <div 
          v-for="file in files" 
          :key="file.id" 
          class="file-card"
        >
          <div class="file-info">
            <div class="file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            
            <div class="file-details">
              <h3 class="file-name">{{ file.display_name || file.filename }}</h3>
              <div class="file-meta">
                <span class="file-size">{{ file.size_mb }} MB</span>
                <span class="file-separator">•</span>
                <span class="file-date">{{ formatDate(file.uploaded_at) }}</span>
              </div>
              
              <!-- Status and Progress -->
              <div class="file-status">
                <span 
                  class="status-badge" 
                  :class="getStatusClass(file.status, file.vector_store_status)"
                >
                  {{ getStatusLabel(file.status, file.vector_store_status) }}
                </span>
                
                <span v-if="isProcessing(file)" class="progress-message">
                  {{ file.progress_message || 'Processing...' }}
                </span>
                
                <div v-if="file.error_message" class="error-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {{ file.error_message }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="file-actions">
            <button 
              v-if="file.status === 'ready'"
              @click="reEvaluate(file)"
              class="action-btn re-evaluate-btn"
              title="Re-evaluate this file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Re-evaluate
            </button>
            
            <button 
              @click="deleteFile(file)"
              class="action-btn delete-btn"
              title="Delete file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="pagination">
        <button 
          @click="loadFiles(Math.max(1, pagination.current_page - 1))"
          :disabled="pagination.current_page === 1 || loading"
          class="page-btn"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.current_page }} of {{ pagination.total_pages }}
        </span>
        <button 
          @click="loadFiles(Math.min(pagination.total_pages, pagination.current_page + 1))"
          :disabled="pagination.current_page >= pagination.total_pages || loading"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilesPage',
  data() {
    return {
      files: [],
      loading: false,
      isUploading: false,
      isDragover: false,
      uploadError: null,
      uploadProgressMessage: 'Uploading file...',
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 20
      },
      pollingIntervals: {} // Track polling intervals for cleanup
    }
  },
  
  mounted() {
    // Check authentication
    const token = localStorage.getItem('jwt_access');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    
    // Load files on mount
    this.loadFiles();
  },
  
  beforeDestroy() {
    // Clean up all polling intervals
    this.stopAllPolling();
  },
  
  methods: {
    // Load files from API
    async loadFiles(page = 1) {
      // Validate page parameter
      page = Math.max(1, parseInt(page) || 1);
      
      this.loading = true;
      this.uploadError = null;
      
      try {
        const response = await this.$http.secured.get('/api/files', {
          params: {
            page: page,
            per_page: this.pagination.per_page
          }
        });
        
        const data = response.data.data || response.data;
        this.files = data.files || [];
        this.pagination = data.pagination || this.pagination;
        
        // Ensure pagination values are valid
        if (this.pagination.current_page < 1) {
          this.pagination.current_page = 1;
        }
        if (this.pagination.total_pages < 1) {
          this.pagination.total_pages = 1;
        }
        
        // Start polling for processing files
        this.startPollingForProcessingFiles();
        
      } catch (error) {
        console.error('Failed to load files:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        } else {
          this.$toast.error('Failed to load files. Please try again.');
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Refresh files - reload current page
    refreshFiles() {
      const currentPage = this.pagination.current_page || 1;
      this.loadFiles(currentPage);
    },
    
    // Handle file selection
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
      // Reset input
      event.target.value = '';
    },
    
    // Handle drag and drop
    handleDrop(event) {
      event.preventDefault();
      this.isDragover = false;
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.uploadFile(files[0]);
      }
    },
    
    // Upload file
    async uploadFile(file) {
      // Validate file type
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.uploadError = 'Please upload a PDF file only.';
        this.$toast.error('Only PDF files are supported.');
        return;
      }
      
      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        this.uploadError = 'File size exceeds 50MB limit.';
        this.$toast.error('File size must be less than 50MB.');
        return;
      }
      
      this.isUploading = true;
      this.uploadError = null;
      this.uploadProgressMessage = 'Uploading file...';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Create a custom config for file upload
        // Axios will automatically detect FormData and set Content-Type with boundary
        // We need to ensure the default Content-Type header doesn't interfere
        const config = {
          timeout: 600000, // 10 minutes for file upload
          transformRequest: [
            function (data, headers) {
              // Remove Content-Type header for FormData - axios will set it with boundary
              if (data instanceof FormData) {
                delete headers['Content-Type'];
              }
              return data;
            }
          ]
        };
        
        const response = await this.$http.secured.post('/api/files', formData, config);
        
        const uploadedFile = response.data.data || response.data;
        this.$toast.success('File uploaded successfully!');
        
        // Reload files list - use current page or default to 1
        const currentPage = this.pagination.current_page || 1;
        await this.loadFiles(currentPage);
        
        // Start polling for this file if it's processing
        if (this.isProcessing(uploadedFile)) {
          this.startPolling(uploadedFile.id);
        }
        
      } catch (error) {
        console.error('Upload failed:', error);
        let errorMessage = 'Failed to upload file. Please try again.';
        
        if (error.response) {
          const errorData = error.response.data;
          if (errorData.error) {
            // Handle duplicate file error specifically
            if (errorData.error.code === 'duplicate_file' || error.response.status === 409) {
              errorMessage = errorData.error.message || 'This file has already been uploaded.';
              // Show a more informative message for duplicate files
              this.$toast.warning(errorMessage, {
                duration: 6000 // Show for 6 seconds
              });
            } else {
              errorMessage = errorData.error.message || errorData.error.details || errorMessage;
              this.$toast.error(errorMessage);
            }
          } else {
            this.$toast.error(errorMessage);
          }
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timeout. Please try again with a smaller file.';
          this.$toast.error(errorMessage);
        } else {
          this.$toast.error(errorMessage);
        }
        
        this.uploadError = errorMessage;
      } finally {
        this.isUploading = false;
        this.uploadProgressMessage = 'Uploading file...';
      }
    },
    
    // Delete file
    async deleteFile(file) {
      if (!confirm(`Are you sure you want to delete "${file.display_name || file.filename}"?`)) {
        return;
      }
      
      try {
        await this.$http.secured.delete(`/api/files/${file.id}`);
        this.$toast.success('File deleted successfully');
        
        // Stop polling for this file
        this.stopPolling(file.id);
        
        // Reload files list - use current page or default to 1
        const currentPage = this.pagination.current_page || 1;
        await this.loadFiles(currentPage);
        
      } catch (error) {
        console.error('Delete failed:', error);
        this.$toast.error('Failed to delete file. Please try again.');
      }
    },
    
    // Re-evaluate file (navigate to evaluation page)
    reEvaluate(file) {
      // TODO: Navigate to evaluation page with file pre-selected
      // For now, just show a message
      this.$toast.info('Re-evaluate functionality will be available on the evaluation page');
      // This will be implemented when NewEvaluationPage is created
      // this.$router.push({ name: 'NewEvaluation', params: { fileId: file.id } });
    },
    
    // Poll status for a specific file
    async pollFileStatus(fileId) {
      try {
        const response = await this.$http.secured.get(`/api/files/${fileId}/status`);
        const statusData = response.data.data || response.data;
        
        // Update file in list
        const fileIndex = this.files.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
          this.files[fileIndex].status = statusData.status;
          this.files[fileIndex].vector_store_status = statusData.vector_store_status;
          this.files[fileIndex].progress_stage = statusData.progress_stage;
          this.files[fileIndex].progress_message = statusData.progress_message;
          this.files[fileIndex].error_message = statusData.error_message;
          
          // Stop polling if file is ready or error
          if (statusData.status === 'ready' || statusData.status === 'error') {
            this.stopPolling(fileId);
          }
        }
      } catch (error) {
        console.error(`Failed to poll status for file ${fileId}:`, error);
        // Stop polling on error
        this.stopPolling(fileId);
      }
    },
    
    // Start polling for a file
    startPolling(fileId) {
      // Stop existing polling if any
      this.stopPolling(fileId);
      
      // Poll every 3 seconds
      this.pollingIntervals[fileId] = setInterval(() => {
        this.pollFileStatus(fileId);
      }, 3000);
    },
    
    // Stop polling for a file
    stopPolling(fileId) {
      if (this.pollingIntervals[fileId]) {
        clearInterval(this.pollingIntervals[fileId]);
        delete this.pollingIntervals[fileId];
      }
    },
    
    // Stop all polling
    stopAllPolling() {
      Object.keys(this.pollingIntervals).forEach(fileId => {
        this.stopPolling(fileId);
      });
    },
    
    // Start polling for all processing files
    startPollingForProcessingFiles() {
      this.files.forEach(file => {
        if (this.isProcessing(file)) {
          this.startPolling(file.id);
        } else {
          // Stop polling if file is no longer processing
          this.stopPolling(file.id);
        }
      });
    },
    
    // Check if file is processing
    isProcessing(file) {
      return file.status === 'processing' || 
             file.status === 'uploaded' ||
             (file.vector_store_status === 'pending' || file.vector_store_status === 'processing');
    },
    
    // Get status class for styling
    getStatusClass(status, vectorStoreStatus) {
      if (status === 'ready' && vectorStoreStatus === 'completed') {
        return 'status-ready';
      } else if (status === 'error' || vectorStoreStatus === 'failed') {
        return 'status-error';
      } else if (this.isProcessing({ status, vector_store_status: vectorStoreStatus })) {
        return 'status-processing';
      }
      return 'status-uploaded';
    },
    
    // Get status label
    getStatusLabel(status, vectorStoreStatus) {
      if (status === 'ready' && vectorStoreStatus === 'completed') {
        return 'Ready';
      } else if (status === 'error' || vectorStoreStatus === 'failed') {
        return 'Error';
      } else if (status === 'processing' || vectorStoreStatus === 'processing' || vectorStoreStatus === 'pending') {
        return 'Processing';
      }
      return 'Uploaded';
    },
    
    // Format date
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.files-page {
  min-height: 100vh;
  background: #f7f7f8;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #565869;
  margin: 0;
}

/* Upload Section */
.upload-section {
  margin-bottom: 40px;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #10a37f;
  background: #f9fafb;
}

.upload-zone.dragover {
  border-color: #10a37f;
  background: #f0fdf4;
}

.upload-zone.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-content svg {
  color: #10a37f;
  margin-bottom: 16px;
}

.upload-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.upload-content p {
  font-size: 14px;
  color: #565869;
  margin: 0 0 16px 0;
}

.upload-btn {
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #0d8f68;
  transform: translateY(-1px);
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* Files Section */
.files-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
}

.refresh-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #565869;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #10a37f;
  color: #10a37f;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #565869;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #565869;
  margin-bottom: 8px;
}

.file-separator {
  color: #d1d5db;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-ready {
  background: #dcfce7;
  color: #166534;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-error {
  background: #fef2f2;
  color: #dc2626;
}

.status-uploaded {
  background: #f3f4f6;
  color: #4b5563;
}

.progress-message {
  font-size: 14px;
  color: #565869;
  font-style: italic;
}

.error-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #dc2626;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #565869;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.re-evaluate-btn:hover {
  border-color: #10a37f;
  color: #10a37f;
}

.delete-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: #565869;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #10a37f;
  color: #10a37f;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #565869;
}

/* Dark Theme */
.dark-theme .files-page {
  background: #2d2d30;
}

.dark-theme .page-header h1 {
  color: white;
}

.dark-theme .page-subtitle {
  color: #d1d5db;
}

.dark-theme .upload-zone {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .upload-zone:hover {
  background: #3a3a3f;
  border-color: #10a37f;
}

.dark-theme .upload-zone.dragover {
  background: #1f2937;
}

.dark-theme .upload-content h3 {
  color: white;
}

.dark-theme .upload-content p {
  color: #d1d5db;
}

.dark-theme .files-section {
  background: #343541;
}

.dark-theme .section-header h2 {
  color: white;
}

.dark-theme .refresh-btn {
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .refresh-btn:hover:not(:disabled) {
  background: #3a3a3f;
  border-color: #10a37f;
  color: #10a37f;
}

.dark-theme .empty-state h3 {
  color: white;
}

.dark-theme .empty-state p {
  color: #d1d5db;
}

.dark-theme .file-card {
  background: #2d2d30;
  border-color: #4d4d4f;
}

.dark-theme .file-card:hover {
  border-color: #565869;
}

.dark-theme .file-name {
  color: white;
}

.dark-theme .file-meta {
  color: #d1d5db;
}

.dark-theme .action-btn {
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .action-btn:hover {
  background: #3a3a3f;
  border-color: #565869;
}

.dark-theme .pagination {
  border-top-color: #4d4d4f;
}

.dark-theme .page-btn {
  background: #343541;
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .page-btn:hover:not(:disabled) {
  background: #3a3a3f;
  border-color: #10a37f;
  color: #10a37f;
}

.dark-theme .page-info {
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .files-page {
    padding: 20px;
  }
  
  .file-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

