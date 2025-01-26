const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

// using parseUnits convert ether value to wei
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

//Sample data for listing an item
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE =
  "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

// declare 3 var: ethcommerce = instance of smart contract, deployer and buyer = eth account signers
describe("Ethcommerce", () => {
  let ethcommerce;
  let deployer, buyer;

  //   run before ea test - spin up a new instance of the contract & deploy
  beforeEach(async () => {
    //setup accounts
    [deployer, buyer] = await ethers.getSigners();

    // deploy contract
    const Ethcommerce = await ethers.getContractFactory("Ethcommerce");
    ethcommerce = await Ethcommerce.deploy();
  });
});

describe("Deployment", () => {
  it("Sets the owner", async () => {
    expect(await ethcommerce.owner()).to.equal(deployer.address);
  });
});

describe("Listing", () => {
  let transaction;

  beforeEach(async () => {
    //list a item
    transaction = await ethcommerce
      .connect(deployer)
      .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
    await transaction.wait();
  });

  it("Returns item attributes", async () => {
    const item = await ethcommerce.items(ID);

    expect(item.id).to.equal(ID);
    expect(item.name).to.equal(NAME);
    expect(item.category).to.equal(CATEGORY);
    expect(item.image).to.equal(IMAGE);
    expect(item.cost).to.equal(COST);
    expect(item.rating).to.equal(RATING);
    expect(item.stock).to.equal(STOCK);
  });

  it("Emits List event", () => {
    expect(transaction).to.emit(ethcommerce, "List");
  });

  //Buying
  describe("Buying", () => {
    let transaction;
    beforeEach(async () => {
      //list a item
      transaction = await ethcommerce
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      //buy a item
      transaction = await ethcommerce.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();
    });

    it("Updates buyers order count", async () => {
      const result = await ethcommerce.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the order", async () => {
      const order = await ethcommerce.orders(buyer.address, 1);

      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to, equal(NAME);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(ethcommerce.getAddress());
      expect(result).to.equal(COST);
    });
    it("Emits Buy event", () => {
      expect(transaction).to.emit(ethcommerce, "Buy");
    });
  });
});
