import React from 'react';
import { Zap, Plus, TrendingUp, Clock } from 'lucide-react';
import { useCredits, useCreditTransactions, useSubscriptionInfo } from '../../hooks/usePayment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '../../lib/utils';

interface CreditsDisplaySettingsProps {
  compact?: boolean;
  showTransactions?: boolean;
}

export function CreditsDisplaySettings({ compact = false, showTransactions = false }: CreditsDisplaySettingsProps) {
  const { data: credits } = useCredits();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const { data: transactions } = useCreditTransactions();

  if (!subscriptionInfo?.can_use_ai) {
    return (
      <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <Zap className="h-4 w-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div>
            <div className={cn('font-medium text-purple-900', compact ? 'text-sm' : 'text-base')}>
              Upgrade for AI Features
            </div>
            <div className={cn('text-purple-700', compact ? 'text-xs' : 'text-sm')}>
              Get AI-powered prompt generation with Pro or Max plans
            </div>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 ml-4">
            Upgrade
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const balance = credits?.balance || 0;
  const isLowBalance = balance < 100;

  return (
    <div className="space-y-4">
      {/* Credits Balance */}
      <Card>
        <CardContent className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'rounded-lg flex items-center justify-center w-8 h-8',
                isLowBalance ? 'bg-orange-100' : 'bg-indigo-100'
              )}>
                <Zap className={cn(
                  'w-4 h-4',
                  isLowBalance ? 'text-orange-600' : 'text-indigo-600'
                )} />
              </div>
              <div>
                <h3 className={cn('font-medium text-gray-900', compact ? 'text-sm' : 'text-base')}>
                  AI Credits
                </h3>
                <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
                  {balance.toLocaleString()} available
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={cn(
                'font-bold',
                compact ? 'text-lg' : 'text-2xl',
                isLowBalance ? 'text-orange-600' : 'text-foreground'
              )}>
                {balance.toLocaleString()}
              </div>
              {isLowBalance && (
                <Badge variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  Low balance
                </Badge>
              )}
            </div>
          </div>

          {isLowBalance && (
            <Alert className="mt-3 border-orange-200 bg-orange-50">
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Running low on credits</p>
                  <p className="text-xs text-orange-700">Upgrade your plan for more credits</p>
                </div>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Credits
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {!compact && credits && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Earned</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {credits.total_earned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {credits.total_spent.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {showTransactions && transactions && transactions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center',
                        transaction.transaction_type === 'spent' ? 'bg-red-100' : 'bg-green-100'
                      )}>
                        {transaction.transaction_type === 'spent' ? (
                          <Zap className="w-3 h-3 text-red-600" />
                        ) : (
                          <Plus className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={transaction.transaction_type === 'spent' ? 'destructive' : 'default'}
                      className={cn(
                        transaction.transaction_type === 'spent' 
                          ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      )}
                    >
                      {transaction.transaction_type === 'spent' ? '-' : '+'}
                      {transaction.amount.toLocaleString()}
                    </Badge>
                  </div>
                  {index < transactions.slice(0, 5).length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}