const hre = require("hardhat");

async function main() {
  console.log("Deploying ElectionFactory smart contract...");

  const ElectionFactory = await hre.ethers.getContractFactory("ElectionFactory");
  const factory = await ElectionFactory.deploy();

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ ElectionFactory deployed successfully to: ${factoryAddress}`);

  // Create a sample demo election
  console.log("Deploying sample election contract via Factory...");
  const tx = await factory.createElection(
    "National Presidential Election 2026",
    "Decentralized digital voting for national presidential candidates",
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000) + 86400 * 7
  );
  await tx.wait();

  const deployedElections = await factory.getDeployedElections();
  console.log(`✅ Sample Election deployed to: ${deployedElections[0]}`);

  // Print summary JSON for backend integration
  const output = {
    factoryAddress,
    sampleElectionAddress: deployedElections[0],
    network: hre.network.name
  };
  console.log("DEPLOYMENT_OUTPUT:", JSON.stringify(output));
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});
