const { ethers } = require('ethers');

// USDC contract address on Avalanche Fuji testnet
const USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65';

// USDC ABI (minimal for transfer)
const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
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

async function fundWallet() {
  // Configuration - UPDATE THESE VALUES
  const FUNDER_PRIVATE_KEY = process.env.FUNDER_PRIVATE_KEY; // Private key of wallet with USDC
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS; // Address to fund
  const AMOUNT_USDC = process.env.AMOUNT_USDC || '100'; // Amount in USDC

  if (!FUNDER_PRIVATE_KEY || !RECIPIENT_ADDRESS) {
    console.error('Please set FUNDER_PRIVATE_KEY and RECIPIENT_ADDRESS environment variables');
    console.error('Example:');
    console.error('FUNDER_PRIVATE_KEY=0x... RECIPIENT_ADDRESS=0x... AMOUNT_USDC=100 node scripts/fund-wallet.js');
    return;
  }

  try {
    // Connect to Avalanche Fuji testnet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const funderWallet = new ethers.Wallet(FUNDER_PRIVATE_KEY, provider);
    
    // USDC contract instance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, funderWallet);
    
    // Check funder's USDC balance
    const funderBalance = await usdcContract.balanceOf(funderWallet.address);
    const funderBalanceFormatted = ethers.formatUnits(funderBalance, 6);
    
    console.log(`Funder wallet: ${funderWallet.address}`);
    console.log(`Funder USDC balance: ${funderBalanceFormatted} USDC`);
    
    // Check recipient's current balance
    const recipientBalance = await usdcContract.balanceOf(RECIPIENT_ADDRESS);
    const recipientBalanceFormatted = ethers.formatUnits(recipientBalance, 6);
    console.log(`Recipient wallet: ${RECIPIENT_ADDRESS}`);
    console.log(`Recipient current balance: ${recipientBalanceFormatted} USDC`);
    
    // Convert amount to USDC units (6 decimals)
    const amountInUnits = ethers.parseUnits(AMOUNT_USDC, 6);
    
    if (funderBalance < amountInUnits) {
      console.error(`Insufficient USDC balance. Need ${AMOUNT_USDC} USDC, but only have ${funderBalanceFormatted} USDC`);
      return;
    }
    
    console.log(`\nSending ${AMOUNT_USDC} USDC to ${RECIPIENT_ADDRESS}...`);
    
    // Send USDC
    const tx = await usdcContract.transfer(RECIPIENT_ADDRESS, amountInUnits);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Check new recipient balance
    const newRecipientBalance = await usdcContract.balanceOf(RECIPIENT_ADDRESS);
    const newRecipientBalanceFormatted = ethers.formatUnits(newRecipientBalance, 6);
    console.log(`Recipient new balance: ${newRecipientBalanceFormatted} USDC`);
    
    console.log('\n✅ Transfer completed successfully!');
    
  } catch (error) {
    console.error('Error funding wallet:', error);
  }
}

// Run the script
fundWallet();
