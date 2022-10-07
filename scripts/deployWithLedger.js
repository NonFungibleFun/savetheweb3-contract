const ethProvider = require("eth-provider"); // eth-provider is a simple EIP-1193 provider

async function main() {
  // Create a Frame connection
  const frame = ethProvider("frame");

  // Use `getDeployTransaction` instead of `deploy` to return deployment data
  const Sav3 = await ethers.getContractFactory("SaveTheWeb3");
  const tx = await Sav3.getDeployTransaction(5, 5000);
  // Set `tx.from` to current Frame account
  tx.from = (await frame.request({ method: "eth_requestAccounts" }))[0];
  // Sign and send the transaction using Frame
  const response = await frame.request({
    method: "eth_sendTransaction",
    params: [tx],
  });

  console.log(JSON.stringify(response));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
