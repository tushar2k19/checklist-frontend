<template>
  <div v-if="visible" class="followup-modal-overlay" @click.self="closeModal">
    <div class="followup-modal">
      <div class="followup-modal-header">
        <div class="header-content">
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M9 10h.01M15 10h.01"/>
            </svg>
          </div>
          <div class="header-text">
            <h3>Follow-up Conversation</h3>
            <p class="header-subtitle">Ask questions to get more insights</p>
          </div>
        </div>
        <button class="close-btn" @click="closeModal" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="followup-context">
        <div class="context-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <div class="context-details">
            <label>Document</label>
            <span>{{ filename || 'No document' }}</span>
          </div>
        </div>
        <div class="context-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3l8-8"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s9-4.03 9-9s4.03 9 9 9z"/>
          </svg>
          <div class="context-details">
            <label>Checklist Item</label>
            <span>{{ result.item_text }}</span>
          </div>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="loadingMessages" class="empty-state">
          <div class="loading-spinner"></div>
          <p>Loading conversation...</p>
        </div>
        <div v-else-if="messages.length === 0" class="empty-state welcome-state">
          <div class="welcome-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="9" y1="10" x2="9.01" y2="10"/>
              <line x1="15" y1="10" x2="15.01" y2="10"/>
              <path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>
            </svg>
          </div>
          <h4>Start a Conversation</h4>
          <p>Ask your first follow-up question about this checklist item.</p>
        </div>
        <div
          v-for="(message, index) in messages"
          :key="`message-${index}`"
          :class="[
            'message-wrapper',
            message.role === 'user' ? 'message-user-wrapper' : 'message-assistant-wrapper'
          ]"
        >
          <div class="message-avatar">
            <div v-if="message.role === 'user'" class="avatar user-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div v-else class="avatar assistant-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? 'You' : 'Assistant' }}</span>
              <span v-if="message.created_at" class="message-time">{{ formatTime(message.created_at) }}</span>
            </div>
            <div
              :class="[
                'message-bubble',
                message.role === 'user' ? 'message-user' : 'message-assistant',
                statusClass(message)
              ]"
            >
              <div v-if="message.role === 'assistant' && message.status" class="status-pill" :class="statusPillClass(message.status)">
                {{ statusLabel(message.status) }}
              </div>
              <div class="message-content" v-html="cleanMessageContent(message.content)"></div>
            </div>
          </div>
        </div>
        <div v-if="isTyping" class="message-wrapper message-assistant-wrapper">
          <div class="message-avatar">
            <div class="avatar assistant-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-role">Assistant</span>
            </div>
            <div class="message-bubble message-assistant">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="followup-input-row">
        <div class="input-wrapper">
          <textarea
            ref="questionInput"
            v-model.trim="draftQuestion"
            class="followup-textarea"
            rows="1"
            placeholder="Type your follow-up question here..."
            @keydown.enter.exact.prevent="sendQuestion"
            @input="adjustTextareaHeight"
          />
          <button 
            class="send-btn" 
            :disabled="!draftQuestion || sending" 
            @click="sendQuestion"
            :class="{ 'sending': sending }"
          >
            <svg v-if="!sending" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <div v-else class="button-spinner"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FollowupQuestionModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    evaluationId: {
      type: [String, Number],
      required: true
    },
    result: {
      type: Object,
      required: true
    },
    filename: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      draftQuestion: '',
      messages: [],
      loadingMessages: false,
      sending: false,
      isTyping: false
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadMessages()
      }
    },
    result: {
      handler() {
        if (this.visible) {
          this.loadMessages()
        }
      },
      deep: false
    }
  },
  methods: {
    async loadMessages() {
      if (!this.result || !this.result.id) return

      this.loadingMessages = true
      this.messages = []

      try {
        const response = await this.$http.secured.get(
          `/api/evaluations/${this.evaluationId}/followup_questions/${this.result.id}`
        )
        const data = response.data.data || response.data
        this.messages = (data.messages || []).map((message) => ({
          role: message.role,
          content: message.content,
          status: message.status || null,
          created_at: message.created_at
        }))
        this.$nextTick(this.scrollToBottom)
      } catch (error) {
        console.error('Failed to load follow-up messages:', error)
        const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to load follow-up conversation.'
        this.$toast.error(message)
      } finally {
        this.loadingMessages = false
      }
    },
    async sendQuestion() {
      if (this.sending || !this.draftQuestion || !this.result || !this.result.id) return

      const question = this.draftQuestion
      this.sending = true
      this.isTyping = true
      this.draftQuestion = ''

      this.messages.push({
        role: 'user',
        content: question,
        created_at: new Date().toISOString()
      })
      this.$nextTick(this.scrollToBottom)

      try {
        const response = await this.$http.secured.post(
          `/api/evaluations/${this.evaluationId}/followup_questions`,
          {
            evaluation_checklist_item_id: this.result.id,
            message: question
          }
        )
        const data = response.data.data || response.data
        this.isTyping = false
        this.messages.push({
          role: 'assistant',
          content: data.answer || 'No response received.',
          status: data.status || null,
          created_at: new Date().toISOString()
        })
        this.$nextTick(this.scrollToBottom)
      } catch (error) {
        console.error('Failed to send follow-up question:', error)
        this.isTyping = false
        const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to send follow-up question.'
        this.$toast.error(message)
      } finally {
        this.sending = false
        this.$nextTick(() => {
          this.adjustTextareaHeight()
        })
      }
    },
    closeModal() {
      this.draftQuestion = ''
      this.$emit('close')
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (!container) return
      container.scrollTop = container.scrollHeight
    },
    formatTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })
    },
    statusClass(message) {
      if (!message || message.role !== 'assistant' || !message.status) return ''
      const status = String(message.status).toLowerCase()
      if (status === 'yes') return 'assistant-status-yes'
      if (status === 'no') return 'assistant-status-no'
      if (status === 'partial') return 'assistant-status-partial'
      return ''
    },
    statusPillClass(status) {
      const normalized = String(status).toLowerCase()
      if (normalized === 'yes') return 'pill-yes'
      if (normalized === 'no') return 'pill-no'
      if (normalized === 'partial') return 'pill-partial'
      return ''
    },
    statusLabel(status) {
      const normalized = String(status).toLowerCase()
      if (normalized === 'yes') return 'Found'
      if (normalized === 'no') return 'Not found'
      if (normalized === 'partial') return 'Partial'
      return status
    },
    cleanMessageContent(content) {
      if (!content) return ''
      
      // Remove citation patterns: 【anything】
      let cleaned = content.replace(/【[^】]*】/g, '')
      
      // Remove dagger markers (†) that might be left behind
      cleaned = cleaned.replace(/†/g, '')
      
      // Clean up extra whitespace but preserve newlines
      // Replace non-newline whitespace sequences with a single space
      cleaned = cleaned.replace(/[ \t]{2,}/g, ' ').trim()
      
      // Bold specific keywords
      cleaned = cleaned.replace(/^Item:/gm, '<strong>Item:</strong>')
      cleaned = cleaned.replace(/^Status:/gm, '<strong>Status:</strong>')
      cleaned = cleaned.replace(/^Remarks:/gm, '<strong>Remarks:</strong>')
      
      return cleaned
    },
    adjustTextareaHeight() {
      this.$nextTick(() => {
        const textarea = this.$refs.questionInput
        if (!textarea) return
        
        textarea.style.height = 'auto'
        const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
        textarea.style.height = newHeight + 'px'
      })
    }
  }
}
</script>

<style scoped>
.followup-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.followup-modal {
  width: min(950px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.followup-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #F97B22, #FF8C42);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text h3 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.header-subtitle {
  margin: 2px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 400;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.followup-context {
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.context-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.context-item svg {
  color: #3B82F6;
  margin-top: 2px;
  flex-shrink: 0;
}

.context-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-details label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.context-details span {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f9fafb;
  min-height: 300px;
  max-height: 500px;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  padding: 48px 24px;
  height: 100%;
}

.welcome-state {
  gap: 16px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(249, 123, 34, 0.1), rgba(255, 140, 66, 0.1));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97B22;
}

.welcome-state h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.welcome-state p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #F97B22;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user-wrapper {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}

.assistant-avatar {
  background: linear-gradient(135deg, #F97B22, #FF8C42);
  color: white;
}

.message-content-wrapper {
  flex: 1;
  max-width: calc(100% - 48px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-user-wrapper .message-content-wrapper {
  align-items: flex-end;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.message-user-wrapper .message-header {
  flex-direction: row-reverse;
}

.message-role {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.message-user {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-assistant {
  background: white;
  color: #1e293b;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.assistant-status-yes {
  border-color: #86efac;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.assistant-status-no {
  border-color: #fca5a5;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.assistant-status-partial {
  border-color: #fcd34d;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.status-pill {
  display: inline-block;
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.pill-yes {
  background: #dcfce7;
  color: #166534;
}

.pill-no {
  background: #fee2e2;
  color: #991b1b;
}

.pill-partial {
  background: #fef3c7;
  color: #92400e;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 14px;
}

.message-user .message-content {
  color: white;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #cbd5e1;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.followup-input-row {
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  background: white;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #F97B22;
  background: white;
  box-shadow: 0 0 0 3px rgba(249, 123, 34, 0.1);
}

.followup-textarea {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 12px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
  min-height: 44px;
  max-height: 120px;
  overflow-y: auto;
}

.followup-textarea:focus {
  outline: none;
}

.followup-textarea::placeholder {
  color: #94a3b8;
}

.followup-textarea::-webkit-scrollbar {
  width: 6px;
}

.followup-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.followup-textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #F97B22, #FF8C42);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(249, 123, 34, 0.3);
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF8C42, #FFB366);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 123, 34, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn.sending {
  cursor: not-allowed;
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Dark Theme */
.dark-theme .followup-modal {
  background: #1e293b;
}

.dark-theme .followup-modal-header {
  background: linear-gradient(135deg, #1e293b, #334155);
  border-bottom-color: #334155;
}

.dark-theme .header-icon {
  background: rgba(249, 123, 34, 0.2);
}

.dark-theme .followup-context {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-bottom-color: #334155;
}

.dark-theme .context-details label {
  color: #94a3b8;
}

.dark-theme .context-details span {
  color: #e2e8f0;
}

.dark-theme .messages-container {
  background: #0f172a;
}

.dark-theme .messages-container::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark-theme .messages-container::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark-theme .messages-container::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.dark-theme .welcome-icon {
  background: linear-gradient(135deg, rgba(249, 123, 34, 0.15), rgba(255, 140, 66, 0.15));
}

.dark-theme .welcome-state h4 {
  color: #f1f5f9;
}

.dark-theme .welcome-state p {
  color: #94a3b8;
}

.dark-theme .message-role {
  color: #cbd5e1;
}

.dark-theme .message-time {
  color: #64748b;
}

.dark-theme .message-assistant {
  background: #1e293b;
  color: #e2e8f0;
  border-color: #334155;
}

.dark-theme .assistant-status-yes {
  border-color: #166534;
  background: linear-gradient(135deg, #052e16, #14532d);
}

.dark-theme .assistant-status-no {
  border-color: #991b1b;
  background: linear-gradient(135deg, #450a0a, #7f1d1d);
}

.dark-theme .assistant-status-partial {
  border-color: #92400e;
  background: linear-gradient(135deg, #451a03, #78350f);
}

.dark-theme .typing-indicator span {
  background: #475569;
}

.dark-theme .followup-input-row {
  background: #1e293b;
  border-top-color: #334155;
}

.dark-theme .input-wrapper {
  background: #0f172a;
  border-color: #334155;
}

.dark-theme .input-wrapper:focus-within {
  border-color: #F97B22;
  background: #1e293b;
  box-shadow: 0 0 0 3px rgba(249, 123, 34, 0.15);
}

.dark-theme .followup-textarea {
  color: #e2e8f0;
}

.dark-theme .followup-textarea::placeholder {
  color: #64748b;
}

.dark-theme .followup-textarea::-webkit-scrollbar-thumb {
  background: #475569;
}

/* Responsive */
@media (max-width: 768px) {
  .followup-modal {
    max-height: 95vh;
    border-radius: 12px;
  }

  .followup-modal-header {
    padding: 16px 20px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .header-text h3 {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .followup-context {
    padding: 12px 20px;
  }

  .messages-container {
    padding: 16px;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .message-bubble {
    padding: 10px 14px;
  }

  .followup-input-row {
    padding: 12px 16px;
  }
}
</style>
