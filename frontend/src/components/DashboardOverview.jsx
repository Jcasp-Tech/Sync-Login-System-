import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DashboardOverview() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$1,250.00',
      change: '+12.5%',
      trend: 'up',
      description: 'Trending up this month',
    },
    {
      title: 'New Customers',
      value: '1,234',
      change: '-20%',
      trend: 'down',
      description: 'Down 20% this period',
      note: 'Acquisition needs attention',
    },
    {
      title: 'Active Accounts',
      value: '45,678',
      change: '+12.5%',
      trend: 'up',
      description: 'Strong user retention',
      note: 'Engagement exceed targets',
    },
    {
      title: 'Growth Rate',
      value: '4.5%',
      change: '+4.5%',
      trend: 'up',
      description: 'Steady performance increase',
      note: 'Meets growth projections',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={metric.trend === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {metric.change}
              </Badge>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
            {metric.note && (
              <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

