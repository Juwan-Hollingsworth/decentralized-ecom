const hre = require("hardhat");

const { items } = require("../src/items.json");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

async function main() {
  //setup accounts
  const [deployer] = await ethers.getSigners();
  //deploy ethcommerce
  const Ethcommerce = await hre.ethers.getContractFactory("Ethcommerce");
  const ethcommerce = await Ethcommerce.deploy();
  await ethcommerce.waitForDeployment();
  const address = await ethcommerce.getAddress();
  console.log(`Deployed Ethcommerce Contract at: ${address}\n`);
  //listing items...
}
