import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { useCredits, useCreditTransactions, useSubscriptionInfo } from '../../hooks/usePayment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '../../lib/utils';

interface CreditsDisplayProps {
  compact?: boolean;
  showTransactions?: boolean;
}

export function CreditsDisplay({ compact = false, showTransactions = false }: CreditsDisplayProps) {
  const { data: credits } = useCredits();
  const { data: subscriptionInfo } = useSubscriptionInfo();

  if (!subscriptionInfo?.can_use_ai) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Upgrade for AI</span>
        <Button size="sm" variant="secondary" className="h-6 px-2 text-xs">
          Upgrade
        </Button>
      </div>
    );
  }

  const balance = credits?.balance || 0;
  const isLowBalance = balance < 100;

  return (
    <div className="flex items-center gap-2">
      {/* Simple credits display for header */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
        isLowBalance 
          ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30" 
          : "bg-muted/50 hover:bg-muted/70"
      )}>
        <Zap className={cn(
          "h-4 w-4",
          isLowBalance ? "text-orange-600 dark:text-orange-400" : "text-foreground"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isLowBalance ? "text-orange-700 dark:text-orange-300" : "text-foreground"
        )}>
          {balance.toLocaleString()}
        </span>
        {isLowBalance && (
          <Badge 
            variant="secondary" 
            className="h-5 px-1.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          >
            Low
          </Badge>
        )}
      </div>

      {/* Add credits button when low */}
      {isLowBalance && (
        <Button size="sm" variant="outline" className="h-8 px-2">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      )}
    </div>
  );
}