import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Users } from 'lucide-react'

export default function AnalyticsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('3months')

  // Mock data - Replace with actual API call
  const visitorData = {
    '3months': {
      total: '45,678',
      description: 'Total for the last 3 months',
    },
    '30days': {
      total: '12,345',
      description: 'Total for the last 30 days',
    },
    '7days': {
      total: '3,456',
      description: 'Total for the last 7 days',
    },
  }

  const currentData = visitorData[selectedPeriod] || visitorData['3months']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>{currentData.description}</CardDescription>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Visitors Display */}
          <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Visitors</p>
                <p className="text-3xl font-bold">{currentData.total}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentData.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Integration with charting library (e.g., Recharts, Chart.js)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

