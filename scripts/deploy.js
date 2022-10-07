const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Sav3 = await hre.ethers.getContractFactory("SaveTheWeb3");
  const sav3 = await Sav3.deploy(5, 5000);

  await sav3.deployed();

  console.log("Sav3 deployed to:", sav3.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
