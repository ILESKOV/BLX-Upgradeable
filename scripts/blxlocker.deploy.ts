import { ethers } from "hardhat";

async function main() {
  // We get the contract to deploy
  const BLXLocker = await ethers.getContractFactory("BLXLocker");

  // We deploy the contract
  const contract = await BLXLocker.deploy(/* ...args */);
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
