import { ethers } from 'ethers'
import { useMessageStore } from '@/stores/messageStore'
import GuessingGameJson from '@/assets/contract/artifacts/contracts/GuessingGame.sol/GuessingGame.json'
import ContractAddress from '@/assets/contract/address.json'
import Common from './common'
import { trackEvent } from './utils'

export default class Web3Service {
  constructor(signer) {
    this.contract = new ethers.Contract(ContractAddress.address, GuessingGameJson.abi, signer)
    this.signer = signer
  }

  async submitGuess(guessValue) {
    const guessFee = ethers.utils.parseEther(Common.GUESS_COST)
    const maxGuess = await this.contract.MAX_GUESS()

    const minimumBalance = ethers.utils.parseEther(Common.GUESS_COST)
    const messageStore = useMessageStore()

    messageStore.addMessage('Issuing Guess...')

    try {
      if (+guessValue > +(await maxGuess.toString())) {
        messageStore.addMessage(`Guess value is too high. You can only guess up to ${maxGuess}.`)
        return
      }
      // Check balance
      const balance = await this.signer.getBalance()
      if (balance.lt(minimumBalance)) {
        messageStore.addMessage(
          `Insufficient balance. You need at least ${Common.GUESS_COST} ETH to submit a guess.`
        )
        return
      }
      const submitTx = await this.contract.guess(guessValue, { value: guessFee })
      const receipt = await submitTx.wait()
      messageStore.addMessage('Issued Guess tx: ' + receipt.transactionHash)
      if (receipt.events[0].args.success) {
        trackEvent('guess_success', { value: guessValue })
        messageStore.addMessage(
          `[GuessingGame Contract] ${guessValue} was the right answer ! You won!`
        )
      } else {
        messageStore.addMessage(
          `[GuessingGame Contract] ${guessValue} was not the right answer. Try again...`
        )
      }
    } catch (e) {
      if (e.reason) {
        messageStore.addMessage('Failed to issue Guess - ' + e.reason + ' ...')
        return
      }
      messageStore.addMessage(
        'Failed to issue Guess - unexpected error occurred, check the console logs...'
      )
      console.log(e)
    }
  }
}
