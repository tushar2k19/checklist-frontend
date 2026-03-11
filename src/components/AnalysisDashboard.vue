<template>
  <div class="analysis-dashboard-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Evaluations</h1>
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
              <span class="subtitle-text">View and manage your past evaluations</span>
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="navigateToNewEvaluation" class="btn btn-primary">
            <div class="btn-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="btn-text">New Evaluation</span>
          </button>
        </div>
      </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label for="scheme-filter">Scheme</label>
            <select
              id="scheme-filter"
              v-model="selectedSchemeId"
              @change="onFilterChange"
              :disabled="loading.schemes || loading.evaluations"
              class="filter-select"
            >
              <option value="">All Schemes</option>
              <option v-for="scheme in schemes" :key="scheme.id" :value="scheme.id">
                {{ scheme.name }}
              </option>
            </select>
            <div v-if="loading.schemes" class="loading-indicator">
              <div class="progress-spinner small"></div>
            </div>
          </div>

          <div class="filter-group">
            <label for="doc-type-filter">Document Type</label>
            <select
              id="doc-type-filter"
              v-model="selectedDocumentTypeId"
              @change="onFilterChange"
              :disabled="loading.documentTypes || loading.evaluations"
              class="filter-select"
            >
              <option value="">All Document Types</option>
              <option v-for="docType in documentTypes" :key="docType.id" :value="docType.id">
                {{ docType.name }}
              </option>
            </select>
            <div v-if="loading.documentTypes" class="loading-indicator">
              <div class="progress-spinner small"></div>
            </div>
          </div>

          <div class="filter-group">
            <label for="file-filter">File Name</label>
            <select
              id="file-filter"
              v-model="selectedFileId"
              @change="onFilterChange"
              :disabled="loading.files || loading.evaluations"
              class="filter-select"
            >
              <option value="">All Files</option>
              <option v-for="file in uniqueFiles" :key="file.id" :value="file.id">
                {{ file.filename }}
              </option>
            </select>
            <div v-if="loading.files" class="loading-indicator">
              <div class="progress-spinner small"></div>
            </div>
          </div>

          <div class="filter-group">
            <label for="days-filter">Time Period</label>
            <select
              id="days-filter"
              v-model="selectedDays"
              @change="onFilterChange"
              :disabled="loading.evaluations"
              class="filter-select"
            >
              <option :value="7">Last 7 days</option>
              <option :value="30">Last 30 days</option>
              <option :value="60">Last 60 days</option>
              <option :value="90">Last 90 days</option>
            </select>
          </div>

          <div class="filter-actions">
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="btn btn-secondary"
              :disabled="loading.evaluations"
            >
              Clear Filters
            </button>
            <button 
              @click="refreshEvaluations"
              class="btn btn-secondary"
              :disabled="loading.evaluations"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading.evaluations && evaluations.length === 0" class="loading-state">
      <div class="progress-spinner"></div>
      <p>Loading evaluations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Failed to load evaluations</h3>
      <p>{{ error }}</p>
      <button @click="loadEvaluations" class="btn btn-primary">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading.evaluations && evaluations.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <h3>No evaluations found</h3>
      <p v-if="hasActiveFilters">Try adjusting your filters or create a new evaluation.</p>
      <p v-else>Create your first evaluation to get started.</p>
      <button @click="navigateToNewEvaluation" class="btn btn-primary">New Evaluation</button>
    </div>

    <!-- Evaluations List -->
    <div v-else class="evaluations-section">
      <div class="section-header">
        <h2>Evaluations ({{ pagination.total_count || 0 }})</h2>
      </div>

      <div class="evaluations-grid">
        <div
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          class="evaluation-card"
        >
          <div class="card-header">
            <div class="evaluation-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="card-title-section">
              <div class="card-title">
                <h3 @click="navigateToEvaluation(evaluation.id)" class="card-title-clickable">{{ evaluation.filename }}</h3>
                <span class="status-badge" :class="getStatusClass(evaluation.status)">
                  {{ getStatusLabel(evaluation.status) }}
                </span>
              </div>
              <div class="card-header-actions">
                <div class="card-date">{{ formatDate(evaluation.date) }}</div>
                <button 
                  @click.stop="deleteEvaluation(evaluation)"
                  class="delete-btn"
                  title="Delete evaluation"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="card-body" @click="navigateToEvaluation(evaluation.id)">
            <div class="card-meta">
              <div class="meta-item">
                <label>Scheme</label>
                <span>{{ evaluation.scheme }}</span>
              </div>
              <div class="meta-item">
                <label>Document Type</label>
                <span>{{ evaluation.document_type }}</span>
              </div>
              <div class="meta-item" v-if="evaluation.processing_time">
                <label>Processing Time</label>
                <span>{{ formatProcessingTime(evaluation.processing_time) }}</span>
              </div>
            </div>

            <div v-if="evaluation.summary" class="summary-stats">
              <div class="stat-item">
                <span class="stat-value compliant">{{ evaluation.summary.compliant || 0 }}</span>
                <span class="stat-label">Compliant</span>
              </div>
              <div class="stat-item">
                <span class="stat-value partial">{{ evaluation.summary.partial || 0 }}</span>
                <span class="stat-label">Partial</span>
              </div>
              <div class="stat-item">
                <span class="stat-value non-compliant">{{ evaluation.summary.non_compliant || 0 }}</span>
                <span class="stat-label">Non-Compliant</span>
              </div>
              <div class="stat-item">
                <span class="stat-value total">{{ evaluation.summary.total || 0 }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="pagination">
        <button
          @click="onPageChange(Math.max(1, pagination.current_page - 1))"
          :disabled="pagination.current_page === 1 || loading.evaluations"
          class="page-btn"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.current_page }} of {{ pagination.total_pages }}
        </span>
        <button
          @click="onPageChange(Math.min(pagination.total_pages, pagination.current_page + 1))"
          :disabled="pagination.current_page >= pagination.total_pages || loading.evaluations"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalysisDashboard',
  data() {
    return {
      evaluations: [],
      schemes: [],
      documentTypes: [],
      files: [],
      selectedSchemeId: '',
      selectedDocumentTypeId: '',
      selectedFileId: '',
      selectedDays: 30,
      loading: {
        evaluations: false,
        schemes: false,
        documentTypes: false,
        files: false
      },
      error: null,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 20
      }
    }
  },
  
  computed: {
    hasActiveFilters() {
      return this.selectedSchemeId !== '' || this.selectedDocumentTypeId !== '' || this.selectedFileId !== '';
    },
    uniqueFiles() {
      // Get unique files that have evaluations
      const fileMap = new Map();
      
      // First, add files from current evaluations (these are files that definitely have evaluations)
      this.evaluations.forEach(evaluation => {
        if (evaluation.uploaded_file_id && evaluation.filename) {
          if (!fileMap.has(evaluation.uploaded_file_id)) {
            fileMap.set(evaluation.uploaded_file_id, {
              id: evaluation.uploaded_file_id,
              filename: evaluation.filename
            });
          }
        }
      });
      
      // Also add ready files from the files list (to show all available files)
      this.files.forEach(file => {
        if (file.id && file.status === 'ready' && (file.display_name || file.filename)) {
          if (!fileMap.has(file.id)) {
            fileMap.set(file.id, {
              id: file.id,
              filename: file.display_name || file.filename
            });
          }
        }
      });
      
      return Array.from(fileMap.values()).sort((a, b) => 
        a.filename.localeCompare(b.filename)
      );
    }
  },
  
  mounted() {
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
    this.loadEvaluations();
  },
  
  methods: {
    // Load evaluations
    async loadEvaluations() {
      this.loading.evaluations = true;
      this.error = null;
      
      try {
        const params = {
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
          days: this.selectedDays
        };
        
        if (this.selectedSchemeId) {
          params.scheme_id = this.selectedSchemeId;
        }
        
        if (this.selectedDocumentTypeId) {
          params.document_type_id = this.selectedDocumentTypeId;
        }
        
        if (this.selectedFileId) {
          params.uploaded_file_id = this.selectedFileId;
        }
        
        const response = await this.$http.secured.get('/api/evaluations', { params });
        const data = response.data.data || response.data;
        
        this.evaluations = data.evaluations || [];
        this.pagination = data.pagination || this.pagination;
        
        // Ensure pagination values are valid
        if (this.pagination.current_page < 1) {
          this.pagination.current_page = 1;
        }
        if (this.pagination.total_pages < 1) {
          this.pagination.total_pages = 1;
        }
        
      } catch (error) {
        console.error('Failed to load evaluations:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        } else {
          this.error = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to load evaluations. Please try again.';
          this.$toast.error('Failed to load evaluations');
        }
      } finally {
        this.loading.evaluations = false;
      }
    },
    
    // Load schemes
    async loadSchemes() {
      this.loading.schemes = true;
      
      try {
        const response = await this.$http.secured.get('/api/schemes');
        const data = response.data.data || response.data;
        this.schemes = data.schemes || [];
      } catch (error) {
        console.error('Failed to load schemes:', error);
        this.$toast.error('Failed to load schemes');
      } finally {
        this.loading.schemes = false;
      }
    },
    
    // Load document types
    async loadDocumentTypes() {
      this.loading.documentTypes = true;
      
      try {
        const response = await this.$http.secured.get('/api/document_types');
        const data = response.data.data || response.data;
        this.documentTypes = data.document_types || [];
      } catch (error) {
        console.error('Failed to load document types:', error);
        this.$toast.error('Failed to load document types');
      } finally {
        this.loading.documentTypes = false;
      }
    },
    
    // Load files (to populate filename filter)
    async loadFiles() {
      this.loading.files = true;
      
      try {
        // Load all files to get the complete list for the filter
        const response = await this.$http.secured.get('/api/files', {
          params: {
            page: 1,
            per_page: 200 // Get more files to populate the dropdown
          }
        });
        const data = response.data.data || response.data;
        this.files = data.files || [];
      } catch (error) {
        console.error('Failed to load files:', error);
        // Don't show error toast, just log it - files are optional for the filter
        // The uniqueFiles computed will still work with files from evaluations
      } finally {
        this.loading.files = false;
      }
    },
    
    // Handle filter changes
    onFilterChange() {
      // Reset to first page when filters change
      this.pagination.current_page = 1;
      this.loadEvaluations();
    },
    
    // Clear filters
    clearFilters() {
      this.selectedSchemeId = '';
      this.selectedDocumentTypeId = '';
      this.selectedFileId = '';
      this.selectedDays = 30;
      this.onFilterChange();
    },
    
    // Refresh evaluations
    refreshEvaluations() {
      this.loadEvaluations();
    },
    
    // Handle pagination
    onPageChange(page) {
      this.pagination.current_page = page;
      this.loadEvaluations();
    },
    
    // Format date in IST
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // Format processing time
    formatProcessingTime(seconds) {
      if (!seconds) return '—';
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    },
    
    // Get status class
    getStatusClass(status) {
      const statusMap = {
        'completed': 'status-completed',
        'processing': 'status-processing',
        'failed': 'status-failed',
        'pending': 'status-pending'
      };
      return statusMap[status] || 'status-pending';
    },
    
    // Get status label
    getStatusLabel(status) {
      const labelMap = {
        'completed': 'Completed',
        'processing': 'Processing',
        'failed': 'Failed',
        'pending': 'Pending'
      };
      return labelMap[status] || 'Pending';
    },
    
    // Navigate to evaluation details
    navigateToEvaluation(id) {
      this.$router.push({ name: 'EvaluationResults', params: { id } });
    },
    
    // Navigate to new evaluation
    navigateToNewEvaluation() {
      this.$router.push({ name: 'NewEvaluation' });
    },
    
    // Delete evaluation
    async deleteEvaluation(evaluation) {
      if (!confirm(`Are you sure you want to delete the evaluation for "${evaluation.filename}"?`)) {
        return;
      }
      
      try {
        await this.$http.secured.delete(`/api/evaluations/${evaluation.id}`);
        this.$toast.success('Evaluation deleted successfully');
        
        // Reload evaluations list
        await this.loadEvaluations();
      } catch (error) {
        console.error('Failed to delete evaluation:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        } else {
          const errorMessage = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to delete evaluation. Please try again.';
          this.$toast.error(errorMessage);
        }
      }
    }
  }
}
</script>

<style scoped>
.analysis-dashboard-page {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.filters-section {
  margin-bottom: 32px;
}

.filters-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #565869;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
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

.filter-select:hover:not(:disabled) {
  border-color: #F97B22;
}

.filter-select:focus {
  outline: none;
  border-color: #F97B22;
  box-shadow: 0 0 0 3px rgba(249, 123, 34, 0.1);
}

.filter-select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-indicator {
  position: absolute;
  right: 12px;
  bottom: 12px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #565869;
}

.error-state svg,
.empty-state svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.error-state h3,
.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.error-state p,
.empty-state p {
  font-size: 14px;
  margin: 0 0 24px 0;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.progress-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.evaluations-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d333a;
  margin: 0;
}

.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.evaluation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.evaluation-card::before {
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

.evaluation-card:hover {
  border-color: #F97B22;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.evaluation-card:hover::before {
  transform: scaleX(1);
}

.card-body {
  cursor: pointer;
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.evaluation-icon-wrapper {
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

.card-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
  flex: 1;
  word-break: break-word;
  line-height: 1.4;
}

.card-title-clickable {
  cursor: pointer;
}

.card-title-clickable:hover {
  color: #F97B22;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-date {
  font-size: 12px;
  color: #565869;
}

.delete-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 14px;
  color: #565869;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.meta-item label {
  font-weight: 500;
  color: #565869;
}

.meta-item span {
  color: #2d333a;
  text-align: right;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
}

.stat-value.compliant {
  color: #166534;
}

.stat-value.partial {
  color: #92400e;
}

.stat-value.non-compliant {
  color: #dc2626;
}

.stat-value.total {
  color: #3730a3;
}

.stat-label {
  font-size: 11px;
  color: #565869;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
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
}

.page-info {
  font-size: 14px;
  color: #565869;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #2563EB, #3B82F6, #60A5FA);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  background: linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD);
}

.btn-primary:hover:not(:disabled) .btn-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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
  border-color: #F97B22;
  color: #F97B22;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark Theme */
.dark-theme .analysis-dashboard-page {
  background: #2d2d30;
}

.dark-theme .page-header h1 {
  color: white;
}

.dark-theme .page-subtitle {
  color: #d1d5db;
}

.dark-theme .filters-card {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .filter-group label {
  color: #d1d5db;
}

.dark-theme .filter-select {
  background: #2d2d30;
  border-color: #4d4d4f;
  color: white;
}

.dark-theme .filter-select:hover:not(:disabled) {
  border-color: #10a37f;
}

.dark-theme .filter-select:disabled {
  background: #1f2937;
}

.dark-theme .error-state h3,
.dark-theme .empty-state h3 {
  color: white;
}

.dark-theme .error-state p,
.dark-theme .empty-state p {
  color: #d1d5db;
}

.dark-theme .evaluations-section {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .section-header h2 {
  color: white;
}

.dark-theme .evaluation-card {
  background: #2d2d30;
  border-color: #4d4d4f;
}

.dark-theme .evaluation-card:hover {
  border-color: #10a37f;
}

.dark-theme .card-header {
  border-bottom-color: #4d4d4f;
}

.dark-theme .card-title h3 {
  color: white;
}

.dark-theme .card-title-clickable:hover {
  color: #10a37f;
}

.dark-theme .card-date {
  color: #d1d5db;
}

.dark-theme .delete-btn {
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .delete-btn:hover {
  background: #3a1f1f;
  border-color: #ef4444;
  color: #ef4444;
}

.dark-theme .meta-item label {
  color: #d1d5db;
}

.dark-theme .meta-item span {
  color: white;
}

.dark-theme .summary-stats {
  border-top-color: #4d4d4f;
}

.dark-theme .stat-label {
  color: #d1d5db;
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

/* Responsive */
@media (max-width: 1024px) {
  .evaluations-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .analysis-dashboard-page {
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
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .filters-card {
    padding: 24px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .evaluations-section {
    padding: 24px;
  }
  
  .evaluations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .filters-card {
    padding: 20px;
  }
  
  .evaluations-section {
    padding: 20px;
  }
  
  .evaluation-card {
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
</style>

