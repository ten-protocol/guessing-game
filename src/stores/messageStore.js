import { defineStore } from 'pinia'

export const useMessageStore = defineStore({
  id: 'messageStore',
  state: () => ({
    messages: [],
    errorMessage: ''
  }),
  actions: {
    addMessage(text) {
      this.messages.push({
        id: Date.now(),
        text: text
      })
    },
    addErrorMessage(text) {
      this.errorMessage = text
    },
    clearErrorMessage() {
      this.errorMessage = ''
    }
  }
})
