require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const dotenv = require('dotenv');
dotenv.config()

const GOERLI_ALCHEMY_API_KEY = process.env.GOERLI_ALCHEMY_API_KEY;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const GOERLI_ETHERSCAN_API_KEY = process.env.GOERLI_ETHERSCAN_API_KEY;

const RINKEBY_ALCHEMY_API_KEY = process.env.RINKEBY_ALCHEMY_API_KEY;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const RINKEBY_ETHERSCAN_API_KEY = process.env.RINKEBY_ETHERSCAN_API_KEY;

const MAINNET_ALCHEMY_API_KEY = process.env.MAINNET_ALCHEMY_API_KEY;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;
const MAINNET_ETHERSCAN_API_KEY = process.env.MAINNET_ETHERSCAN_API_KEY;

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
  solidity: "0.8.16",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${GOERLI_ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${RINKEBY_ALCHEMY_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${MAINNET_ALCHEMY_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      goerli: GOERLI_ETHERSCAN_API_KEY,
      rinkeby: RINKEBY_ETHERSCAN_API_KEY,
      mainnet: MAINNET_ETHERSCAN_API_KEY,
    }
  }
};
