<script setup>
import MainPage from "@/components/GuessingInput.vue";
import MetaMaskConnectButton from "@/components/MetaMaskConnectButton.vue";
import MessageLog from "@/components/MessageLog.vue";
</script>

<template>
  <main class="center-content">
    <meta-mask-connect-button class="metamask-button">Connect To Metamask</meta-mask-connect-button>
    <MainPage />
    <MessageLog />
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap'); /* Add Orbitron font */

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* take the full height of the viewport */
  gap: 25px; /* spacing between flex items */
}
</style>
