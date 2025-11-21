'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Settings2 } from "lucide-react"

export interface ChartConfig {
    labelStyle: 'none' | 'inner' | 'outer'
    chartType: 'donut' | 'pie'
    showLegend: boolean
}

interface ChartSettingsDialogProps {
    config: ChartConfig
    onConfigChange: (config: ChartConfig) => void
}

export function ChartSettingsDialog({ config, onConfigChange }: ChartSettingsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chart Appearance</DialogTitle>
                    <DialogDescription>
                        Customize how your budget chart looks.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    <div className="space-y-3">
                        <Label>Label Style</Label>
                        <RadioGroup
                            value={config.labelStyle}
                            onValueChange={(val) => onConfigChange({ ...config, labelStyle: val as any })}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="inner" id="r1" />
                                <Label htmlFor="r1">Inside Slices (Name + %)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outer" id="r2" />
                                <Label htmlFor="r2">Outside (Connected Lines)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="r3" />
                                <Label htmlFor="r3">Hidden</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <Label>Chart Type</Label>
                        <RadioGroup
                            value={config.chartType}
                            onValueChange={(val) => onConfigChange({ ...config, chartType: val as any })}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="donut" id="t1" />
                                <Label htmlFor="t1">Donut</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pie" id="t2" />
                                <Label htmlFor="t2">Full Pie</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-legend">Show Legend</Label>
                        <Switch
                            id="show-legend"
                            checked={config.showLegend}
                            onCheckedChange={(checked) => onConfigChange({ ...config, showLegend: checked })}
                        />
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
