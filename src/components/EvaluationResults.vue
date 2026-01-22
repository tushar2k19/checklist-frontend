<template>
  <div class="evaluation-results-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Evaluation Results</h1>
        <p class="page-subtitle">Detailed analysis results for this evaluation</p>
      </div>
      <div class="header-actions">
        <button @click="navigateBack" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Evaluations
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="progress-spinner"></div>
      <p>Loading evaluation...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Failed to load evaluation</h3>
      <p>{{ error }}</p>
      <button @click="loadEvaluation" class="btn btn-primary">Retry</button>
    </div>

    <!-- Evaluation Content -->
    <div v-else-if="evaluation" class="evaluation-content">
      <!-- Metadata Section -->
      <div class="metadata-section">
        <div class="section-card">
          <h2>Evaluation Information</h2>
          <div class="metadata-grid">
            <div class="metadata-item">
              <label>Date</label>
              <span>{{ formatDate(evaluation.date) }}</span>
            </div>
            <div class="metadata-item">
              <label>Scheme</label>
              <span>{{ evaluation.scheme }}</span>
            </div>
            <div class="metadata-item">
              <label>Document Type</label>
              <span>{{ evaluation.document_type }}</span>
            </div>
            <div class="metadata-item">
              <label>Filename</label>
              <span>{{ evaluation.filename }}</span>
            </div>
            <div class="metadata-item">
              <label>Status</label>
              <span class="status-badge" :class="getStatusClass(evaluation.status)">
                {{ getStatusLabel(evaluation.status) }}
              </span>
            </div>
            <div class="metadata-item" v-if="evaluation.processing_time">
              <label>Processing Time</label>
              <span>{{ formatProcessingTime(evaluation.processing_time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="evaluation.summary" class="summary-section">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon compliant">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3l8-8"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9s9 4.03 9 9z"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-count">{{ evaluation.summary.compliant || 0 }}</span>
              <span class="summary-label">Compliant</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon partial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-count">{{ evaluation.summary.partial || 0 }}</span>
              <span class="summary-label">Partial</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon non-compliant">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-count">{{ evaluation.summary.non_compliant || 0 }}</span>
              <span class="summary-label">Non-Compliant</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-count">{{ evaluation.summary.total || 0 }}</span>
              <span class="summary-label">Total Items</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Table -->
      <div class="results-section">
        <div class="section-card">
          <h2>Checklist Results</h2>
          <div v-if="evaluation.results && evaluation.results.length > 0" class="table-container">
            <table class="results-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in evaluation.results" :key="result.id" class="result-row">
                  <td class="item-text">{{ result.item_text }}</td>
                  <td>
                    <span class="result-status-badge" :class="getResultStatusClass(result.status)">
                      {{ result.status }}
                    </span>
                  </td>
                  <td class="remarks-text">{{ result.remarks || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-results">
            <p>No results available for this evaluation.</p>
          </div>
        </div>
      </div>

      <!-- Logs Section -->
      <div v-if="evaluationLogs" class="logs-section">
        <div class="section-card">
          <div class="logs-header">
            <h2>Evaluation Logs</h2>
            <button @click="showLogs = !showLogs" class="toggle-logs-btn">
              {{ showLogs ? 'Hide' : 'Show' }} Logs
            </button>
          </div>
          <div v-if="showLogs" class="logs-content">
            <pre class="logs-text">{{ evaluationLogs }}</pre>
            <button @click="copyLogs" class="copy-logs-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Logs
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="actions-section">
        <button @click="navigateBack" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Evaluations
        </button>
        <button 
          v-if="evaluation && evaluation.status === 'completed'"
          @click="reEvaluate" 
          class="btn btn-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Re-evaluate
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EvaluationResults',
  data() {
    return {
      evaluation: null,
      loading: true,
      error: null,
      evaluationLogs: null,
      showLogs: false,
      fileId: null
    }
  },
  
  mounted() {
    // Check authentication
    const token = localStorage.getItem('jwt_access');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    
    // Load evaluation on mount
    this.loadEvaluation();
  },
  
  methods: {
    // Load evaluation data
    async loadEvaluation() {
      const evaluationId = this.$route.params.id;
      if (!evaluationId) {
        this.error = 'Evaluation ID is required';
        this.loading = false;
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$http.secured.get(`/api/evaluations/${evaluationId}`);
        const data = response.data.data || response.data;
        this.evaluation = data;
        
        if (data.uploaded_file_id) {
          this.fileId = data.uploaded_file_id;
        }
        
        this.evaluationLogs = this.getEvaluationLogs(evaluationId);
        
      } catch (error) {
        console.error('Failed to load evaluation:', error);
        if (error.response && error.response.status === 404) {
          this.error = 'Evaluation not found';
        } else if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        } else {
          this.error = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to load evaluation. Please try again.';
        }
      } finally {
        this.loading = false;
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
    
    // Get status class for evaluation status
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
    
    // Get result status class
    getResultStatusClass(status) {
      const statusMap = {
        'Yes': 'result-compliant',
        'No': 'result-non-compliant',
        'Partial': 'result-partial'
      };
      return statusMap[status] || 'result-unknown';
    },
    
    // Navigate back
    navigateBack() {
      // Try to go back, or navigate to evaluations
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push({ path: '/evaluations' });
      }
    },
    
    async reEvaluate() {
      if (this.fileId) {
        this.$router.push({ 
          name: 'NewEvaluation', 
          query: { fileId: this.fileId } 
        });
        return;
      }
      
      this.$router.push({ name: 'NewEvaluation' });
    }
  }
}
</script>

<style scoped>
.evaluation-results-page {
  min-height: 100vh;
  background: #f7f7f8;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
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

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 64px 24px;
  color: #565869;
}

.error-state svg {
  color: #dc2626;
  margin-bottom: 16px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 8px 0;
}

.error-state p {
  font-size: 14px;
  margin: 0 0 24px 0;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.evaluation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.section-card h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 20px 0;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-item label {
  font-size: 12px;
  font-weight: 600;
  color: #565869;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-item span {
  font-size: 14px;
  color: #2d333a;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

.summary-section {
  margin-top: 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon.compliant {
  background: #dcfce7;
  color: #166534;
}

.summary-icon.partial {
  background: #fef3c7;
  color: #92400e;
}

.summary-icon.non-compliant {
  background: #fef2f2;
  color: #dc2626;
}

.summary-icon.total {
  background: #e0e7ff;
  color: #3730a3;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-count {
  font-size: 24px;
  font-weight: 600;
  color: #2d333a;
}

.summary-label {
  font-size: 14px;
  color: #565869;
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.results-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #565869;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.result-row:hover {
  background: #f9fafb;
}

.item-text {
  font-size: 14px;
  color: #2d333a;
  line-height: 1.5;
}

.result-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.result-compliant {
  background: #dcfce7;
  color: #166534;
}

.result-partial {
  background: #fef3c7;
  color: #92400e;
}

.result-non-compliant {
  background: #fef2f2;
  color: #dc2626;
}

.result-unknown {
  background: #f3f4f6;
  color: #4b5563;
}

.remarks-text {
  font-size: 14px;
  color: #565869;
  line-height: 1.5;
}

.empty-results {
  text-align: center;
  padding: 32px;
  color: #565869;
}

.logs-section {
  margin-top: 0;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.logs-content {
  position: relative;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
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
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-logs-btn:hover {
  background: #0d8f68;
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

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  gap: 8px;
}

.btn-primary {
  background: #10a37f;
  color: white;
}

.btn-primary:hover {
  background: #0d8f68;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #565869;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #10a37f;
  color: #10a37f;
}

/* Dark Theme */
.dark-theme .evaluation-results-page {
  background: #2d2d30;
}

.dark-theme .page-header h1 {
  color: white;
}

.dark-theme .page-subtitle {
  color: #d1d5db;
}

.dark-theme .error-state h3 {
  color: white;
}

.dark-theme .error-state p {
  color: #d1d5db;
}

.dark-theme .section-card {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .section-card h2 {
  color: white;
}

.dark-theme .metadata-item label {
  color: #d1d5db;
}

.dark-theme .metadata-item span {
  color: white;
}

.dark-theme .summary-card {
  background: #343541;
  border-color: #4d4d4f;
}

.dark-theme .summary-card:hover {
  border-color: #565869;
}

.dark-theme .summary-count {
  color: white;
}

.dark-theme .summary-label {
  color: #d1d5db;
}

.dark-theme .results-table thead {
  background: #2d2d30;
  border-bottom-color: #4d4d4f;
}

.dark-theme .results-table th {
  color: #d1d5db;
}

.dark-theme .results-table td {
  border-bottom-color: #4d4d4f;
}

.dark-theme .result-row:hover {
  background: #3a3a3f;
}

.dark-theme .item-text {
  color: #d1d5db;
}

.dark-theme .remarks-text {
  color: #d1d5db;
}

.dark-theme .empty-results {
  color: #d1d5db;
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

.dark-theme .actions-section {
  border-top-color: #4d4d4f;
}

.dark-theme .btn-secondary {
  background: #343541;
  border-color: #4d4d4f;
  color: #d1d5db;
}

.dark-theme .btn-secondary:hover {
  background: #3a3a3f;
  border-color: #10a37f;
  color: #10a37f;
}

/* Responsive */
@media (max-width: 768px) {
  .evaluation-results-page {
    padding: 20px;
  }
  
  .page-header {
    flex-direction: column;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

