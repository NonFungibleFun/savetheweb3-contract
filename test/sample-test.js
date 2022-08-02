const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils;

describe("Sw3", function () {
  it('should set initial values', async function () {
    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();
    expect(await sw3.isWhitelistSaleOn()).to.equal(false);
    expect(await sw3.isPublicSaleOn()).to.equal(false);
  });

  it("should be paused right after it is deployed", async function () {
    const Sw3 = await ethers.getContractFactory("Sw3");
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    expect(await sw3.paused()).to.equal(true);
    await sw3.unpause();
    expect(await sw3.paused()).to.equal(false);
  });

  it('should disallow to exceed the max mint count for presale', async function () {
    const accounts = await hre.ethers.getSigners();
    const preSaleWhitelisted = accounts.slice(0, 5)
    const notPreSaleWhitelisted = accounts.slice(5, 10)
    const leaves = preSaleWhitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setPreSalePrice(30000)
    expect(await sw3.preSalePrice()).to.equal(30000);

    await sw3.setPreSaleMintStarted(true);
    expect(await sw3.isPreSaleOn()).to.equal(true);

    await sw3.setPreSaleMerkleRoot(merkleRoot);

    await sw3.unpause();

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(3, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("reached max mint count for presale");

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(1, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(1, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("already minted");
  });

  it('should disallow to exceed the max mint count for whitelist', async function () {
    const accounts = await hre.ethers.getSigners();
    const whitelisted = accounts.slice(0, 5)
    const notwhitelisted = accounts.slice(5, 10)
    const leaves = whitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setWhitelistPrice(30000)
    expect(await sw3.whitelistPrice()).to.equal(30000);

    await sw3.setWhitelistMintStarted(true);
    expect(await sw3.isWhitelistSaleOn()).to.equal(true);

    await sw3.setWhitelistMerkleRoot(merkleRoot);

    await sw3.unpause();

    await expect(sw3.connect(whitelisted[1]).whitelistMint(3, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("reached max mint count for whitelist");

    await expect(sw3.connect(whitelisted[1]).whitelistMint(1, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted

    await expect(sw3.connect(whitelisted[1]).whitelistMint(1, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("already minted");
  });


  it('should work with presale', async function () {
    const accounts = await hre.ethers.getSigners();
    const preSaleWhitelisted = accounts.slice(0, 5)
    const notPreSaleWhitelisted = accounts.slice(5, 10)
    const leaves = preSaleWhitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setPreSalePrice(30000)
    expect(await sw3.preSalePrice()).to.equal(30000);

    await sw3.setPreSaleMintStarted(true);
    expect(await sw3.isPreSaleOn()).to.equal(true);

    await sw3.setPreSaleMerkleRoot(merkleRoot);

    await sw3.unpause();

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(2, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('70000', 'wei'),
    })).not.to.be.reverted;

    await expect(sw3.connect(notPreSaleWhitelisted[1]).preSaleMint(2, tree.getHexProof(keccak256(notPreSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('70000', 'wei'),
    })).to.be.revertedWith('not eligible for presale mint')
  });

  it('should work with whitelist sale', async function () {
    const accounts = await hre.ethers.getSigners();
    const whitelisted = accounts.slice(0, 5)
    const notWhitelisted = accounts.slice(5, 10)
    const leaves = whitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setWhitelistPrice(50000)
    expect(await sw3.whitelistPrice()).to.equal(50000);

    await sw3.setWhitelistMintStarted(true);
    expect(await sw3.isWhitelistSaleOn()).to.equal(true);

    await sw3.setWhitelistMerkleRoot(merkleRoot);

    await sw3.unpause();

    await expect(sw3.connect(whitelisted[1]).whitelistMint(2, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('110000', 'wei'),
    })).not.to.be.reverted;

    await expect(sw3.connect(notWhitelisted[1]).whitelistMint(2, tree.getHexProof(keccak256(notWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('110000', 'wei'),
    })).to.be.revertedWith('not eligible for whitelist mint');
  });

  it('should work with public sale', async function () {
    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setPublicPrice(50000)
    expect(await sw3.publicPrice()).to.equal(50000);

    await sw3.setPublicMintStarted(true);
    expect(await sw3.isPublicSaleOn()).to.equal(true);

    await sw3.unpause();

    await expect(sw3.publicMint(50, {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted;
  });

  it('can\'t minted greater than total supply', async function () {
    const [account] = await hre.ethers.getSigners(100);
    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();

    await sw3.setPublicPrice(50000)
    expect(await sw3.publicPrice()).to.equal(50000);

    await sw3.setPublicMintStarted(true);
    expect(await sw3.isPublicSaleOn()).to.equal(true);

    await sw3.unpause();

    for (let i = 0; i < 100; i++) {
      let wallet = ethers.Wallet.createRandom();
      wallet = wallet.connect(ethers.provider);
      await account.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") });

      await expect(sw3.connect(wallet).publicMint(50, {
        value: ethers.utils.parseUnits('25000000', 'wei'),

      })).not.to.be.reverted;
    }

    await expect(sw3.publicMint(1, {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith('reached max supply');
  });
});


//  67_000_000_000_000_000 wei
//  89_000_000_000_000_000 wei
// 110_000_000_000_000_000 wei
describe('full scenario', () => {
  it('#1', async () => {
    const Sw3 = await ethers.getContractFactory('Sw3');
    const sw3 = await Sw3.deploy(100, 5000);
    await sw3.deployed();
    await sw3.setPreSalePrice(67_000_000_000_000_000n);
    expect(await sw3.preSalePrice()).to.equal(67_000_000_000_000_000n);
    await sw3.setWhitelistPrice(89_000_000_000_000_000n);
    expect(await sw3.whitelistPrice()).to.equal(89_000_000_000_000_000n);
    await sw3.setPublicPrice(110_000_000_000_000_000n);
    expect(await sw3.publicPrice()).to.equal(110_000_000_000_000_000n);

    const accounts = await hre.ethers.getSigners();
    const preSaleWhitelisted = accounts.slice(10, 15)

    const whitelisted = accounts.slice(0, 5)
    const notWhitelisted = accounts.slice(5, 10);

    const preSaleLeaves = preSaleWhitelisted.map(account => keccak256(account.address))
    const preSaleTree = new MerkleTree(preSaleLeaves, keccak256, { sort: true })
    const preSaleMerkleRoot = preSaleTree.getHexRoot()
    await sw3.setPreSaleMerkleRoot(preSaleMerkleRoot);

    const whitelistedLeaves = whitelisted.map(account => keccak256(account.address))
    const whitelistedTree = new MerkleTree(whitelistedLeaves, keccak256, { sort: true })
    const whitelistedMerkleRoot = whitelistedTree.getHexRoot()
    await sw3.setWhitelistMerkleRoot(whitelistedMerkleRoot);

    await sw3.unpause();

    await sw3.setPreSaleMintStarted(true);
    expect(await sw3.isPreSaleOn()).to.equal(true);

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(2, preSaleTree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('700000000000000000', 'wei'),
    })).not.to.be.reverted;

    await sw3.setPreSaleMintStarted(false);
    expect(await sw3.isPreSaleOn()).to.equal(false);

    await expect(sw3.connect(preSaleWhitelisted[1]).preSaleMint(2, preSaleTree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('700000000000000000', 'wei'),
    })).to.be.revertedWith('presale has not begun yet');

    await sw3.setWhitelistMintStarted(true);
    expect(await sw3.isWhitelistSaleOn()).to.equal(true);

    await expect(sw3.connect(whitelisted[1]).whitelistMint(2, whitelistedTree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).not.to.be.reverted;

    await sw3.setWhitelistMintStarted(false);
    expect(await sw3.isWhitelistSaleOn()).to.equal(false);

    await expect(sw3.connect(whitelisted[1]).whitelistMint(2, whitelistedTree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).to.be.revertedWith('whitelist sale has not begun yet')

    await sw3.setPublicMintStarted(true);
    expect(await sw3.isPublicSaleOn()).to.equal(true);

    await expect(sw3.connect(notWhitelisted[1]).publicMint(2, {
      value: ethers.utils.parseUnits('1150000000000000000', 'wei'),
    })).not.to.be.reverted;

    await sw3.setPublicMintStarted(false);
    expect(await sw3.isPublicSaleOn()).to.equal(false);

    await expect(sw3.connect(notWhitelisted[1]).publicMint(2, {
      value: ethers.utils.parseUnits('1150000000000000000', 'wei'),
    })).to.be.revertedWith('public sale has not started yet');
  })
});
