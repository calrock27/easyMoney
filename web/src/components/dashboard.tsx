'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { IncomeInput } from '@/components/budget/income-input'
import { ExpenseList } from '@/components/budget/expense-list'
import { BudgetChart } from '@/components/budget/budget-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { SettingsDialog } from '@/components/settings-dialog'
import { LogOut, Wallet, Printer } from 'lucide-react'
import Link from 'next/link'

export function Dashboard() {
    const { user, setUser } = useUser()
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (user) {
            loadTotalExpenses()
        }
    }, [user, refreshKey])

    async function loadTotalExpenses() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            const total = res.data.expenses.reduce((acc, curr) => acc + curr.amount, 0)
            setTotalExpenses(total)
        }
    }

    function handleExpenseChange() {
        setRefreshKey(prev => prev + 1)
    }

    if (!user) return null

    const disposableIncome = user.income - totalExpenses
    const percentSpent = user.income > 0 ? (totalExpenses / user.income) * 100 : 0

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
                        <p className="text-muted-foreground">Here's your budget</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <SettingsDialog />
                        <Link href="/print">
                            <Button variant="outline" size="icon" title="Print Report">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => setUser(null)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Switch User
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <IncomeInput />

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(totalExpenses)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {percentSpent.toFixed(1)}% of income
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={disposableIncome >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Left to Spend</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${disposableIncome >= 0 ? "text-primary" : "text-destructive"}`}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(disposableIncome)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Disposable monthly income
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 md:grid-cols-3">
                    <ExpenseList onExpenseChange={handleExpenseChange} />
                    <div className="md:col-span-1">
                        <BudgetChart refreshKey={refreshKey} />
                    </div>
                </div>
            </div>
        </div>
    )
}
