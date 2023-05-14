import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("PerTokenCustomMint", () => {
  let nft: Contract;
  let superadmin: Signer;
  let admin: Signer;
  let user: Signer;
  let tokenId: number;

  beforeEach(async () => {
    const PerTokenCustomMint = await ethers.getContractFactory(
      "PerTokenCustomMint"
    );
    [superadmin, admin, user] = await ethers.getSigners();

    nft = await PerTokenCustomMint.deploy();
    await nft.deployed();
  });

  describe("mint", () => {
    it("should allow superadmin to mint a new token", async () => {
      const tokenURI = "https://example.com/token/1";
      await nft.connect(superadmin).mint(tokenURI);

      const owner = await nft.ownerOf(0);
      const tokenURIStored = await nft.tokenURI(0);

      expect(owner).to.equal(await superadmin?.getAddress());
      expect(tokenURIStored).to.equal(tokenURI);
    });

    it("should not allow non-superadmin to mint a new token", async () => {
      const tokenURI = "https://example.com/token/1";
      await expect(nft.connect(user).mint(tokenURI)).to.be.revertedWith(
        "Caller is not a superadmin"
      );
    });
  });

  describe("updateTokenURI", () => {
    beforeEach(async () => {
      const tokenURI = "https://example.com/token/1";
      await nft.connect(superadmin).mint(tokenURI);
      tokenId = 0;
    });

    it("should allow superadmin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await nft.connect(superadmin).updateTokenURI(tokenId, newTokenURI);

      const tokenURIStored = await nft.tokenURI(tokenId);
      expect(tokenURIStored).to.equal(newTokenURI);
    });

    it("should allow admin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await nft.connect(superadmin).setAdmin(await admin?.getAddress()); // Assign admin role to admin address
      await nft.connect(admin).updateTokenURI(tokenId, newTokenURI);

      const tokenURIStored = await nft.tokenURI(tokenId);
      expect(tokenURIStored).to.equal(newTokenURI);
    });

    it("should not allow revoked admin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await nft.connect(superadmin).setAdmin(await admin?.getAddress()); // Assign admin role to admin address
      await nft.connect(superadmin).revokeAdmin();
      await expect(
        nft.connect(user).updateTokenURI(tokenId, newTokenURI)
      ).to.be.revertedWith("Caller is not a superadmin or admin");
    });

    it("should not allow non-superadmin or non-admin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await expect(
        nft.connect(user).updateTokenURI(tokenId, newTokenURI)
      ).to.be.revertedWith("Caller is not a superadmin or admin");
    });

    it("should revert if the token does not exist", async () => {
      const nonExistentTokenId = 1;
      const newTokenURI = "https://example.com/token/updated";
      await expect(
        nft.connect(superadmin).updateTokenURI(nonExistentTokenId, newTokenURI)
      ).to.be.revertedWith("Token does not exist");
    });
  });
});
