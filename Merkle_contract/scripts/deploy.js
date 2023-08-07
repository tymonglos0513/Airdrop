// const hre = require("hardhat");
// const { ethers } = require("ethers");
async function main() {
    const [deployer] = await ethers.getSigners();

    // console.log("=== Deploying MerkleChild ===");
    // const merkleChild = await ethers.deployContract("MerkleChild", ["0xCFbdcb100D7324b51AEFef7b08d50e39e750B9Bd", "0x9e1Cb25d4D2b49234c8143a5941FC2423F58235A", "0x9e1Cb25d4D2b49234c8143a5941FC2423F58235A", 1690692840, 1693371240, 216]);
    // console.log("\nMerkleChild address:", await merkleChild.address);

    console.log("=== Deploying MerkleFactory ===");
    const merkleFactory = await ethers.deployContract("MerkleFactory", ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"]);
    console.log("\nMerkleFactory address:", await merkleFactory.address);
  
    console.log("\n=== Deploying contracts with the account:", deployer.address);
    const token = await ethers.deployContract("Token", ["Sky", "sky"]);
    console.log("\nToken address:", await token.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });