<template>
  <div class="files-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Files</h1>
          <div class="subtitle-wrapper">
            <p class="page-subtitle">
              <span class="subtitle-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
              <span class="subtitle-text">Upload and manage your DPR files</span>
            </p>
          </div>
        </div>
        <button @click="showUploadModal = true" class="upload-files-btn">
          <div class="btn-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <span class="btn-text">Upload Files</span>
        </button>
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
          <button @click="showUploadModal = true" class="btn-primary-empty">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Files
          </button>
        </div>

        <!-- Files Grid -->
        <div v-else class="files-grid">
          <div 
            v-for="file in files" 
            :key="file.id" 
            class="file-card"
            @click="openFileEvaluationsModal(file)"
          >
            <div class="card-header">
              <div class="file-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="card-actions" @click.stop>
                <button 
                  v-if="file.status === 'ready'"
                  @click="reEvaluate(file)"
                  class="icon-btn re-evaluate-icon"
                  title="Re-evaluate this file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
                <button 
                  @click="deleteFile(file)"
                  class="icon-btn delete-icon"
                  title="Delete file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <h3 class="file-name">{{ file.display_name || file.filename }}</h3>
              <div class="file-meta">
                <span class="file-size">{{ file.size_mb }} MB</span>
                <span class="file-separator">•</span>
                <span class="file-date">{{ formatDate(file.uploaded_at) }}</span>
              </div>
              
              <div class="file-status-row">
                <span 
                  class="status-badge" 
                  :class="getStatusClass(file.status, file.vector_store_status)"
                >
                  {{ getStatusLabel(file.status, file.vector_store_status) }}
                </span>
                
                <span v-if="isProcessing(file)" class="progress-message">
                  {{ file.progress_message || 'Processing...' }}
                </span>
              </div>
              
              <div v-if="file.error_message" class="error-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ file.error_message }}</span>
              </div>
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

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button @click="closeModal" class="modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <div class="modal-header">
          <h2>Upload PDF File</h2>
          <p>Drop your file here or click to browse</p>
        </div>
        
        <div 
          class="upload-zone"
          :class="{ 'dragover': isDragover, 'uploading': isUploading }"
          @drop="handleDrop"
          @dragover.prevent="isDragover = true"
          @dragleave="isDragover = false"
          @dragenter.prevent
          @click="!isUploading && $refs.fileInput.click()"
        >
          <input 
            ref="fileInput"
            type="file" 
            accept=".pdf,application/pdf"
            @change="handleFileSelect"
            style="display: none"
          />
          
          <div v-if="!isUploading" class="upload-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <h3>Drop PDF file here or click to browse</h3>
            <p>Only PDF files are supported. Maximum file size: 50MB</p>
            <button class="upload-btn" @click.stop="$refs.fileInput.click()">Choose File</button>
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
    </div>

    <!-- File Evaluations Modal -->
    <div v-if="showEvaluationsModal" class="modal-overlay" @click.self="closeEvaluationsModal">
      <div class="evaluations-modal-content">
        <button @click="closeEvaluationsModal" class="modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <div class="evaluations-modal-header">
          <div class="file-info-header">
            <div class="file-icon-header">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div>
              <h2>{{ selectedFile && (selectedFile.display_name || selectedFile.filename) }}</h2>
              <p class="file-meta-header">{{ selectedFile && selectedFile.size_mb }} MB • {{ selectedFile && formatDate(selectedFile.uploaded_at) }}</p>
            </div>
          </div>
          <button 
            v-if="selectedFile && selectedFile.status === 'ready'"
            @click.stop="evaluateWithFile"
            class="evaluate-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Evaluate with this File
          </button>
        </div>

        <div class="evaluations-content">
          <!-- Loading State -->
          <div v-if="loadingEvaluations" class="evaluations-loading">
            <div class="progress-spinner"></div>
            <p>Loading evaluations...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!loadingEvaluations && fileEvaluations.length === 0" class="evaluations-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <h3>No evaluations yet</h3>
            <p>This file hasn't been evaluated yet. Create your first evaluation.</p>
          </div>

          <!-- Evaluations List -->
          <div v-else class="evaluations-list">
            <div 
              v-for="evaluation in fileEvaluations" 
              :key="evaluation.id"
              class="evaluation-item"
              @click="navigateToEvaluation(evaluation.id)"
            >
              <div class="evaluation-item-content">
                <div class="evaluation-main">
                  <div class="evaluation-info">
                    <h4>{{ evaluation.scheme }}</h4>
                    <p class="evaluation-doc-type">{{ evaluation.document_type }}</p>
                    <p class="evaluation-date">{{ formatDate(evaluation.date) }}</p>
                  </div>
                  <div class="evaluation-status">
                    <span class="status-badge" :class="getEvaluationStatusClass(evaluation.status)">
                      {{ getEvaluationStatusLabel(evaluation.status) }}
                    </span>
                  </div>
                </div>
                <div v-if="evaluation.summary" class="evaluation-stats">
                  <div class="stat-mini">
                    <span class="stat-value compliant">{{ evaluation.summary.compliant || 0 }}</span>
                    <span class="stat-label">Compliant</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-value partial">{{ evaluation.summary.partial || 0 }}</span>
                    <span class="stat-label">Partial</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-value non-compliant">{{ evaluation.summary.non_compliant || 0 }}</span>
                    <span class="stat-label">Non-Compliant</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-value total">{{ evaluation.summary.total || 0 }}</span>
                    <span class="stat-label">Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      showUploadModal: false,
      showEvaluationsModal: false,
      selectedFile: null,
      fileEvaluations: [],
      loadingEvaluations: false,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 20
      },
      pollingIntervals: {} // Track polling intervals for cleanup
    }
  },
  
  async mounted() {
    // Check authentication
    const token = localStorage.getItem('jwt_access');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    
    // Load files on mount
    await this.loadFiles();
    
    // Check if we should open evaluations modal (from back navigation)
    const fileId = this.$route.query.fileId;
    if (fileId) {
      // Find the file and open modal
      const file = this.files.find(f => f.id === parseInt(fileId));
      if (file) {
        // Use nextTick to ensure DOM is ready
        this.$nextTick(() => {
          this.openFileEvaluationsModal(file);
        });
      }
    }
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
    
    // Close modal
    closeModal() {
      if (!this.isUploading) {
        this.showUploadModal = false;
        this.uploadError = null;
        this.isDragover = false;
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
        
        // Close modal after successful upload
        this.showUploadModal = false;
        this.isDragover = false;
        
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
      this.$router.push({ 
        name: 'NewEvaluation', 
        query: { fileId: file.id } 
      });
    },
    
    // Open file evaluations modal
    async openFileEvaluationsModal(file) {
      this.selectedFile = file;
      this.showEvaluationsModal = true;
      this.fileEvaluations = [];
      await this.loadFileEvaluations(file.id);
    },
    
    // Close evaluations modal
    closeEvaluationsModal() {
      this.showEvaluationsModal = false;
      this.selectedFile = null;
      this.fileEvaluations = [];
    },
    
    // Load evaluations for a specific file
    async loadFileEvaluations(fileId) {
      this.loadingEvaluations = true;
      
      try {
        const response = await this.$http.secured.get('/api/evaluations', {
          params: {
            uploaded_file_id: fileId,
            page: 1,
            per_page: 100 // Get all evaluations for this file
          }
        });
        
        const data = response.data.data || response.data;
        this.fileEvaluations = data.evaluations || [];
        
      } catch (error) {
        console.error('Failed to load file evaluations:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        } else {
          this.$toast.error('Failed to load evaluations. Please try again.');
        }
      } finally {
        this.loadingEvaluations = false;
      }
    },
    
    // Navigate to evaluation details
    navigateToEvaluation(evaluationId) {
      this.closeEvaluationsModal();
      this.$router.push({ 
        name: 'EvaluationResults', 
        params: { id: evaluationId } 
      });
    },
    
    // Evaluate with selected file
    evaluateWithFile() {
      if (this.selectedFile && this.selectedFile.status === 'ready') {
        const fileId = this.selectedFile.id;
        this.closeEvaluationsModal();
        // Use nextTick to ensure modal closes before navigation
        this.$nextTick(() => {
          this.$router.push({ 
            name: 'NewEvaluation', 
            query: { 
              fileId: fileId,
              from: 'files'
            } 
          });
        });
      }
    },
    
    // Get evaluation status class
    getEvaluationStatusClass(status) {
      const statusMap = {
        'completed': 'status-completed',
        'processing': 'status-processing',
        'failed': 'status-failed',
        'pending': 'status-pending'
      };
      return statusMap[status] || 'status-pending';
    },
    
    // Get evaluation status label
    getEvaluationStatusLabel(status) {
      const labelMap = {
        'completed': 'Completed',
        'processing': 'Processing',
        'failed': 'Failed',
        'pending': 'Pending'
      };
      return labelMap[status] || 'Pending';
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
    
    // Format date in IST
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    }
  }
}
</script>

<style scoped>
.files-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  gap: 24px;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #F97B22, #FF8C42, #FFB366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  margin: 0 0 8px 0;
  line-height: 1.1;
}

.subtitle-wrapper {
  margin-top: 4px;
}

.page-subtitle {
  font-size: 19px;
  color: #4b5563;
  margin: 0;
  font-weight: 500;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
}

.subtitle-icon {
  display: flex;
  align-items: center;
  color: #3B82F6;
  flex-shrink: 0;
  opacity: 0.8;
}

.subtitle-text {
  color: #565869;
}

.upload-files-btn {
  background: linear-gradient(135deg, #2563EB, #3B82F6, #60A5FA);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.upload-files-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.upload-files-btn:hover::before {
  left: 100%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-text {
  font-weight: 700;
  letter-spacing: 0.3px;
}

.upload-files-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  background: linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD);
}

.upload-files-btn:hover .btn-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.upload-files-btn:active {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  padding: 20px;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #565869;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #2d333a;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.modal-header p {
  font-size: 14px;
  color: #565869;
  margin: 0;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.05);
}

.upload-zone.dragover {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.upload-zone.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-content svg {
  color: #3B82F6;
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
  margin: 0 0 24px 0;
}

.upload-btn {
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
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
  border-top-color: #3B82F6;
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
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d333a;
  margin: 0;
}

.refresh-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #565869;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #F97B22;
  color: #F97B22;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: #565869;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
  color: #565869;
}

.btn-primary-empty {
  background: linear-gradient(135deg, #F97B22, #FF8C42);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 123, 34, 0.3);
}

.btn-primary-empty:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(249, 123, 34, 0.4);
  background: linear-gradient(135deg, #FF8C42, #FFB366);
}

/* Files Grid */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.file-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.file-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #F97B22, #FF8C42, #FFB366);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.file-card:hover {
  border-color: #F97B22;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.file-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.file-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(249, 123, 34, 0.1), rgba(255, 140, 66, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97B22;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  color: #565869;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
}

.icon-btn:hover {
  background: #f9fafb;
  transform: scale(1.1);
}

.re-evaluate-icon:hover {
  border-color: #10B981;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.delete-icon:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #565869;
}

.file-separator {
  color: #d1d5db;
}

.file-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
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
  font-size: 13px;
  color: #565869;
  font-style: italic;
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #dc2626;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
  margin-top: 4px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #565869;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #F97B22;
  color: #F97B22;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #565869;
}

/* Responsive */
@media (max-width: 1024px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .files-page {
    padding: 24px 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-title {
    font-size: 36px;
  }
  
  .upload-files-btn {
    width: 100%;
    justify-content: center;
  }
  
  .files-section {
    padding: 24px;
  }
  
  .files-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    padding: 24px;
    margin: 20px;
  }
  
  .upload-zone {
    padding: 32px 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .files-section {
    padding: 20px;
  }
  
  .file-card {
    padding: 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-btn {
    width: 100%;
  }
}

/* File Evaluations Modal */
.evaluations-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 0;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

.evaluations-modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.file-info-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.file-icon-header {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(249, 123, 34, 0.1), rgba(255, 140, 66, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97B22;
  flex-shrink: 0;
}

.evaluations-modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 4px 0;
  word-break: break-word;
}

.file-meta-header {
  font-size: 14px;
  color: #565869;
  margin: 0;
}

.evaluate-btn {
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  white-space: nowrap;
}

.evaluate-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
}

.evaluations-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.evaluations-loading,
.evaluations-empty {
  text-align: center;
  padding: 64px 24px;
  color: #565869;
}

.evaluations-empty svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.evaluations-empty h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.evaluations-empty p {
  font-size: 14px;
  margin: 0;
  color: #565869;
}

.evaluations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evaluation-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.evaluation-item:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.evaluation-item-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evaluation-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.evaluation-info {
  flex: 1;
}

.evaluation-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 4px 0;
}

.evaluation-doc-type {
  font-size: 14px;
  color: #565869;
  margin: 0 0 4px 0;
}

.evaluation-date {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.evaluation-status {
  flex-shrink: 0;
}

.evaluation-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-mini .stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-mini .stat-label {
  font-size: 11px;
  color: #565869;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-failed {
  background: #fef2f2;
  color: #dc2626;
}

.status-pending {
  background: #f3f4f6;
  color: #4b5563;
}

@media (max-width: 768px) {
  .evaluations-modal-content {
    max-height: 95vh;
    margin: 10px;
  }
  
  .evaluations-modal-header {
    padding: 20px;
    flex-direction: column;
  }
  
  .evaluate-btn {
    width: 100%;
    justify-content: center;
  }
  
  .evaluations-content {
    padding: 20px;
  }
  
  .evaluation-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

