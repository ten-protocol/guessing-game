<template>
  <el-button @click="connectMetamask" size="large">
    <img src="@/assets/icons/icon_metamask.png" alt="Connect with wallet" class="metamask-icon" />
    {{ buttonText }}
  </el-button>
</template>

<script>
import detectEthereumProvider from '@metamask/detect-provider'
import { useWalletStore } from '@/stores/walletStore'
import { useMessageStore } from '@/stores/messageStore'
import { ref } from 'vue'
import Web3listener from '@/lib/web3listener'
import { trackEvent } from '../lib/utils'

export default {
  name: 'MetaMaskConnectButton',
  setup() {
    const walletStore = useWalletStore()
    const messageStore = useMessageStore()
    const buttonText = ref('Connect with MetaMask')

    async function connectMetamask() {
      const provider = await detectEthereumProvider()

      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' })
        if (chainId !== '0x1bb') {
          messageStore.addMessage(
            'Not connected to Ten ! Connect at <a href="https://testnet.ten.xyz/" target="_blank" rel="noopener noreferrer">https://testnet.ten.xyz/</a> '
          )
          return
        }

        // Request account access if needed
        const accounts = await provider.request({ method: 'eth_requestAccounts' })

        // Set provider and address in the store
        walletStore.setProvider(provider)
        walletStore.setAddress(accounts[0])

        trackEvent('connect_wallet', {
          value: accounts[0]
        })

        messageStore.addMessage('Connected to wallet ! Account: ' + accounts[0])
        buttonText.value = 'Connected!'

        new Web3listener(walletStore.signer, '0xe03D05a56d35D7c87Ea0578A27C5d4fdF1C81c63')
      } else {
        messageStore.addMessage('Please install MetaMask!')
      }
    }

    return {
      connectMetamask,
      buttonText
    }
  },
  async mounted() {
    const provider = await detectEthereumProvider()
    const messageStore = useMessageStore()
    const walletStore = useWalletStore()

    const chainId = await provider.request({ method: 'eth_chainId' })
    if (chainId !== '0x1bb') {
      messageStore.addMessage(
        'Not connected to Ten ! Connect at <a href="https://testnet.ten.xyz/" target="_blank" rel="noopener noreferrer">https://testnet.ten.xyz/</a> '
      )
      return
    }

    await provider
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length !== 0) {
          walletStore.setProvider(provider)
          walletStore.setAddress(accounts[0])
          messageStore.addMessage('Connected to wallet ! Account: ' + accounts[0])
          this.buttonText = 'Connected!'
          new Web3listener(walletStore.signer, '0xe03D05a56d35D7c87Ea0578A27C5d4fdF1C81c63')
        } else {
          messageStore.addMessage('No wallet connected...')
        }
      })
      .catch((error) => {
        console.error('Error checking MetaMask connection:', error)
      })
  }
}
</script>

<style scoped>
.metamask-icon {
  width: 24px; /* Set desired width */
  height: 24px; /* Set desired height */
  object-fit: cover; /* Ensure image content is not distorted */
  margin-right: 8px; /* Optional space between the icon and the text */
}
</style>