require('dotenv').config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
import 'hardhat-ignore-warnings';

const { APP_DEV_PK, APP_USR_PK, TOKEN, API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  namedAccounts: {
    app_developer: {
      default: 0,
    },
    end_user: {
      default: 1,
    },
  },
  networks: {
    ten: {
      deploy: [ "scripts/" ],
      chainId: 443,
      url: `https://testnet.ten.xyz/v1/${TOKEN}`,
      gasPrice: 2000000000,
      accounts: [ `0x${APP_DEV_PK}`, `0x${APP_USR_PK}` ]
    },
    sepolia: {
      deploy: [ "scripts/" ],
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      gasPrice: 34254316565,
      accounts: [ `0x${APP_DEV_PK}`, `0x${APP_USR_PK}` ]
    },
    hardhat: {
      deploy: [ "scripts/" ],
      chainId: 1337,
      accounts: [
        { "privateKey": `0x${APP_DEV_PK}`,  "balance": "174165200000000000" },
        { "privateKey" : `0x${APP_USR_PK}`, "balance": "174165200000000000" }
      ]
    }
  },
};

export default config;
