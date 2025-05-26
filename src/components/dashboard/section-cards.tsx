import { IconTrendingDown, IconTrendingUp, IconPackage, IconAlertTriangle } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Inventory Status */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Inventory Status</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Active
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage />
              Monitoring
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Real-time inventory tracking <IconPackage className="size-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Stock Alerts */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Stock Alerts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Monitor
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconAlertTriangle />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Low stock notifications enabled <IconAlertTriangle className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
