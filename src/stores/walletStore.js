import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import { markRaw } from 'vue'

export const useWalletStore = defineStore({
  id: 'wallet',
  state: () => ({
    provider: null,
    signer: null,
    address: null,
    maxGuess: 0
  }),
  actions: {
    setProvider(provider) {
      this.provider = markRaw(provider)
      this.signer = markRaw(new ethers.providers.Web3Provider(provider).getSigner())
      this.maxGuess = 0
    },
    setAddress(address) {
      this.address = address
    }
  }
})
