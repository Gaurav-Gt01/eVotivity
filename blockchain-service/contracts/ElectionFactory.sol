// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Election.sol";

/**
 * @title ElectionFactory
 * @dev Factory pattern contract to deploy independent Election smart contracts
 * and maintain a central registry of all elections on Ethereum Sepolia.
 */
contract ElectionFactory {
    address public admin;
    address[] public deployedElections;

    struct ElectionMetaData {
        address contractAddress;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        address creator;
        uint256 createdAt;
    }

    ElectionMetaData[] public electionsMetaData;

    event ElectionCreated(
        address indexed electionAddress,
        string name,
        address indexed creator,
        uint256 timestamp
    );

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Deploys a new independent Election smart contract
     */
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (address) {
        Election newElection = new Election(
            _name,
            _description,
            _startTime,
            _endTime,
            msg.sender
        );

        address electionAddr = address(newElection);
        deployedElections.push(electionAddr);

        electionsMetaData.push(ElectionMetaData({
            contractAddress: electionAddr,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            creator: msg.sender,
            createdAt: block.timestamp
        }));

        emit ElectionCreated(electionAddr, _name, msg.sender, block.timestamp);
        return electionAddr;
    }

    function getDeployedElections() external view returns (address[] memory) {
        return deployedElections;
    }

    function getElectionsCount() external view returns (uint256) {
        return deployedElections.length;
    }

    function getAllElectionsMetaData() external view returns (ElectionMetaData[] memory) {
        return electionsMetaData;
    }
}
