require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const dotenv = require('dotenv');
dotenv.config()
const TEST_ALCHEMY_API_KEY = process.env.TEST_ALCHEMY_API_KEY;
const MAIN_ALCHEMY_API_KEY = process.env.MAIN_ALCHEMY_API_KEY;

const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.15",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${TEST_ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemyapi.io/v2/${MAIN_ALCHEMY_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.TEST_ETHERSCAN_API_KEY,
      mainnet: process.env.MAIN_ETHERSCAN_API_KEY,
    }
  }
};
