import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useSubscriptionInfo, useCreatePortalSession } from '../../hooks/usePayment';
import { Loader2, CreditCard } from 'lucide-react';

export function SubscriptionSettings() {
  const { data: subscriptionInfo, isLoading } = useSubscriptionInfo();
  const createPortalSession = useCreatePortalSession();

  const handleManageSubscription = () => {
    createPortalSession.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const planType = subscriptionInfo?.plan_type || 'free';
  const status = subscriptionInfo?.status || 'active';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={planType === 'free' ? 'secondary' : 'default'}>
                {planType.charAt(0).toUpperCase() + planType.slice(1)}
              </Badge>
              <Badge variant={status === 'active' ? 'default' : 'destructive'}>
                {status}
              </Badge>
            </div>
          </div>
          {planType !== 'free' && (
            <Button
              onClick={handleManageSubscription}
              disabled={createPortalSession.isPending}
            >
              {createPortalSession.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>

        {subscriptionInfo?.current_period_end && (
          <div>
            <p className="text-sm text-muted-foreground">
              Next billing date:{' '}
              {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
            </p>
          </div>
        )}

        {subscriptionInfo?.credits_balance !== undefined && (
          <div>
            <p className="text-sm font-medium">Available Credits</p>
            <p className="text-2xl font-bold">{subscriptionInfo.credits_balance}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
