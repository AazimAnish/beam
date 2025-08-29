const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
  const BEAM_CONTRACT_ADDRESS = "0xc19F760d62787AD20B3AF005fFa364341700c94E";
  const AMOUNT_TO_DEPOSIT = "1000"; // 1000 USDC
  
  console.log("Funding sponsor wallet in Beam contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get contract instances
  const usdc = await ethers.getContractAt([
    "function balanceOf(address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function transfer(address, uint256) returns (bool)"
  ], USDC_ADDRESS);
  
  const beam = await ethers.getContractAt("Beam", BEAM_CONTRACT_ADDRESS);
  
  // Check USDC balance
  const balance = await usdc.balanceOf(deployer.address);
  console.log("USDC Balance:", ethers.utils.formatUnits(balance, 6), "USDC");
  
  const amountToDeposit = ethers.utils.parseUnits(AMOUNT_TO_DEPOSIT, 6);
  
  if (balance.lt(amountToDeposit)) {
    console.log("❌ Insufficient USDC balance to deposit");
    console.log("Need to get some USDC on Avalanche Fuji testnet first");
    console.log("You can use the Avalanche Fuji faucet or bridge tokens");
    return;
  }
  
  console.log("Approving USDC spend...");
  const approveTx = await usdc.approve(BEAM_CONTRACT_ADDRESS, amountToDeposit);
  await approveTx.wait();
  console.log("✅ USDC approval successful");
  
  console.log(`Depositing ${AMOUNT_TO_DEPOSIT} USDC to sponsor funds...`);
  const depositTx = await beam.sponsorDeposit(amountToDeposit);
  await depositTx.wait();
  console.log("✅ Sponsor deposit successful!");
  
  // Check sponsor funds
  const sponsorFunds = await beam.sponsorFunds(deployer.address);
  console.log("Sponsor Funds Balance:", ethers.utils.formatUnits(sponsorFunds, 6), "USDC");
  
  console.log("🎉 Sponsor wallet funded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });