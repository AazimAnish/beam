"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, Copy, Download, DollarSign, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAvaxBalanceInUsd } from "@/hooks/useAvaxBalance";
import { useUsdcBalance } from "@/hooks/useUsdc";
import type { User } from "@privy-io/react-auth";

// Helper to get social profile picture
const getSocialAvatar = (user: User | null) => {
  const socialAccount = user?.linkedAccounts.find(
    (account) => account.type !== "wallet" && 'profilePictureUrl' in account
  );
  if (socialAccount && 'profilePictureUrl' in socialAccount) {
    return socialAccount.profilePictureUrl;
  }
  return null;
}

export function WalletStatus() {
  const {
    ready,
    authenticated,
    login,
    logout,
    user,
    exportWallet,
  } = usePrivy();

  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;

  const { balanceInUsd, isLoading: isAvaxBalanceLoading } = useAvaxBalanceInUsd(walletAddress);
  const { formattedBalance: usdcBalance, loading: isUsdcBalanceLoading } = useUsdcBalance(walletAddress);

  const avatarSrc = getSocialAvatar(user) || `https://avatar.vercel.sh/${user?.wallet?.address}.png`;

  const copyAddress = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      toast.success("Address copied to clipboard!");
    }
  };

  if (!ready) {
    return (
      <div className="wallet-card">
        <Button disabled className="h-10 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm sm:text-base">
          Loading...
        </Button>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="wallet-card">
        <Button
          onClick={login}
          className="button-connect h-10 sm:h-12 rounded-full text-sm sm:text-base font-bold"
        >
          <LogIn className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Connect
        </Button>
      </div>
    );
  }

  // This check ensures user is not null for the rest of the component
  if (!user) return null;

  return (
    <div className="wallet-card">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>
                  {user.wallet?.address.slice(2, 4)}
                </AvatarFallback>
              </Avatar>
              <span className="font-mono font-bold text-sm sm:text-base">
                {isUsdcBalanceLoading ? "..." : `$${usdcBalance} `}
                <span className="wallet-balance">
                  {"USDC"}
                </span>
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="glass-card w-56 sm:w-64 border border-white/20"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-white text-sm sm:text-base">My Wallet</span>
              <span className="wallet-address text-xs sm:text-sm">
                {user.wallet?.address.slice(0, 6)}...
                {user.wallet?.address.slice(-4)}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                    <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>USDC</span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm">{isUsdcBalanceLoading ? '...' : `$${usdcBalance}`}</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <div className="flex justify-between w-full items-center">
                       <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm">
                            <Gem className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>AVAX</span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm">
                          {isAvaxBalanceLoading ? '...' : `$${balanceInUsd}`}
                        </span>
                    </div>
                </DropdownMenuItem>
           </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportWallet}>
              <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Export Wallet</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 