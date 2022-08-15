# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/deploy.js
npx hardhat help
```

```
// to deploy to testnet
npx hardhat run --network goerli scripts/deploy.js
npx hardhat verify --network goerli <<DEPLOYED_CONTRACT_ADDRESS>> 10 5000
```
