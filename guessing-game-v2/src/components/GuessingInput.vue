<template>
  <div class="guessing-game">
    <div>
      <el-alert
        title="Error"
        type="error"
        :closable="false"
        :show-icon="true"
        :center="true"
        v-if="errorMessage"
        @click="clearErrorMessage"
      >
        <span v-html="errorMessage"></span>
      </el-alert>
    </div>
    <h1>Guessing Game</h1>
    <p>Guess the secret number</p>
    <p>Take the pool money</p>
    <el-input
      label="Guess"
      :disabled="submitDisabled"
      v-model="guess"
      placeholder="Enter your guess 1-1000"
      :input-style="{ color: '#00FF00', borderColor: '#00FF00', backgroundColor: '#2E2E2E' }"
    >
    </el-input>
    <el-button :disabled="submitDisabled" type="primary" @click="submitGuess">Submit</el-button>
  </div>
</template>

<script>
import Web3Service from '@/lib/web3service.js'
import { useWalletStore } from '@/stores/walletStore'
import { useMessageStore } from '@/stores/messageStore'

export default {
  name: 'MainPage',
  data() {
    return {
      guess: '',
      submitDisabled: false
    }
  },

  computed: {
    errorMessage() {
      const messageStore = useMessageStore()
      return messageStore.errorMessage
    }
  },

  methods: {
    async submitGuess() {
      this.submitDisabled = true
      try {
        const messageStore = useMessageStore()
        const walletStore = useWalletStore()

        if (!walletStore.signer) {
          messageStore.addMessage('Not connected with Metamask...')
          this.submitDisabled = false
          return
        }
        const web3Service = new Web3Service(walletStore.signer)
        await web3Service.submitGuess(this.guess)
      } catch (err) {
        console.error('Error:', err.message)
      }
      this.submitDisabled = false
    },

    clearErrorMessage() {
      const messageStore = useMessageStore()
      messageStore.clearErrorMessage()
    }
  }
}
</script>
<style scoped>
.guessing-game {
  font-family: 'Orbitron', sans-serif;
  background-color: #1c1c1c;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  width: 400px; /* Increased the width */
  box-shadow: 0 4px 8px rgba(0, 255, 0, 0.3);
  margin: 0 auto; /* Center the component */
}

h1,
p {
  color: #00ff00;
  margin: 0;
}

.el-input,
.el-button {
  margin-top: 25px;
  width: 100%;
}

.el-input__inner {
  background-color: #2e2e2e;
  color: #00ff00;
  border-color: #00ff00;
  font-size: 24px; /* Larger font size */
  padding: 10px 15px; /* Larger padding */
}

.el-input__inner:focus {
  box-shadow: 0 0 15px #00ff00; /* Glow effect when input is focused */
  animation: pulse 1.5s infinite;
}

:deep(.el-input__wrapper) {
  padding: 0 !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 15px #00ff00;
  }
  50% {
    box-shadow: 0 0 20px #33ff33, 0 0 30px #33ff33;
  }
  100% {
    box-shadow: 0 0 15px #00ff00;
  }
}

.el-button {
  background-color: #00ff00;
  color: #0f0f0f;
  border: none;
  font-size: 18px; /* Larger font size */
  transition: transform 0.3s, background-color 0.3s; /* Transition effect for hover */
}

.el-button:hover {
  background-color: #33ff33;
  transform: scale(1.05); /* Slight zoom effect on hover */
}

.el-button:disabled {
  background-color: #2e2e2e;
  color: #666;
  cursor: not-allowed;
}
</style>
