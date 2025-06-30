import React from 'react';
import { Zap, Plus, TrendingUp, Clock } from 'lucide-react';
import { useCredits, useCreditTransactions, useSubscriptionInfo } from '../../hooks/usePayment';
import { cn } from '../../lib/utils';

interface CreditsDisplayProps {
  compact?: boolean;
  showTransactions?: boolean;
}

export function CreditsDisplay({ compact = false, showTransactions = false }: CreditsDisplayProps) {
  const { data: credits } = useCredits();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const { data: transactions } = useCreditTransactions();

  if (!subscriptionInfo?.can_use_ai) {
    return (
      <div className={cn(
        'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4',
        compact && 'p-3'
      )}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className={cn('font-medium text-purple-900', compact ? 'text-sm' : 'text-base')}>
              Upgrade for AI Features
            </h3>
            <p className={cn('text-purple-700', compact ? 'text-xs' : 'text-sm')}>
              Get AI-powered prompt generation with Pro or Max plans
            </p>
          </div>
          <button className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  const balance = credits?.balance || 0;
  const isLowBalance = balance < 100;

  return (
    <div className="space-y-4">
      {/* Credits Balance */}
      <div className={cn(
        'bg-white border border-gray-200 rounded-lg p-4',
        compact && 'p-3'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'rounded-lg flex items-center justify-center',
              isLowBalance ? 'w-8 h-8 bg-orange-100' : 'w-8 h-8 bg-indigo-100'
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
              <p className={cn('text-gray-600', compact ? 'text-xs' : 'text-sm')}>
                {balance.toLocaleString()} available
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn(
              'font-bold',
              compact ? 'text-lg' : 'text-2xl',
              isLowBalance ? 'text-orange-600' : 'text-gray-900'
            )}>
              {balance.toLocaleString()}
            </div>
            {isLowBalance && (
              <p className="text-xs text-orange-600">Low balance</p>
            )}
          </div>
        </div>

        {isLowBalance && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Running low on credits</p>
                <p className="text-xs text-orange-700">Upgrade your plan for more credits</p>
              </div>
              <button className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-700 transition-colors">
                <Plus className="w-3 h-3 mr-1 inline" />
                Add Credits
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      {!compact && credits && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Total Earned</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {credits.total_earned.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Spent</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {credits.total_spent.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {showTransactions && transactions && transactions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
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
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'text-sm font-medium',
                  transaction.transaction_type === 'spent' ? 'text-red-600' : 'text-green-600'
                )}>
                  {transaction.transaction_type === 'spent' ? '-' : '+'}
                  {transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}