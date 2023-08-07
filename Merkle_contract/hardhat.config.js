/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
const SEPOLIA_PRIVATE_KEY="8d217558007e392100d90d382fe44079dce122ec4dbe3d671f7de29262151db9";
module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: `https://rpc.sepolia.org`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
