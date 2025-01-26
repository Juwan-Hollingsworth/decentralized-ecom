const hre = require("hardhat");

const { items } = require("../src/items.json");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

async function main() {
  // Setup accounts
  const [deployer] = await ethers.getSigners();

  // Deploy Ethcommerce
  const Ethcommerce = await hre.ethers.getContractFactory("Ethcommerce");
  const ethcommerce = await Ethcommerce.deploy();
  await ethcommerce.waitForDeployment();
  const address = await ethcommerce.getAddress();
  console.log(`Deployed Ethcommerce Contract at: ${address}\n`);

  // Listing items...
  for (let i = 0; i < items.length; i++) {
    const transaction = await ethcommerce
      .connect(deployer)
      .list(
        items[i].id,
        items[i].name,
        items[i].category,
        items[i].image,
        tokens(items[i].price),
        items[i].rating,
        items[i].stock
      );

    await transaction.wait();

    console.log(`Listed item ${items[i].id}: ${items[i].name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
