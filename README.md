# Example Number Guessing Game (v2)

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Create Environment 
*Assumes a registered viewing key with Ten.*

Create a file `.env` in the project root with the below contents, where `USER_KEY` is supplied when registering 
your VK's and `PRIVATE_KEY` should be the private key for the account that is registered with Ten. Do not share your
private key with anybody! For more details please find all the registration steps in https://docs.obscu.ro/.

```
USER_KEY = <token> 
PRIVATE_KEY = <private key>
```

### Compile for Development

```sh
npm run dev
```

### Compile for Production

```sh
npm run build
```

### Deploy Contract

```sh
npx hardhat --network ten deploy
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
