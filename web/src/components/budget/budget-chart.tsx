'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget } from '@/app/actions/budget'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Expense } from '@prisma/client'
import { cn } from '@/lib/utils'

const COLORS = [
    '#0ea5e9', // sky-500
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
]

export function BudgetChart({ refreshKey }: { refreshKey?: number }) {
    const { user } = useUser()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user, refreshKey])

    async function loadData() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            setExpenses(res.data.expenses)
        }
    }

    const chartData = useMemo(() => {
        const data = expenses.reduce((acc: any[], curr) => {
            const existing = acc.find(item => item.name === curr.category)
            if (existing) {
                existing.value += curr.amount
            } else {
                acc.push({ name: curr.category, value: curr.amount, isUnallocated: false })
            }
            return acc
        }, [])

        if (user) {
            const currentTotal = data.reduce((sum: number, item: any) => sum + item.value, 0)
            const unallocated = user.income - currentTotal

            if (unallocated > 0) {
                data.push({ name: 'Unallocated', value: unallocated, isUnallocated: true })
            }
        }

        // Sort by value descending
        return data.sort((a: any, b: any) => b.value - a.value)
    }, [expenses, user])

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0)
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0)

    const activeItem = activeIndex !== null ? chartData[activeIndex] : null

    if (!user || (expenses.length === 0 && user.income === 0)) return (
        <Card className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data to display
        </Card>
    )

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>
                    Interactive view of your monthly expenses
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-8 items-center justify-center p-6">

                {/* Donut Chart Section */}
                <div className="relative w-[250px] h-[250px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isUnallocated ? '#e2e8f0' : COLORS[index % COLORS.length]}
                                        className={cn(
                                            "transition-all duration-300 cursor-pointer",
                                            activeIndex === index ? "opacity-100 stroke-4" : "opacity-80 hover:opacity-100"
                                        )}
                                        stroke={activeIndex === index ? "hsl(var(--background))" : "none"}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm text-muted-foreground font-medium">
                            {activeItem ? activeItem.name : 'Total Spent'}
                        </span>
                        <span className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: user.currency,
                                maximumFractionDigits: 0
                            }).format(activeItem ? activeItem.value : totalSpent)}
                        </span>
                    </div>
                </div>

                {/* Breakdown List Section */}
                <div className="flex-1 w-full space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {chartData.map((item, index) => {
                        const percentage = (item.value / totalValue) * 100
                        const isHovered = activeIndex === index

                        return (
                            <div
                                key={item.name}
                                className={cn(
                                    "group flex flex-col gap-1 p-2 rounded-lg transition-colors cursor-pointer",
                                    isHovered ? "bg-accent" : "hover:bg-accent/50"
                                )}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.isUnallocated ? '#e2e8f0' : COLORS[index % COLORS.length] }}
                                        />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground">
                                            {percentage.toFixed(1)}%
                                        </span>
                                        <span className="font-bold w-20 text-right">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: user.currency
                                            }).format(item.value)}
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={percentage}
                                    className="h-1.5"
                                />
                            </div>
                        )
                    })}
                </div>

            </CardContent>
        </Card>
    )
}
