const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // USDC contract address on Avalanche Fuji testnet
  const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
  
  console.log("Deploying Beam contract to Avalanche Fuji testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "AVAX");
  
  // Deploy Beam contract
  const Beam = await ethers.getContractFactory("Beam");
  const beam = await Beam.deploy(USDC_ADDRESS);
  
  await beam.deployed();
  
  console.log("✅ Beam contract deployed to:", beam.address);
  console.log("📝 USDC Token Address:", USDC_ADDRESS);
  console.log("🔗 Transaction hash:", beam.deployTransaction.hash);
  
  // Wait for a few blocks before verifying
  console.log("⏳ Waiting for blocks confirmations...");
  await beam.deployTransaction.wait(6);
  
  // Verify the contract
  try {
    console.log("🔍 Verifying contract on Snowtrace...");
    await hre.run("verify:verify", {
      address: beam.address,
      constructorArguments: [USDC_ADDRESS],
    });
    console.log("✅ Contract verified on Snowtrace");
  } catch (error) {
    console.log("❌ Error verifying contract:", error.message);
  }
  
  console.log("\n🎉 Deployment completed!");
  console.log("Contract Address:", beam.address);
  console.log("Network: Avalanche Fuji Testnet");
  console.log("Explorer: https://testnet.snowtrace.io/address/" + beam.address);
  
  // Update environment file suggestion
  console.log("\n📝 Add this to your .env file:");
  console.log(`NEXT_PUBLIC_BEAM_CONTRACT_ADDRESS=${beam.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });