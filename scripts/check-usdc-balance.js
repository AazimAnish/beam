const { ethers } = require('ethers');

// USDC contract address on Avalanche Fuji testnet
const USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65';

// USDC ABI (minimal for balanceOf)
const USDC_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
];

// Avalanche Fuji testnet RPC
const RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';

async function checkUsdcBalance() {
  const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

  if (!WALLET_ADDRESS) {
    console.error('Please set WALLET_ADDRESS environment variable');
    console.error('Example: WALLET_ADDRESS=0x... node scripts/check-usdc-balance.js');
    return;
  }

  try {
    // Connect to Avalanche Fuji testnet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // USDC contract instance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    
    // Check USDC balance
    const balance = await usdcContract.balanceOf(WALLET_ADDRESS);
    const balanceFormatted = ethers.utils.formatUnits(balance, 6);
    
    console.log(`Wallet: ${WALLET_ADDRESS}`);
    console.log(`USDC Balance: ${balanceFormatted} USDC`);
    
    // Also check AVAX balance
    const avaxBalance = await provider.getBalance(WALLET_ADDRESS);
    const avaxBalanceFormatted = ethers.utils.formatEther(avaxBalance);
    
    console.log(`AVAX Balance: ${avaxBalanceFormatted} AVAX`);
    
    if (parseFloat(balanceFormatted) === 0) {
      console.log('\n⚠️  No USDC found! You need to get testnet USDC from a faucet.');
      console.log('Visit: https://faucet.avax.network/');
    }
    
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

// Run the script
checkUsdcBalance();
