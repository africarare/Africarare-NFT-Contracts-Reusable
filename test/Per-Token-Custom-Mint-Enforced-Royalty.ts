import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("PerTokenCustomMintEnforcedRoyalty", () => {
  let nft: Contract;
  let superadmin: Signer;
  let admin: Signer;
  let user: Signer;
  let tokenId: number;

  beforeEach(async () => {
    const PerTokenCustomMintEnforcedRoyalty = await ethers.getContractFactory(
      "PerTokenCustomMintEnforcedRoyalty"
    );
    [admin, user] = await ethers.getSigners();

    nft = await PerTokenCustomMintEnforcedRoyalty.deploy();
    await nft.deployed();
  });

  describe("mint", () => {
    it("should allow superadmin to mint a new token", async () => {
      const tokenURI = "https://example.com/token/1";
      await nft.connect(admin).mint(tokenURI);

      const owner = await nft.ownerOf(0);
      const tokenURIStored = await nft.tokenURI(0);

      expect(owner).to.equal(await admin?.getAddress());
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
      await nft.connect(admin).mint(tokenURI);
      tokenId = 0;
    });

    it("should allow superadmin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await nft.connect(admin).updateTokenURI(tokenId, newTokenURI);

      const tokenURIStored = await nft.tokenURI(tokenId);
      expect(tokenURIStored).to.equal(newTokenURI);
    });

    it("should allow admin to update the token URI", async () => {
      const newTokenURI = "https://example.com/token/updated";
      await nft.connect(admin).setAdmin(await admin?.getAddress()); // Assign admin role to admin address
      await nft.connect(admin).updateTokenURI(tokenId, newTokenURI);

      const tokenURIStored = await nft.tokenURI(tokenId);
      expect(tokenURIStored).to.equal(newTokenURI);
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
        nft.connect(admin).updateTokenURI(nonExistentTokenId, newTokenURI)
      ).to.be.revertedWith("Token does not exist");
    });
  });
});
