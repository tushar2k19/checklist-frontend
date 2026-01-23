<template>
  <div class="evaluation-results-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Evaluation Results</h1>
        <p class="page-subtitle">Detailed analysis results for this evaluation</p>
      </div>
      <div class="header-actions">
        <button 
          @click="exportToPDF" 
          class="btn btn-secondary" 
          :disabled="!evaluation || !evaluation.results || evaluation.results.length === 0"
          title="Download PDF"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
        <button 
          @click="exportToExcel" 
          class="btn btn-secondary" 
          :disabled="!evaluation || !evaluation.results || evaluation.results.length === 0"
          title="Download Excel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Excel
        </button>
        <button @click="navigateBack" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
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
                  <td class="remarks-text">{{ cleanRemarks(result.remarks) || '—' }}</td>
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
          Back
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
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs
import * as XLSX from 'xlsx'

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
    
    // Clean remarks by removing citation patterns like 【12:12†filename.pdf】
    cleanRemarks(remarks) {
      if (!remarks) return '';
      
      // Remove citation patterns: 【anything】
      let cleaned = remarks.replace(/【[^】]*】/g, '');
      
      // Remove dagger markers (†) that might be left behind
      cleaned = cleaned.replace(/†/g, '');
      
      // Clean up extra whitespace
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
      
      return cleaned;
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
    },
    
    // Export to PDF
    exportToPDF() {
      if (!this.evaluation || !this.evaluation.results || this.evaluation.results.length === 0) return

      const docName = this.evaluation.filename || 'Document'
      const dateStr = new Date(this.evaluation.date).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      })
      const timeStr = new Date(this.evaluation.date).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata'
      })

      const yes = (this.evaluation.summary && this.evaluation.summary.compliant) || 0
      const partial = (this.evaluation.summary && this.evaluation.summary.partial) || 0
      const no = (this.evaluation.summary && this.evaluation.summary.non_compliant) || 0
      const total = (this.evaluation.summary && this.evaluation.summary.total) || this.evaluation.results.length
      const completionPercentage = total > 0 ? Math.round((yes / total) * 100) : 0
      
      // Capture evaluation metadata for use in docDefinition
      const scheme = this.evaluation.scheme || 'N/A'
      const documentType = this.evaluation.document_type || 'N/A'

      // Build pdfmake table body with enhanced colored status cells
      const tableBody = [
        [
          { text: 'S.No.', style: 'tableHeader', fillColor: '#000000' }, 
          { text: 'Checklist Item', style: 'tableHeader', fillColor: '#000000' }, 
          { text: 'Status', style: 'tableHeader', fillColor: '#000000' }, 
          { text: 'Remarks', style: 'tableHeader', fillColor: '#000000' }
        ],
        ...this.evaluation.results.map((r, i) => {
          const status = (r.status || '').toString()
          const s = status.toLowerCase()
          let statusCell = { text: status, alignment: 'center', fontSize: 9, bold: true }
          
          if (s.includes('yes') || s.includes('found') || s.includes('covered')) {
            statusCell = { text: '✓ ' + status, alignment: 'center', fillColor: '#d1fae5', color: '#065f46', bold: true, fontSize: 9 }
          } else if (s.includes('partial')) {
            statusCell = { text: '◐ ' + status, alignment: 'center', fillColor: '#fef3c7', color: '#92400e', bold: true, fontSize: 9 }
          } else if (s.includes('no') || s.includes('not')) {
            statusCell = { text: '✗ ' + status, alignment: 'center', fillColor: '#fee2e2', color: '#991b1b', bold: true, fontSize: 9 }
          }
          
          return [
            { text: String(i + 1), alignment: 'center', fontSize: 9, color: '#1f2937' },
            { text: r.item_text || '', fontSize: 9, color: '#111827' },
            statusCell,
            { text: this.paragraphizeForPdf(this.cleanRemarks(r.remarks || '')), fontSize: 8, color: '#374151' }
          ]
        })
      ]

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 100, 40, 60],
        
        // Professional Header on every page - Compact version
        header: function(currentPage, pageCount) {
          return {
            stack: [
              // Black gradient header background - reduced height
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: 595,
                    h: 80,
                    color: '#000000',
                    linearGradient: ['#000000', '#1a1a1a']
                  }
                ]
              },
              // Government of India text - reduced margin
              {
                text: 'Government of India',
                style: 'govHeader',
                margin: [40, -70, 0, 0]
              },
              // Ministry name - reduced margin
              {
                text: 'Ministry of Development of North Eastern Region',
                style: 'ministryHeader',
                margin: [40, 2, 0, 0]
              },
              // Subtitle - reduced margin
              {
                text: 'DPR Checklist Analysis Report',
                style: 'subtitleHeader',
                margin: [40, 3, 0, 0]
              },
              // Decorative line - reduced margin
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 40,
                    y1: 0,
                    x2: 555,
                    y2: 0,
                    lineWidth: 2,
                    lineColor: '#fbbf24'
                  }
                ],
                margin: [0, 6, 0, 0]
              }
            ]
          }
        },
        
        // Professional Footer
        footer: function(currentPage, pageCount) {
          return {
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 40,
                    y1: 0,
                    x2: 555,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: '#cbd5e1'
                  }
                ]
              },
              {
                columns: [
                  {
                    text: `Generated on: ${dateStr} at ${timeStr}`,
                    style: 'footer',
                    alignment: 'left',
                    margin: [40, 8, 0, 0]
                  },
                  {
                    text: `Page ${currentPage} of ${pageCount}`,
                    style: 'footer',
                    alignment: 'right',
                    margin: [0, 8, 40, 0]
                  }
                ]
              },
              {
                text: 'Ministry of Development of North Eastern Region',
                style: 'footerMinistry',
                alignment: 'center',
                margin: [0, 4, 0, 12]
              }
            ]
          }
        },
        
        content: [
          // Document Information Card - Compact
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        columns: [
                          {
                            width: '*',
                            stack: [
                              { text: 'Document Information', style: 'sectionTitle', margin: [0, 0, 0, 4] },
                              { text: `DPR Name: ${docName}`, style: 'infoLabel', margin: [0, 2, 0, 0], bold: true },
                              { text: `Scheme: ${scheme}`, style: 'infoLabel', margin: [0, 1, 0, 0] },
                              { text: `Document Type: ${documentType}`, style: 'infoLabel', margin: [0, 1, 0, 0] },
                              { text: `Analysis Date: ${dateStr}`, style: 'infoLabel', margin: [0, 1, 0, 0], bold: true },
                              { text: `Total Checklist Items: ${total}`, style: 'infoLabel', margin: [0, 1, 0, 0], bold: true }
                            ]
                          }
                        ]
                      }
                    ],
                    fillColor: '#f8fafc',
                    margin: [8, 8, 8, 8]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: function() { return 1 },
              vLineWidth: function() { return 1 },
              hLineColor: function() { return '#cbd5e1' },
              vLineColor: function() { return '#cbd5e1' }
            },
            margin: [0, 0, 0, 12]
          },
          
          // Summary Statistics Cards
          {
            text: 'Analysis Summary',
            style: 'sectionTitle',
            margin: [0, 0, 0, 8]
          },
          {
            columns: [
              {
                width: '25%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      stack: [
                        { text: yes.toString(), style: 'statNumber', color: '#065f46' },
                        { text: 'Found', style: 'statLabel', color: '#065f46' }
                      ],
                      fillColor: '#d1fae5',
                      alignment: 'center',
                      margin: [6, 8, 6, 8]
                    }
                  ]]
                },
                layout: 'noBorders'
              },
              {
                width: '25%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      stack: [
                        { text: partial.toString(), style: 'statNumber', color: '#92400e' },
                        { text: 'Partial', style: 'statLabel', color: '#92400e' }
                      ],
                      fillColor: '#fef3c7',
                      alignment: 'center',
                      margin: [6, 8, 6, 8]
                    }
                  ]]
                },
                layout: 'noBorders'
              },
              {
                width: '25%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      stack: [
                        { text: no.toString(), style: 'statNumber', color: '#991b1b' },
                        { text: 'Not Found', style: 'statLabel', color: '#991b1b' }
                      ],
                      fillColor: '#fee2e2',
                      alignment: 'center',
                      margin: [6, 8, 6, 8]
                    }
                  ]]
                },
                layout: 'noBorders'
              },
              {
                width: '25%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      stack: [
                        { text: `${completionPercentage}%`, style: 'statNumber', color: '#1e40af' },
                        { text: 'Complete', style: 'statLabel', color: '#1e40af' }
                      ],
                      fillColor: '#dbeafe',
                      alignment: 'center',
                      margin: [6, 8, 6, 8]
                    }
                  ]]
                },
                layout: 'noBorders'
              }
            ],
            columnGap: 8,
            margin: [0, 0, 0, 12]
          },
          
          // Progress Bar
          {
            stack: [
              { text: 'Completion Progress', style: 'progressLabel', margin: [0, 0, 0, 6] },
              {
                canvas: [
                  // Background bar
                  {
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: 515,
                    h: 20,
                    r: 10,
                    color: '#e5e7eb'
                  },
                  // Progress bar
                  {
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: (515 * completionPercentage / 100),
                    h: 20,
                    r: 10,
                    linearGradient: ['#10b981', '#059669']
                  }
                ]
              }
            ],
            margin: [0, 0, 0, 16]
          },
          
          // Checklist Items Section
          {
            text: 'Detailed Checklist Analysis',
            style: 'sectionTitle',
            margin: [0, 0, 0, 8]
          },
          
          // Main Table
          {
            table: {
              headerRows: 1,
              widths: [35, 180, 70, '*'],
              body: tableBody
            },
            layout: {
              fillColor: function(rowIndex) {
                if (rowIndex === 0) return '#1e40af'
                return (rowIndex % 2 === 0) ? '#f9fafb' : '#ffffff'
              },
              hLineWidth: function(i, node) {
                return (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 0.5
              },
              vLineWidth: function() { return 0.5 },
              hLineColor: function(i) {
                return (i === 0 || i === 1) ? '#1e40af' : '#e5e7eb'
              },
              vLineColor: function() { return '#e5e7eb' },
              paddingLeft: function() { return 8 },
              paddingRight: function() { return 8 },
              paddingTop: function() { return 6 },
              paddingBottom: function() { return 6 }
            }
          }
        ],
        
        styles: {
          govHeader: {
            fontSize: 9,
            color: '#ffffff',
            bold: false,
            letterSpacing: 0.3
          },
          ministryHeader: {
            fontSize: 14,
            bold: true,
            color: '#ffffff',
            letterSpacing: 0.2
          },
          subtitleHeader: {
            fontSize: 9,
            color: '#fbbf24',
            bold: false,
            italics: true
          },
          sectionTitle: {
            fontSize: 14,
            bold: true,
            color: '#1e40af',
            margin: [0, 8, 0, 4]
          },
          infoLabel: {
            fontSize: 10,
            color: '#334155',
            lineHeight: 1.4
          },
          statNumber: {
            fontSize: 24,
            bold: true,
            margin: [0, 0, 0, 4]
          },
          statLabel: {
            fontSize: 10,
            bold: true
          },
          progressLabel: {
            fontSize: 11,
            bold: true,
            color: '#475569'
          },
          tableHeader: {
            color: '#ffffff',
            bold: true,
            alignment: 'center',
            fontSize: 10
          },
          footer: {
            fontSize: 8,
            color: '#64748b'
          },
          footerMinistry: {
            fontSize: 7,
            color: '#94a3b8',
            italics: true
          }
        },
        
        defaultStyle: {
          fontSize: 9,
          color: '#1f2937',
          lineHeight: 1.3
        }
      }

      pdfMake.createPdf(docDefinition).download(`Checklist_${this.safeFilename(docName)}_${dateStr.replace(/\s+/g, '_')}.pdf`)
      this.$toast && this.$toast.success('PDF downloaded')
    },
    
    // Export to Excel
    exportToExcel() {
      if (!this.evaluation || !this.evaluation.results || this.evaluation.results.length === 0) return

      const header = ['Item #', 'Checklist Item', 'Status', 'Remarks']
      // Format remarks with paragraph breaks for readability in Excel
      const paragraphize = (txt) => {
        const s = this.cleanRemarks(txt || '')
          // add blank line after a period followed by a capital/number/open bracket
          .replace(/\.\s+(?=[A-Z0-9\(\["'"])/g, '.\n\n')
          // line break after semicolons
          .replace(/;\s+/g, ';\n')
          // turn bullets into new lines
          .replace(/\s*[-•]\s+/g, '\n• ');
        return s.trim();
      }
      const bodyRows = this.evaluation.results.map((r, i) => [i + 1, r.item_text || '', r.status || '', paragraphize(r.remarks)])

      const docName = this.evaluation.filename || 'Document'
      // Get current date in IST and format as YYYY-MM-DD
      const evalDate = new Date(this.evaluation.date);
      const istDate = new Date(evalDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const dateStr = istDate.toISOString().slice(0, 10)

      // Build sheet data with a styled header section
      const titleRow = [`Checklist – ${docName} (${dateStr})`]
      const metaRow = ['Document:', docName, 'Date:', dateStr]
      const schemeRow = ['Scheme:', this.evaluation.scheme || 'N/A', 'Document Type:', this.evaluation.document_type || 'N/A']
      const emptyRow = ['']
      const data = [titleRow, metaRow, schemeRow, emptyRow, header, ...bodyRows]

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)

      // Column widths
      ws['!cols'] = [
        { wch: 8 },   // Item #
        { wch: 48 },  // Checklist Item
        { wch: 12 },  // Status
        { wch: 100 }  // Remarks
      ]

      // Merge the big title across A1:D1
      ws['!merges'] = ws['!merges'] || []
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } })
      ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } })
      ws['!merges'].push({ s: { r: 1, c: 2 }, e: { r: 1, c: 3 } })
      ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } })
      ws['!merges'].push({ s: { r: 2, c: 2 }, e: { r: 2, c: 3 } })

      // Add autofilter on the data table (row 5 is header, zero-indexed r=4)
      const lastRow = 4 + bodyRows.length
      ws['!autofilter'] = { ref: `A5:D${lastRow}` }

      // Optional styling (supported in some viewers)
      const setCell = (addr, s) => { if (ws[addr]) ws[addr].s = s }
      const col = (index) => String.fromCharCode('A'.charCodeAt(0) + index)
      // Title style (green band)
      setCell('A1', { font: { sz: 16, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '10A37F' }, patternType: 'solid' }, alignment: { vertical: 'center' } })
      // Meta rows subtle background
      ;['A2','B2','C2','D2','A3','B3','C3','D3'].forEach(a => setCell(a, { fill: { fgColor: { rgb: 'F3F4F6' }, patternType: 'solid' }, font: { color: { rgb: '111827' } } }))
      // Meta labels bold
      setCell('A2', { font: { bold: true } })
      setCell('C2', { font: { bold: true } })
      setCell('A3', { font: { bold: true } })
      setCell('C3', { font: { bold: true } })
      // Header row bold + center with strong background
      ;['A5','B5','C5','D5'].forEach(a => setCell(a, { font: { bold: true, color: { rgb: 'FFFFFF' } }, alignment: { vertical: 'center', horizontal: 'center' }, fill: { fgColor: { rgb: '374151' }, patternType: 'solid' }, border: { top: { style: 'thin', color: { rgb: '111827' } }, bottom: { style: 'thin', color: { rgb: '111827' } }, left: { style: 'thin', color: { rgb: '111827' } }, right: { style: 'thin', color: { rgb: '111827' } } } }))
      // Body styling: zebra rows, status colors, borders, wrap remarks
      for (let r = 6; r <= lastRow + 1; r++) {
        const isOdd = (r % 2) === 0
        // Row zebra background for A-D
        ;['A','B','C','D'].forEach(ch => {
          const addr = `${ch}${r}`
          const base = { font: { sz: 11, color: { rgb: '111827' } }, alignment: { vertical: 'top', horizontal: ch === 'C' ? 'center' : 'left', wrapText: ch === 'D' }, border: { top: { style: 'thin', color: { rgb: 'D1D5DB' } }, bottom: { style: 'thin', color: { rgb: 'D1D5DB' } }, left: { style: 'thin', color: { rgb: 'D1D5DB' } }, right: { style: 'thin', color: { rgb: 'D1D5DB' } } } }
          const fill = isOdd ? { fill: { fgColor: { rgb: 'F9FAFB' }, patternType: 'solid' } } : {}
          setCell(addr, { ...base, ...fill })
        })
        // Status pill color
        const statusAddr = `C${r}`
        const raw = (ws[statusAddr] && ws[statusAddr].v ? String(ws[statusAddr].v).toLowerCase() : '')
        if (raw.includes('yes') || raw.includes('found') || raw.includes('covered')) {
          setCell(statusAddr, { fill: { fgColor: { rgb: 'DCFCE7' }, patternType: 'solid' }, font: { color: { rgb: '166534' }, bold: true } })
        } else if (raw.includes('partial')) {
          setCell(statusAddr, { fill: { fgColor: { rgb: 'FEF3C7' }, patternType: 'solid' }, font: { color: { rgb: '92400E' }, bold: true } })
        } else if (raw.includes('no') || raw.includes('not')) {
          setCell(statusAddr, { fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' }, font: { color: { rgb: 'B91C1C' }, bold: true } })
        }
      }

      // Suggest row heights (title/meta/header and body)
      ws['!rows'] = ws['!rows'] || []
      ws['!rows'][0] = { hpt: 28 }
      ws['!rows'][1] = { hpt: 18 }
      ws['!rows'][2] = { hpt: 18 }
      ws['!rows'][4] = { hpt: 22 }
      // Make body rows a bit taller for readability
      for (let i = 5; i <= lastRow; i++) {
        ws['!rows'][i] = ws['!rows'][i] || { hpt: 28 }
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Results')
      XLSX.writeFile(wb, `Checklist_${this.safeFilename(docName)}_${dateStr}.xlsx`)
      this.$toast && this.$toast.success('Excel downloaded')
    },
    
    // Apply paragraph breaks for readability in PDF
    paragraphizeForPdf(txt) {
      const s = (txt || '')
        // 1) Normalize exotic/unicode spaces and invisible chars
        .replace(/\u00AD/g, '')                 // soft hyphen
        .replace(/[\u200B-\u200D\uFEFF]/g, '')  // zero-width
        .replace(/[\x00-\x1F\x7F]/g, '')        // control chars
        .replace(/\u00A0/g, ' ')                // NBSP -> space
        .replace(/[\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // thin/ideographic -> space
        // 2) Fix character-by-character spaced runs (letters/digits)
        .replace(/((?:[A-Za-z]\s){2,}[A-Za-z])/g, (m) => m.replace(/\s/g, ''))
        .replace(/((?:\d\s){1,}\d)/g, (m) => m.replace(/\s/g, ''))
        .replace(/\.\s+(?=[A-Z0-9\(\["'"])/g, '.\n\n')
        .replace(/;\s+/g, ';\n')
        .replace(/\s*[-•]\s+/g, '\n• ');
      return s.trim();
    },
    
    // Sanitize filename for download
    safeFilename(name) {
      return (name || 'Document')
        .replace(/\.[^.]+$/, '')
        .replace(/[^\w\-]+/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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

.dark-theme .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

