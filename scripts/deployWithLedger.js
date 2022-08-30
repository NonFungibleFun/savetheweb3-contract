// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const ethProvider = require("eth-provider"); // eth-provider is a simple EIP-1193 provider

// // Create a Frame connection
// const ethProvider = require('eth-provider') // eth-provider is a simple EIP-1193 provider
// const frame = ethProvider('frame') // Connect to Frame

// // Use `getDeployTransaction` instead of `deploy` to return deployment data
// const Greeter = await ethers.getContractFactory('Greeter')
// const tx = await Greeter.getDeployTransaction()

// // Set `tx.from` to current Frame account
// tx.from = (await frame.request({ method: 'eth_requestAccounts' }))[0]

// // Sign and send the transaction using Frame
// await frame.request({ method: 'eth_sendTransaction', params: [tx] })

async function main() {
  // Create a Frame connection
  
  const frame = ethProvider("frame"); // Connect to Frame

  // Use `getDeployTransaction` instead of `deploy` to return deployment data
  const Greeter = await ethers.getContractFactory("SaveTheWeb3");
  const tx = await Greeter.getDeployTransaction(5, 5000);
  // Set `tx.from` to current Frame account
  tx.from = (await frame.request({ method: "eth_requestAccounts" }))[0];
  // Sign and send the transaction using Frame
  await frame.request({ method: "eth_sendTransaction", params: [tx] });

  // ledger connect

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const ledger = await new LedgerSigner(hre.ethers.provider);
  // const Sav3 = await hre.ethers.getContractFactory("Sav3");

  // console.log(ledger.address);

  // const SignedSav3 = await Sav3.connect(ledger);

  // console.log(1, SignedSav3, 1);

  // const sav3 = await SignedSav3.deploy(10, 5000);

  // console.log(2, sav3, 2);

  // await sav3.deployed();
  // console.log("Sav3 deployed to:", sav3.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
