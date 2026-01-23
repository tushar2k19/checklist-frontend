<template>
  <div class="evaluation-page">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="handleBack" title="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <div class="header-content">
        <h1>New Evaluation</h1>
        <p class="page-subtitle">Select scheme, document type, and file to start evaluation</p>
      </div>
    </div>

    <!-- Form Section -->
    <div class="form-section">
      <!-- Scheme Selection -->
      <div class="form-group">
        <label for="scheme-select">Scheme <span class="required">*</span></label>
        <select
          id="scheme-select"
          v-model="selectedSchemeId"
          @change="onSchemeChange"
          :disabled="loading.schemes || loading.evaluation"
          class="form-select"
          :class="{ 'error': errors.scheme }"
        >
          <option value="">Select scheme</option>
          <option v-for="scheme in schemes" :key="scheme.id" :value="scheme.id">
            {{ scheme.name }}
          </option>
        </select>
        <div v-if="loading.schemes" class="loading-indicator">
          <div class="progress-spinner small"></div>
          <span>Loading schemes...</span>
        </div>
        <div v-if="errors.scheme" class="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errors.scheme }}</span>
        </div>
      </div>

      <!-- Document Type Selection -->
      <div class="form-group">
        <label for="doc-type-select">Document Type <span class="required">*</span></label>
        <select
          id="doc-type-select"
          v-model="selectedDocumentTypeId"
          @change="onDocumentTypeChange"
          :disabled="loading.documentTypes || loading.evaluation"
          class="form-select"
          :class="{ 'error': errors.documentType }"
        >
          <option value="">Select document type</option>
          <option v-for="docType in documentTypes" :key="docType.id" :value="docType.id">
            {{ docType.name }}
          </option>
        </select>
        <div v-if="loading.documentTypes" class="loading-indicator">
          <div class="progress-spinner small"></div>
          <span>Loading document types...</span>
        </div>
        <div v-if="errors.documentType" class="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errors.documentType }}</span>
        </div>
        <p class="form-hint">Document type determines validation rules</p>
      </div>

      <!-- Checklist Section -->
      <div v-if="selectedSchemeId && selectedDocumentTypeId" class="form-group">
        <label>Checklist Items <span class="required">*</span></label>
        <div v-if="loading.checklist" class="loading-state">
          <div class="progress-spinner"></div>
          <p>Loading checklist items...</p>
        </div>
        <div v-else-if="errors.checklist" class="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errors.checklist }}</span>
        </div>
        <div v-else-if="checklistItems.length > 0" class="checklist-container">
          <div class="checklist-header">
            <span>Total: {{ checklistItems.length }}</span>
            <span>Mandatory: {{ mandatoryCount }}</span>
            <span>Optional: {{ optionalCount }}</span>
          </div>
          <div class="checklist-items">
            <label
              v-for="item in checklistItems"
              :key="item.id"
              class="checklist-item"
            >
              <input
                type="checkbox"
                :value="item.id"
                v-model="selectedChecklistItemIds"
                :disabled="loading.evaluation"
              />
              <span class="checklist-text">{{ item.item_text }}</span>
            </label>
          </div>
          <div v-if="errors.checklistItems" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errors.checklistItems }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No checklist items available for this combination</p>
        </div>
      </div>

      <!-- File Selection -->
      <div class="form-group">
        <label>File Selection <span class="required">*</span></label>
        <div class="file-selection-tabs">
          <button
            :class="['tab-btn', { active: fileSelectionMode === 'existing' }]"
            @click="fileSelectionMode = 'existing'"
            :disabled="loading.evaluation"
          >
            Use Existing File
          </button>
          <button
            :class="['tab-btn', { active: fileSelectionMode === 'upload' }]"
            @click="fileSelectionMode = 'upload'"
            :disabled="loading.evaluation"
          >
            Upload New File
          </button>
        </div>

        <!-- Existing File Selection -->
        <div v-if="fileSelectionMode === 'existing'" class="file-selection-content">
          <select
            v-model="selectedFileId"
            :disabled="loading.files || loading.evaluation"
            class="form-select"
            :class="{ 'error': errors.file }"
          >
            <option value="">Select a file</option>
            <option
              v-for="file in readyFiles"
              :key="file.id"
              :value="file.id"
            >
              {{ file.display_name || file.filename }} ({{ file.size_mb }} MB)
            </option>
          </select>
          <div v-if="loading.files" class="loading-indicator">
            <div class="progress-spinner small"></div>
            <span>Loading files...</span>
          </div>
          <div v-if="errors.file" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errors.file }}</span>
          </div>
        </div>

        <!-- New File Upload -->
        <div v-else class="file-selection-content">
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
          <div v-if="newFile" class="selected-file">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span>{{ newFile.name }}</span>
            <button @click="newFile = null" class="remove-file-btn">×</button>
          </div>
        </div>
      </div>

      <!-- Evaluation Progress -->
      <div v-if="evaluationProgress" class="evaluation-progress">
        <div class="progress-spinner"></div>
        <p>{{ evaluationProgress }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errors.evaluation" class="error-message large">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errors.evaluation }}</span>
      </div>
      
      <!-- Evaluation Logs -->
      <div v-if="evaluationLogs" class="logs-section">
        <div class="logs-header">
          <h3>Evaluation Logs</h3>
          <button @click="showLogs = !showLogs" class="toggle-logs-btn">
            {{ showLogs ? 'Hide' : 'Show' }} Logs
          </button>
        </div>
        <div v-if="showLogs" class="logs-content">
          <pre class="logs-text">{{ evaluationLogs }}</pre>
          <button @click="copyLogs" class="copy-logs-btn">Copy Logs</button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button
          @click="resetForm"
          class="btn btn-secondary"
          :disabled="loading.evaluation"
        >
          Reset
        </button>
        <button
          @click="startEvaluation"
          class="btn btn-primary"
          :disabled="!isFormValid || loading.evaluation"
        >
          <span v-if="loading.evaluation">
            <div class="progress-spinner small inline"></div>
            Starting Evaluation...
          </span>
          <span v-else>Start Evaluation</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewEvaluationPage',
  data() {
    return {
      schemes: [],
      documentTypes: [],
      selectedSchemeId: null,
      selectedDocumentTypeId: null,
      checklistItems: [],
      selectedChecklistItemIds: [],
      files: [],
      selectedFileId: null,
      newFile: null,
      fileSelectionMode: 'existing', // 'existing' or 'upload'
      isDragover: false,
      isUploading: false,
      uploadError: null,
      uploadProgressMessage: 'Uploading file...',
      loading: {
        schemes: false,
        documentTypes: false,
        checklist: false,
        files: false,
        evaluation: false
      },
      errors: {
        scheme: null,
        documentType: null,
        checklist: null,
        checklistItems: null,
        file: null,
        evaluation: null
      },
      evaluationProgress: null,
      showLogs: false,
      evaluationLogs: ''
    }
  },
  
  computed: {
    mandatoryCount() {
      // Assuming mandatory items are marked somehow - adjust based on API response
      return this.checklistItems.length;
    },
    optionalCount() {
      return 0; // Adjust based on API response if available
    },
    readyFiles() {
      return this.files.filter(file => file.status === 'ready' && file.vector_store_status === 'completed');
    },
    isFormValid() {
      return this.selectedSchemeId &&
             this.selectedDocumentTypeId &&
             this.selectedChecklistItemIds.length > 0 &&
             (this.selectedFileId || this.newFile) &&
             !this.loading.evaluation;
    }
  },
  
  methods: {
    // Load Schemes
    async loadSchemes() {
      this.loading.schemes = true;
      this.errors.scheme = null;
      
      try {
        const response = await this.$http.secured.get('/api/schemes');
        const data = response.data.data || response.data;
        this.schemes = data.schemes || [];
      } catch (error) {
        console.error('Failed to load schemes:', error);
        this.errors.scheme = 'Failed to load schemes. Please try again.';
        this.$toast.error('Failed to load schemes');
      } finally {
        this.loading.schemes = false;
      }
    },
    
    // Load Document Types
    async loadDocumentTypes() {
      this.loading.documentTypes = true;
      this.errors.documentType = null;
      
      try {
        const response = await this.$http.secured.get('/api/document_types');
        const data = response.data.data || response.data;
        this.documentTypes = data.document_types || [];
      } catch (error) {
        console.error('Failed to load document types:', error);
        this.errors.documentType = 'Failed to load document types. Please try again.';
        this.$toast.error('Failed to load document types');
      } finally {
        this.loading.documentTypes = false;
      }
    },
    
    // Load Checklist Template
    async loadChecklistTemplate() {
      if (!this.selectedSchemeId || !this.selectedDocumentTypeId) {
        return;
      }
      
      this.loading.checklist = true;
      this.errors.checklist = null;
      this.checklistItems = [];
      this.selectedChecklistItemIds = [];
      
      try {
        const response = await this.$http.secured.get('/api/checklist_templates', {
          params: {
            scheme_id: this.selectedSchemeId,
            document_type_id: this.selectedDocumentTypeId
          }
        });
        
        const data = response.data.data || response.data;
        this.checklistItems = (data.checklist_items || []).sort((a, b) => 
          (a.display_order || 0) - (b.display_order || 0)
        );
        
        // Auto-select all items by default
        this.selectedChecklistItemIds = this.checklistItems.map(item => item.id);
      } catch (error) {
        console.error('Failed to load checklist template:', error);
        this.errors.checklist = 'Failed to load checklist items. Please try again.';
        this.$toast.error('Failed to load checklist items');
      } finally {
        this.loading.checklist = false;
      }
    },
    
    // Load Files
    async loadFiles() {
      this.loading.files = true;
      this.errors.file = null;
      
      try {
        const response = await this.$http.secured.get('/api/files', {
          params: {
            page: 1,
            per_page: 50
          }
        });
        
        const data = response.data.data || response.data;
        this.files = data.files || [];
      } catch (error) {
        console.error('Failed to load files:', error);
        this.errors.file = 'Failed to load files. Please try again.';
        this.$toast.error('Failed to load files');
      } finally {
        this.loading.files = false;
      }
    },
    
    // Handle Scheme Change
    onSchemeChange() {
      this.errors.scheme = null;
      if (this.selectedSchemeId && this.selectedDocumentTypeId) {
        this.loadChecklistTemplate();
      } else {
        this.checklistItems = [];
        this.selectedChecklistItemIds = [];
      }
    },
    
    // Handle Document Type Change
    onDocumentTypeChange() {
      this.errors.documentType = null;
      if (this.selectedSchemeId && this.selectedDocumentTypeId) {
        this.loadChecklistTemplate();
      } else {
        this.checklistItems = [];
        this.selectedChecklistItemIds = [];
      }
    },
    
    // Handle File Selection
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.validateAndSetFile(file);
      }
      event.target.value = '';
    },
    
    // Handle Drag and Drop
    handleDrop(event) {
      event.preventDefault();
      this.isDragover = false;
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.validateAndSetFile(files[0]);
      }
    },
    
    // Validate and Set File
    validateAndSetFile(file) {
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
      
      this.uploadError = null;
      this.newFile = file;
    },
    
    // Upload File
    async uploadFile(file) {
      this.isUploading = true;
      this.uploadError = null;
      this.uploadProgressMessage = 'Uploading file...';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const config = {
          timeout: 600000, // 10 minutes for file upload
          transformRequest: [
            function (data, headers) {
              if (data instanceof FormData) {
                delete headers['Content-Type'];
              }
              return data;
            }
          ]
        };
        
        const response = await this.$http.secured.post('/api/files', formData, config);
        const uploadedFile = response.data.data || response.data;
        
        // Reload files list
        await this.loadFiles();
        
        // Set the uploaded file as selected
        this.selectedFileId = uploadedFile.id;
        this.fileSelectionMode = 'existing';
        this.newFile = null;
        
        this.$toast.success('File uploaded successfully!');
        
        // Wait for file to be ready if it's processing
        if (uploadedFile.status === 'processing' || uploadedFile.status === 'uploaded') {
          this.uploadProgressMessage = 'File is processing. Please wait...';
          await this.waitForFileReady(uploadedFile.id);
        }
        
      } catch (error) {
        console.error('Upload failed:', error);
        let errorMessage = 'Failed to upload file. Please try again.';
        
        if (error.response) {
          const errorData = error.response.data;
          if (errorData.error) {
            if (errorData.error.code === 'duplicate_file' || error.response.status === 409) {
              errorMessage = errorData.error.message || 'This file has already been uploaded.';
              this.$toast.warning(errorMessage, { duration: 6000 });
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
    
    // Wait for File to be Ready
    async waitForFileReady(fileId, maxAttempts = 100) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const response = await this.$http.secured.get(`/api/files/${fileId}/status`);
          const statusData = response.data.data || response.data;
          
          if (statusData.status === 'ready' && statusData.vector_store_status === 'completed') {
            await this.loadFiles(); // Refresh files list
            return;
          }
          
          if (statusData.status === 'error') {
            throw new Error(statusData.error_message || 'File processing failed');
          }
          
          // Wait 3 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error('Failed to check file status:', error);
          throw error;
        }
      }
      throw new Error('File processing timeout');
    },
    
    // Validate Form
    validateForm() {
      this.errors.scheme = null;
      this.errors.documentType = null;
      this.errors.checklistItems = null;
      this.errors.file = null;
      this.errors.evaluation = null;
      
      let isValid = true;
      
      if (!this.selectedSchemeId) {
        this.errors.scheme = 'Please select a scheme';
        isValid = false;
      }
      
      if (!this.selectedDocumentTypeId) {
        this.errors.documentType = 'Please select a document type';
        isValid = false;
      }
      
      if (this.selectedChecklistItemIds.length === 0) {
        this.errors.checklistItems = 'Please select at least one checklist item';
        isValid = false;
      }
      
      if (this.fileSelectionMode === 'existing' && !this.selectedFileId) {
        this.errors.file = 'Please select a file';
        isValid = false;
      } else if (this.fileSelectionMode === 'upload' && !this.newFile) {
        this.errors.file = 'Please upload a file';
        isValid = false;
      } else if (this.fileSelectionMode === 'existing' && this.selectedFileId) {
        // Validate selected file is ready
        const selectedFile = this.files.find(f => f.id === this.selectedFileId);
        if (!selectedFile || selectedFile.status !== 'ready' || selectedFile.vector_store_status !== 'completed') {
          this.errors.file = 'Selected file is not ready for evaluation';
          isValid = false;
        }
      }
      
      return isValid;
    },
    
    // Start Evaluation
    async startEvaluation() {
      // Validate form
      if (!this.validateForm()) {
        this.$toast.error('Please fill in all required fields');
        return;
      }
      
      // If new file is selected, upload it first
      if (this.fileSelectionMode === 'upload' && this.newFile) {
        try {
          this.evaluationProgress = 'Uploading file...';
          await this.uploadFile(this.newFile);
        } catch (error) {
          this.errors.evaluation = 'Failed to upload file. Please try again.';
          return;
        }
      }
      
      // Trigger evaluation with retry logic
      try {
        await this.triggerEvaluationWithRetry();
      } catch (error) {
        console.error('Evaluation failed after retries:', error);
        this.errors.evaluation = this.getErrorMessage(error);
        this.$toast.error('Evaluation failed. Please try again.');
      }
    },
    
    // Trigger Evaluation with Retry Logic
    async triggerEvaluationWithRetry(maxAttempts = 3) {
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          this.loading.evaluation = true;
          this.evaluationProgress = attempt === 1 
            ? 'Starting evaluation...' 
            : `Retry attempt ${attempt} of ${maxAttempts}...`;
          
          const result = await this.triggerEvaluation();
          
          // Store logs in localStorage with 24hr expiry
          if (result.logs) {
            this.storeEvaluationLogs(result.id, result.logs);
            this.evaluationLogs = result.logs;
          }
          
          // Success - show message and navigate
          this.$toast.success('Evaluation completed successfully!');
          
          // Try to navigate to results page, fallback to files page if route doesn't exist
          try {
            this.$router.push({
              name: 'EvaluationResults',
              params: { id: result.id }
            }).catch(() => {
              // Route doesn't exist yet, navigate to files page
              this.$router.push({ name: 'FilesPage' });
            });
          } catch (error) {
            // Fallback to files page
            this.$router.push({ name: 'FilesPage' });
          }
          
          return result;
        } catch (error) {
          lastError = error;
          console.error(`Evaluation attempt ${attempt} failed:`, error);
          
          const isRetryable = this.isRetryableError(error);
          
          if (attempt < maxAttempts && isRetryable) {
            const delay = Math.min(Math.pow(2, attempt), 10) * 1000; // 2s, 4s, 8s (capped at 10s)
            this.evaluationProgress = `Retry attempt ${attempt + 1} of ${maxAttempts} in ${delay / 1000}s...`;
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            if (!isRetryable) {
              this.evaluationProgress = 'Non-retryable error occurred. Stopping retries.';
            }
            break;
          }
        } finally {
          if (attempt === maxAttempts || lastError) {
            this.loading.evaluation = false;
            if (lastError) {
              this.evaluationProgress = null;
            }
          }
        }
      }
      
      throw lastError;
    },
    
    // Trigger Evaluation (single attempt)
    async triggerEvaluation() {
      const payload = {
        uploaded_file_id: this.selectedFileId,
        scheme_id: this.selectedSchemeId,
        document_type_id: this.selectedDocumentTypeId,
        checklist_item_ids: this.selectedChecklistItemIds
      };
      
      const response = await this.$http.secured.post('/api/evaluations', payload, {
        timeout: 600000 // 10 minutes for evaluation
      });
      
      return response.data.data || response.data;
    },
    
    // Check if error is retryable
    isRetryableError(error) {
      // Retry on network errors, timeouts, and 5xx server errors
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        return true;
      }
      
      if (error.response) {
        const status = error.response.status;
        // Retry on 5xx errors and rate limits
        if (status >= 500 || status === 429) {
          return true;
        }
        // Don't retry on 4xx client errors (except 429)
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      
      // Retry on timeout errors
      if (error.message && (
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('timed out')
      )) {
        return true;
      }
      
      return false;
    },
    
    // Get Error Message
    getErrorMessage(error) {
      if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error.message || 'Evaluation failed';
      }
      if (error.message) {
        return error.message;
      }
      return 'An unexpected error occurred';
    },
    
    // Copy logs to clipboard
    async copyLogs() {
      try {
        await navigator.clipboard.writeText(this.evaluationLogs);
        this.$toast.success('Logs copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy logs:', error);
        this.$toast.error('Failed to copy logs');
      }
    },
    
    // Handle Back Button
    handleBack() {
      const from = this.$route.query.from;
      const fileId = this.$route.query.fileId;
      
      // If we came from Files page, go back to Files page with fileId to reopen modal
      if (from === 'files' && fileId) {
        this.$router.push({
          name: 'FilesPage',
          query: { fileId: fileId }
        });
      } else {
        // Otherwise, go to evaluations page
        this.$router.push('/evaluations');
      }
    },
    
    // Reset Form
    resetForm() {
      this.selectedSchemeId = null;
      this.selectedDocumentTypeId = null;
      this.checklistItems = [];
      this.selectedChecklistItemIds = [];
      this.selectedFileId = null;
      this.newFile = null;
      this.fileSelectionMode = 'existing';
      this.evaluationProgress = null;
      this.showLogs = false;
      this.evaluationLogs = '';
      this.errors = {
        scheme: null,
        documentType: null,
        checklist: null,
        checklistItems: null,
        file: null,
        evaluation: null
      };
      this.uploadError = null;
    },
    
    // Store evaluation logs in localStorage with 24hr expiry
    storeEvaluationLogs(evaluationId, logs) {
      try {
        const logData = {
          evaluationId: evaluationId,
          logs: logs,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        const key = `evaluation_logs_${evaluationId}`;
        localStorage.setItem(key, JSON.stringify(logData));
        
        // Clean up expired logs
        this.cleanupExpiredLogs();
      } catch (error) {
        console.error('Failed to store evaluation logs:', error);
      }
    },
    
    // Get evaluation logs from localStorage
    getEvaluationLogs(evaluationId) {
      try {
        const key = `evaluation_logs_${evaluationId}`;
        const data = localStorage.getItem(key);
        
        if (!data) return null;
        
        const logData = JSON.parse(data);
        
        // Check if expired
        if (new Date(logData.expiresAt) < new Date()) {
          localStorage.removeItem(key);
          return null;
        }
        
        return logData.logs;
      } catch (error) {
        console.error('Failed to get evaluation logs:', error);
        return null;
      }
    },
    
    // Clean up expired logs
    cleanupExpiredLogs() {
      try {
        const keys = Object.keys(localStorage);
        const now = new Date();
        
        keys.forEach(key => {
          if (key.startsWith('evaluation_logs_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.expiresAt && new Date(data.expiresAt) < now) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              // Invalid data, remove it
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.error('Failed to cleanup expired logs:', error);
      }
    }
  },
  
  mounted() {
    // Clean up expired logs on mount
    this.cleanupExpiredLogs();
    
    // Check authentication
    const token = localStorage.getItem('jwt_access');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    
    // Load initial data
    this.loadSchemes();
    this.loadDocumentTypes();
    this.loadFiles();
    
    // Check if fileId is provided in route params/query
    const fileId = this.$route.params.fileId || this.$route.query.fileId;
    if (fileId) {
      this.selectedFileId = parseInt(fileId);
      this.fileSelectionMode = 'existing';
    }
  }
}
</script>

<style scoped>
.evaluation-page {
  min-height: 100vh;
  background: #f7f7f8;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-content {
  flex: 1;
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

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #e5e5e5;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #565869;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 4px;
}

.back-btn:hover {
  background: #f1f1f1;
  border-color: #d1d5db;
  color: #2d333a;
  transform: translateX(-2px);
}

.back-btn:focus {
  outline: 2px solid #10a37f;
  outline-offset: 2px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d333a;
  margin-bottom: 8px;
}

.required {
  color: #dc2626;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #2d333a;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:hover:not(:disabled) {
  border-color: #10a37f;
}

.form-select:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.form-select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-select.error {
  border-color: #dc2626;
}

.form-hint {
  font-size: 12px;
  color: #565869;
  margin-top: 4px;
  margin-bottom: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
  color: #565869;
}

.progress-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.progress-spinner.inline {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 8px;
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

.error-message.large {
  padding: 16px;
  font-size: 16px;
}

.loading-state {
  text-align: center;
  padding: 32px;
  color: #565869;
}

.checklist-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.checklist-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #565869;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checklist-item:hover {
  border-color: #10a37f;
  background: #f0fdf4;
}

.checklist-item input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
}

.checklist-text {
  flex: 1;
  font-size: 14px;
  color: #2d333a;
  line-height: 1.5;
}

.file-selection-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #565869;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover:not(:disabled) {
  border-color: #10a37f;
  color: #10a37f;
}

.tab-btn.active {
  background: #10a37f;
  border-color: #10a37f;
  color: white;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-selection-content {
  margin-top: 16px;
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

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #10a37f;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
  color: #2d333a;
}

.selected-file svg {
  color: #10a37f;
  flex-shrink: 0;
}

.selected-file span {
  flex: 1;
}

.remove-file-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #dc2626;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-file-btn:hover {
  background: #fee2e2;
  border-radius: 4px;
}

.evaluation-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #1e40af;
}

.evaluation-progress p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #10a37f;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0d8f68;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #565869;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #10a37f;
  color: #10a37f;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #565869;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.logs-section {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.logs-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
}

.toggle-logs-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #565869;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-logs-btn:hover {
  background: #f3f4f6;
  border-color: #10a37f;
  color: #10a37f;
}

.logs-content {
  padding: 16px;
  background: #1e1e1e;
  position: relative;
}

.logs-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #d4d4d4;
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.copy-logs-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-logs-btn:hover {
  background: #0d8f68;
}

.dark-theme .logs-section {
  border-color: #4d4d4f;
}

.dark-theme .logs-header {
  background: #2d2d30;
  border-bottom-color: #4d4d4f;
}

.dark-theme .logs-header h3 {
  color: white;
}

.dark-theme .toggle-logs-btn {
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .toggle-logs-btn:hover {
  background: #3a3a3f;
  border-color: #10a37f;
  color: #10a37f;
}

/* Dark Theme */
.dark-theme .evaluation-page {
  background: #2d2d30;
}

.dark-theme .page-header h1 {
  color: white;
}

.dark-theme .page-subtitle {
  color: #d1d5db;
}

.dark-theme .back-btn {
  background: #3a3a3f;
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .back-btn:hover {
  background: #4d4d4f;
  color: white;
  border-color: #10a37f;
}

.dark-theme .form-section {
  background: #343541;
}

.dark-theme .form-group label {
  color: white;
}

.dark-theme .form-select {
  background: #2d2d30;
  border-color: #4d4d4f;
  color: white;
}

.dark-theme .form-select:hover:not(:disabled) {
  border-color: #10a37f;
}

.dark-theme .form-select:disabled {
  background: #1f2937;
}

.dark-theme .form-hint {
  color: #d1d5db;
}

.dark-theme .checklist-container {
  background: #2d2d30;
  border-color: #4d4d4f;
}

.dark-theme .checklist-header {
  border-bottom-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .checklist-item {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .checklist-item:hover {
  background: #3a3a3f;
  border-color: #10a37f;
}

.dark-theme .checklist-text {
  color: white;
}

.dark-theme .tab-btn {
  background: #2d2d30;
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .tab-btn:hover:not(:disabled) {
  border-color: #10a37f;
  color: #10a37f;
}

.dark-theme .tab-btn.active {
  background: #10a37f;
  border-color: #10a37f;
  color: white;
}

.dark-theme .upload-zone {
  background: #2d2d30;
  border-color: #4d4d4f;
}

.dark-theme .upload-zone:hover {
  background: #3a3a3f;
  border-color: #10a37f;
}

.dark-theme .upload-content h3 {
  color: white;
}

.dark-theme .upload-content p {
  color: #d1d5db;
}

.dark-theme .selected-file {
  background: #1f2937;
  border-color: #10a37f;
  color: white;
}

.dark-theme .btn-secondary {
  background: #343541;
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .btn-secondary:hover:not(:disabled) {
  background: #3a3a3f;
  border-color: #10a37f;
  color: #10a37f;
}

.dark-theme .form-actions {
  border-top-color: #4d4d4f;
}

/* Responsive */
@media (max-width: 768px) {
  .evaluation-page {
    padding: 20px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .back-btn {
    align-self: flex-start;
    margin-top: 0;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .form-section {
    padding: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
