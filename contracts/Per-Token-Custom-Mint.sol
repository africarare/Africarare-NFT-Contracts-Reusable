// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PerTokenCustomMint is ERC721, AccessControl {
    bytes32 public constant SUPERADMIN_ROLE = keccak256("SUPERADMIN_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private tokenIdCounter;

    mapping(uint256 => string) private tokenURIs;

    constructor() ERC721("Blessing Ngobeni", "BLNG") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SUPERADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, SUPERADMIN_ROLE);
    }

    function setAdmin(address _admin) external {
        require(
            hasRole(SUPERADMIN_ROLE, msg.sender),
            "Caller is not a superadmin"
        );
        require(_admin != address(0), "Invalid address");
        grantRole(ADMIN_ROLE, _admin);
    }

    function revokeAdmin() external {
        require(
            hasRole(SUPERADMIN_ROLE, msg.sender),
            "Caller is not a superadmin"
        );
        grantRole(ADMIN_ROLE, address(0));
    }

    function mint(string memory _tokenURI) external {
        require(
            hasRole(SUPERADMIN_ROLE, msg.sender),
            "Caller is not a superadmin"
        );
        uint256 tokenId = tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    //@dev: Allow for a admin to manage tokens without superadmin approvals
    function updateTokenURI(uint256 tokenId, string memory _tokenURI) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            hasRole(SUPERADMIN_ROLE, msg.sender) ||
                hasRole(ADMIN_ROLE, msg.sender),
            "Caller is not a superadmin or admin"
        );
        _setTokenURI(tokenId, _tokenURI);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenURIs[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
