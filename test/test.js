const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils;

const startSale = async (sav3, setter) => {
  const now = Math.round(Date.now() / 1000);
  await sav3[setter](now - 1000, now + 1000);
}

const endSale = async (sav3, setter) => {
  const now = Math.round(Date.now() / 1000);
  await sav3[setter](now - 2000, now - 1000);
}

describe("Sav3", function () {
  const createSav3 = async () => {
    const Sav3 = await ethers.getContractFactory("Sav3");
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();
    return sav3;
  }

  it('should set initial values', async function () {
    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();
    expect(await sav3.isWhitelistSaleOn()).to.equal(false);
    expect(await sav3.isPublicSaleOn()).to.equal(false);
  });

  it("should be paused right after it is deployed", async function () {
    const Sav3 = await ethers.getContractFactory("Sav3");
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    expect(await sav3.paused()).to.equal(true);
    await sav3.unpause();
    expect(await sav3.paused()).to.equal(false);
  });

  it('should disallow to exceed the max mint count for presale', async function () {
    const accounts = await hre.ethers.getSigners();
    const preSaleWhitelisted = accounts.slice(0, 5)
    const notPreSaleWhitelisted = accounts.slice(5, 10)
    const leaves = preSaleWhitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setPreSalePrice(30000)
    expect(await sav3.preSalePrice()).to.equal(30000);

    await startSale(sav3, 'setPreSaleTime');
    expect(await sav3.isPreSaleOn()).to.equal(true);

    await sav3.setPreSaleMerkleRoot(merkleRoot);

    await sav3.unpause();

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(6, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("reached max mint count for presale");

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(3, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(3, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
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

    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setWhitelistPrice(30000)
    expect(await sav3.whitelistPrice()).to.equal(30000);

    await startSale(sav3, 'setWhitelistSaleTime');
    expect(await sav3.isWhitelistSaleOn()).to.equal(true);

    await sav3.setWhitelistMerkleRoot(merkleRoot);

    await sav3.unpause();

    await expect(sav3.connect(whitelisted[1]).whitelistMint(6, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith("reached max mint count for whitelist");

    await expect(sav3.connect(whitelisted[1]).whitelistMint(3, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted

    await expect(sav3.connect(whitelisted[1]).whitelistMint(3, tree.getHexProof(keccak256(whitelisted[1].address)), {
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

    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setPreSalePrice(30000)
    expect(await sav3.preSalePrice()).to.equal(30000);

    await startSale(sav3, 'setPreSaleTime');
    expect(await sav3.isPreSaleOn()).to.equal(true);

    await sav3.setPreSaleMerkleRoot(merkleRoot);

    await sav3.unpause();

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(2, tree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('70000', 'wei'),
    })).not.to.be.reverted;

    await expect(sav3.connect(notPreSaleWhitelisted[1]).preSaleMint(2, tree.getHexProof(keccak256(notPreSaleWhitelisted[1].address)), {
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

    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setWhitelistPrice(50000)
    expect(await sav3.whitelistPrice()).to.equal(50000);

    await startSale(sav3, 'setWhitelistSaleTime');
    expect(await sav3.isWhitelistSaleOn()).to.equal(true);

    await sav3.setWhitelistMerkleRoot(merkleRoot);

    await sav3.unpause();

    await expect(sav3.connect(whitelisted[1]).whitelistMint(2, tree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('110000', 'wei'),
    })).not.to.be.reverted;

    await expect(sav3.connect(notWhitelisted[1]).whitelistMint(2, tree.getHexProof(keccak256(notWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('110000', 'wei'),
    })).to.be.revertedWith('not eligible for whitelist mint');
  });

  it('should work with public sale', async function () {
    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setPublicPrice(50000)
    expect(await sav3.publicPrice()).to.equal(50000);

    await startSale(sav3, 'setPublicSaleTime');
    expect(await sav3.isPublicSaleOn()).to.equal(true);

    await sav3.unpause();

    await expect(sav3.publicMint(50, {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).not.to.be.reverted;
  });

  it('can\'t minted greater than total supply', async function () {
    const [account] = await hre.ethers.getSigners(100);
    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();

    await sav3.setPublicPrice(50000)
    expect(await sav3.publicPrice()).to.equal(50000);

    await startSale(sav3, 'setPublicSaleTime');
    expect(await sav3.isPublicSaleOn()).to.equal(true);

    await sav3.unpause();

    for (let i = 0; i < 100; i++) {
      let wallet = ethers.Wallet.createRandom();
      wallet = wallet.connect(ethers.provider);
      await account.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") });

      await expect(sav3.connect(wallet).publicMint(50, {
        value: ethers.utils.parseUnits('25000000', 'wei'),

      })).not.to.be.reverted;
    }

    await expect(sav3.publicMint(1, {
      value: ethers.utils.parseUnits('25000000', 'wei'),
    })).to.be.revertedWith('reached max supply');
  });

  describe('preSaleTime', () => {
    describe('get', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.getPreSaleTime).to.be.a('function');
      })

      it('should return pair', async () => {
        const sav3 = await createSav3();
        const mintTime = await sav3.getPreSaleTime();
        expect(mintTime).to.be.an('array');
      });

      it('should return setted pair', async () => {
        const sav3 = await createSav3();
        await sav3.setPreSaleTime(100, 200);
        expect(await sav3.getPreSaleTime()).to.be.eql([
          ethers.BigNumber.from(100), ethers.BigNumber.from(200)]);
      });
    });

    describe('set', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.setPreSaleTime).to.be.a('function');
      });

      it('should accept two numbers', async () => {
        const sav3 = await createSav3();
        await sav3.setPreSaleTime(1, 2);
      });
    });
  });

  describe('whitelistSaleTime', () => {
    describe('get', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.getWhitelistSaleTime).to.be.a('function');
      })

      it('should return pair', async () => {
        const sav3 = await createSav3();
        const mintTime = await sav3.getWhitelistSaleTime();
        expect(mintTime).to.be.an('array');
      });

      it('should return setted pair', async () => {
        const sav3 = await createSav3();
        await sav3.setWhitelistSaleTime(100, 200);
        expect(await sav3.getWhitelistSaleTime()).to.be.eql([
          ethers.BigNumber.from(100), ethers.BigNumber.from(200)]);
      });
    });

    describe('set', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.setWhitelistSaleTime).to.be.a('function');
      });

      it('should accept two numbers', async () => {
        const sav3 = await createSav3();
        await sav3.setWhitelistSaleTime(1, 2);
      });
    });
  });

  describe('publicSaleTime', () => {
    describe('get', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.getPublicSaleTime).to.be.a('function');
      })

      it('should return pair', async () => {
        const sav3 = await createSav3();
        const mintTime = await sav3.getPublicSaleTime();
        expect(mintTime).to.be.an('array');
      });

      it('should return setted pair', async () => {
        const sav3 = await createSav3();
        await sav3.setPublicSaleTime(100, 200);
        expect(await sav3.getPublicSaleTime()).to.be.eql([
          ethers.BigNumber.from(100), ethers.BigNumber.from(200)]);
      });
    });

    describe('set', () => {
      it('should exist', async () => {
        const sav3 = await createSav3();
        expect(sav3.setPublicSaleTime).to.be.a('function');
      });

      it('should accept two numbers', async () => {
        const sav3 = await createSav3();
        await sav3.setPublicSaleTime(1, 2);
      });
    });
  });

  describe('isPreSaleOn', async () => {
    it('should return true only if time is met', async () => {
      const sav3 = await createSav3();
      expect(await sav3.isPreSaleOn()).to.be.false;

      const now = Math.round(Date.now() / 1000);
      await sav3.setPreSaleTime(now - 1000, now + 1000);
      expect(await sav3.isPreSaleOn()).to.be.true;

      await sav3.setPreSaleTime(now - 2000, now - 1000);
      expect(await sav3.isPreSaleOn()).to.be.false;
    });
  });
  describe('isWhitelistSaleOn', async () => {
    it('should return true only if time is met', async () => {
      const sav3 = await createSav3();
      expect(await sav3.isWhitelistSaleOn()).to.be.false;

      const now = Math.round(Date.now() / 1000);
      await sav3.setWhitelistSaleTime(now - 1000, now + 1000);
      expect(await sav3.isWhitelistSaleOn()).to.be.true;

      await sav3.setWhitelistSaleTime(now - 2000, now - 1000);
      expect(await sav3.isWhitelistSaleOn()).to.be.false;
    });
  });
  describe('isPublicSaleOn', async () => {
    it('should return true only if time is met', async () => {
      const sav3 = await createSav3();
      expect(await sav3.isPublicSaleOn()).to.be.false;

      const now = Math.round(Date.now() / 1000);
      await sav3.setPublicSaleTime(now - 1000, now + 1000);
      expect(await sav3.isPublicSaleOn()).to.be.true;

      await sav3.setPublicSaleTime(now - 2000, now - 1000);
      expect(await sav3.isPublicSaleOn()).to.be.false;
    });
  })

  describe('reserved', async () => {
    it('#1', async () => {
      const sav3 = await createSav3();
      const accounts = await hre.ethers.getSigners();
      await sav3.setReservedQuantity(3);
      expect(await sav3.reservedQuantity()).to.be.equal(3);
      await expect(sav3.reservedMint(4, accounts[2].address)).to.be.revertedWith('not enough reserved quantity')
      await expect(sav3.reservedMint(2, accounts[2].address)).not.to.be.reverted;
      await expect(sav3.reservedMint(2, accounts[2].address)).to.be.revertedWith('not enough reserved quantity');
      await expect(sav3.reservedMint(1, accounts[2].address)).not.to.be.reverted;

      expect(await sav3.usedReservedQuantity()).to.be.equal(3);
      await expect(sav3.setReservedQuantity(2)).to.be.revertedWith('reserved quantity is greater than used quantity');
      expect(await sav3.usedReservedQuantity()).to.be.equal(3);
      await expect(sav3.setReservedQuantity(5)).not.to.be.reverted;
      expect(await sav3.usedReservedQuantity()).to.be.equal(3);

      await expect(sav3.setReservedQuantity(5001)).to.be.revertedWith('reached max supply');
    });
  });

  it('#2', async () => {
    const sav3 = await createSav3();
    const accounts = await hre.ethers.getSigners();

    await sav3.unpause();
    await startSale(sav3, 'setPublicSaleTime');
    await sav3.setPublicPrice(67_000_000_000_000_000n);
    await sav3.setReservedQuantity(4999);

    await expect(sav3.connect(accounts[1]).publicMint(2, {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).to.be.revertedWith('reached max supply');


    await expect(sav3.connect(accounts[1]).publicMint(1, {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).not.to.be.reverted

    await sav3.setReservedQuantity(4950);
    
    await expect(sav3.connect(accounts[1]).publicMint(50, {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).to.be.revertedWith('reached max supply');

    await sav3.reservedMint(50, accounts[2].address);

    expect(await sav3.usedReservedQuantity()).to.be.equal(50);
        
    await expect(sav3.connect(accounts[1]).publicMint(50, {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).to.be.revertedWith('reached max supply');

    await expect(sav3.connect(accounts[1]).publicMint(49, {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).not.to.be.reverted;
  });
});


//  67_000_000_000_000_000 wei
//  89_000_000_000_000_000 wei
// 110_000_000_000_000_000 wei
describe('full scenario', () => {
  it('#1', async () => {
    const Sav3 = await ethers.getContractFactory('Sav3');
    const sav3 = await Sav3.deploy(100, 5000);
    await sav3.deployed();
    await sav3.setPreSalePrice(67_000_000_000_000_000n);
    expect(await sav3.preSalePrice()).to.equal(67_000_000_000_000_000n);
    await sav3.setWhitelistPrice(89_000_000_000_000_000n);
    expect(await sav3.whitelistPrice()).to.equal(89_000_000_000_000_000n);
    await sav3.setPublicPrice(110_000_000_000_000_000n);
    expect(await sav3.publicPrice()).to.equal(110_000_000_000_000_000n);

    const accounts = await hre.ethers.getSigners();
    const preSaleWhitelisted = accounts.slice(10, 15)

    const whitelisted = accounts.slice(0, 5)
    const notWhitelisted = accounts.slice(5, 10);

    const preSaleLeaves = preSaleWhitelisted.map(account => keccak256(account.address))
    const preSaleTree = new MerkleTree(preSaleLeaves, keccak256, { sort: true })
    const preSaleMerkleRoot = preSaleTree.getHexRoot()
    await sav3.setPreSaleMerkleRoot(preSaleMerkleRoot);

    const whitelistedLeaves = whitelisted.map(account => keccak256(account.address))
    const whitelistedTree = new MerkleTree(whitelistedLeaves, keccak256, { sort: true })
    const whitelistedMerkleRoot = whitelistedTree.getHexRoot()
    await sav3.setWhitelistMerkleRoot(whitelistedMerkleRoot);

    await sav3.unpause();

    await startSale(sav3, 'setPreSaleTime');
    expect(await sav3.isPreSaleOn()).to.equal(true);

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(2, preSaleTree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('700000000000000000', 'wei'),
    })).not.to.be.reverted;

    await endSale(sav3, 'setPreSaleTime');
    expect(await sav3.isPreSaleOn()).to.equal(false);

    await expect(sav3.connect(preSaleWhitelisted[1]).preSaleMint(2, preSaleTree.getHexProof(keccak256(preSaleWhitelisted[1].address)), {
      value: ethers.utils.parseUnits('700000000000000000', 'wei'),
    })).to.be.revertedWith('presale has not begun yet');

    await startSale(sav3, 'setWhitelistSaleTime');
    expect(await sav3.isWhitelistSaleOn()).to.equal(true);

    await expect(sav3.connect(whitelisted[1]).whitelistMint(2, whitelistedTree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).not.to.be.reverted;

    await endSale(sav3, 'setWhitelistSaleTime');
    expect(await sav3.isWhitelistSaleOn()).to.equal(false);

    await expect(sav3.connect(whitelisted[1]).whitelistMint(2, whitelistedTree.getHexProof(keccak256(whitelisted[1].address)), {
      value: ethers.utils.parseUnits('9000000000000000000', 'wei'),
    })).to.be.revertedWith('whitelist sale has not begun yet')

    await startSale(sav3, 'setPublicSaleTime');
    expect(await sav3.isPublicSaleOn()).to.equal(true);

    await expect(sav3.connect(notWhitelisted[1]).publicMint(2, {
      value: ethers.utils.parseUnits('1150000000000000000', 'wei'),
    })).not.to.be.reverted;

    await endSale(sav3, 'setPublicSaleTime');
    expect(await sav3.isPublicSaleOn()).to.equal(false);

    await expect(sav3.connect(notWhitelisted[1]).publicMint(2, {
      value: ethers.utils.parseUnits('1150000000000000000', 'wei'),
    })).to.be.revertedWith('public sale has not started yet');
  })
});
