import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalancheFuji, USDC_AVALANCHE_ADDRESS } from './constants'
import { BEAM_ABI } from './beam-abi'
import { USDC_ABI } from './usdc'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BEAM_CONTRACT_ADDRESS as `0x${string}`

// Public client for reading
export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http()
})

// Create wallet client for sponsor operations
export function createBeamWalletClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  
  return createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http()
  })
}

// Sponsor deposit function - deposits USDC into the Beam contract
export async function sponsorDeposit(privateKey: string, amount: number): Promise<string> {
  try {
    const walletClient = createBeamWalletClient(privateKey)
    const amountInUnits = parseUnits(amount.toString(), 6)
    
    // First approve the contract to spend USDC
    const approveTxHash = await walletClient.writeContract({
      address: USDC_AVALANCHE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amountInUnits]
    })
    
    // Wait for approval
    await publicClient.waitForTransactionReceipt({ hash: approveTxHash })
    
    // Then deposit into the contract
    const depositTxHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BEAM_ABI,
      functionName: 'sponsorDeposit',
      args: [amountInUnits]
    })
    
    return depositTxHash
  } catch (error) {
    console.error('Error depositing sponsor funds:', error)
    throw error
  }
}

// Get sponsor funds balance in the contract
export async function getSponsorFunds(sponsorAddress: string): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BEAM_ABI,
      functionName: 'sponsorFunds',
      args: [sponsorAddress as `0x${string}`]
    })
    
    return formatUnits(balance as bigint, 6)
  } catch (error) {
    console.error('Error fetching sponsor funds:', error)
    throw error
  }
}

// Get transfer details from the contract
export async function getTransferDetails(claimHash: string): Promise<{
  sender: string,
  recipient: string, 
  amount: string,
  claimed: boolean,
  timestamp: bigint
} | null> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BEAM_ABI,
      functionName: 'getTransfer',
      args: [claimHash as `0x${string}`]
    })
    
    if (!result || result[0] === '0x0000000000000000000000000000000000000000') {
      return null
    }
    
    return {
      sender: result[0] as string,
      recipient: result[1] as string,
      amount: formatUnits(result[2] as bigint, 6),
      claimed: result[3] as boolean,
      timestamp: result[4] as bigint
    }
  } catch (error) {
    console.error('Error fetching transfer details:', error)
    throw error
  }
}

// Create a new transfer in the contract
export async function createTransfer(
  privateKey: string, 
  recipient: string, 
  amount: number, 
  claimHash: string
): Promise<string> {
  try {
    const walletClient = createBeamWalletClient(privateKey)
    const amountInUnits = parseUnits(amount.toString(), 6)
    
    // First approve the contract to spend USDC
    const approveTxHash = await walletClient.writeContract({
      address: USDC_AVALANCHE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amountInUnits]
    })
    
    // Wait for approval
    await publicClient.waitForTransactionReceipt({ hash: approveTxHash })
    
    // Create the transfer
    const createTxHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BEAM_ABI,
      functionName: 'createTransfer',
      args: [recipient as `0x${string}`, amountInUnits, claimHash as `0x${string}`]
    })
    
    return createTxHash
  } catch (error) {
    console.error('Error creating transfer:', error)
    throw error
  }
}