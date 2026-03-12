<template>
  <div v-if="visible" class="followup-modal-overlay" @click.self="closeModal">
    <div class="followup-modal">
      <div class="followup-modal-header">
        <h3>Follow-up question</h3>
        <button class="close-btn" @click="closeModal" aria-label="Close">×</button>
      </div>

      <div class="followup-context">
        <p><strong>Document:</strong> {{ filename || '—' }}</p>
        <p><strong>Checklist item:</strong> {{ result.item_text }}</p>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="loadingMessages" class="empty-state">Loading conversation...</div>
        <div v-else-if="messages.length === 0" class="empty-state">
          Ask your first follow-up question for this checklist item.
        </div>
        <div
          v-for="(message, index) in messages"
          :key="`message-${index}`"
          :class="[
            'message-bubble',
            message.role === 'user' ? 'message-user' : 'message-assistant',
            statusClass(message)
          ]"
        >
          <div class="message-role">{{ message.role === 'user' ? 'You' : 'Assistant' }}</div>
          <div v-if="message.role === 'assistant' && message.status" class="status-pill" :class="statusPillClass(message.status)">
            {{ statusLabel(message.status) }}
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div v-if="message.created_at" class="message-time">{{ formatTime(message.created_at) }}</div>
        </div>
      </div>

      <div class="followup-input-row">
        <textarea
          v-model.trim="draftQuestion"
          class="followup-textarea"
          rows="3"
          :disabled="sending"
          placeholder="Ask a follow-up question..."
          @keydown.enter.exact.prevent="sendQuestion"
        />
        <button class="send-btn" :disabled="sending || !draftQuestion" @click="sendQuestion">
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
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
      sending: false
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
        this.messages.push({
          role: 'assistant',
          content: data.answer || 'No response received.',
          status: data.status || null,
          created_at: new Date().toISOString()
        })
        this.$nextTick(this.scrollToBottom)
      } catch (error) {
        console.error('Failed to send follow-up question:', error)
        const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || 'Failed to send follow-up question.'
        this.$toast.error(message)
      } finally {
        this.sending = false
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
    }
  }
}
</script>

<style scoped>
.followup-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.followup-modal {
  width: min(900px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
  overflow: hidden;
}

.followup-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.followup-modal-header h3 {
  margin: 0;
  color: #111827;
}

.close-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.followup-context {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  color: #334155;
}

.followup-context p {
  margin: 4px 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #ffffff;
}

.empty-state {
  color: #64748b;
  text-align: center;
  padding: 24px 8px;
}

.message-bubble {
  max-width: 85%;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  word-break: break-word;
}

.message-user {
  margin-left: auto;
  background: #e0f2fe;
}

.message-assistant {
  margin-right: auto;
  background: #f1f5f9;
}

.assistant-status-yes {
  border: 1px solid #86efac;
  background: #f0fdf4;
}

.assistant-status-no {
  border: 1px solid #fca5a5;
  background: #fef2f2;
}

.assistant-status-partial {
  border: 1px solid #fcd34d;
  background: #fffbeb;
}

.status-pill {
  display: inline-block;
  margin-bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
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

.message-role {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #334155;
}

.message-content {
  white-space: pre-wrap;
  color: #0f172a;
}

.message-time {
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
}

.followup-input-row {
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  background: #ffffff;
}

.followup-textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px;
  resize: vertical;
  font-family: inherit;
}

.send-btn {
  align-self: end;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  background: #10a37f;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dark-theme .followup-modal {
  background: #343541;
}

.dark-theme .followup-modal-header,
.dark-theme .followup-input-row,
.dark-theme .followup-context {
  border-color: #4d4d4f;
}

.dark-theme .followup-modal-header h3,
.dark-theme .message-content {
  color: #e5e7eb;
}

.dark-theme .messages-container {
  background: #343541;
}

.dark-theme .message-assistant {
  background: #3f4044;
}

.dark-theme .assistant-status-yes {
  border-color: #14532d;
  background: #1b3327;
}

.dark-theme .assistant-status-no {
  border-color: #7f1d1d;
  background: #352022;
}

.dark-theme .assistant-status-partial {
  border-color: #78350f;
  background: #332c1f;
}

.dark-theme .message-user {
  background: #1f3b4d;
}

.dark-theme .message-role,
.dark-theme .message-time,
.dark-theme .followup-context,
.dark-theme .empty-state {
  color: #cbd5e1;
}

.dark-theme .followup-textarea {
  background: #2d2d30;
  color: #e5e7eb;
  border-color: #4d4d4f;
}
</style>
