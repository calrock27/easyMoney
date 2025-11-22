'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget } from '@/app/actions/budget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Expense } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function PrintPage() {
    const { user } = useUser()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            loadData()
        } else {
            // If no user in context (e.g. direct link), maybe redirect or show loading
            // But user provider should restore it.
        }
    }, [user])

    async function loadData() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            setExpenses(res.data.expenses)
        }
        setLoading(false)
    }

    if (!user) return <div className="p-8">Please select a user first.</div>

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
    const disposableIncome = user.income - totalExpenses
    const percentSpent = user.income > 0 ? (totalExpenses / user.income) * 100 : 0

    const chartData = expenses.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.name === curr.category)
        if (existing) {
            existing.value += curr.amount
        } else {
            acc.push({ name: curr.category, value: curr.amount })
        }
        return acc
    }, [])

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(val)

    return (
        <div className="min-h-screen bg-white text-black p-8 print:p-0">
            {/* No-print controls */}
            <div className="mb-8 flex gap-4 print:hidden">
                <Link href="/">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Button
                    onClick={() => window.print()}
                    className="bg-black text-white hover:bg-gray-800"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
            </div>

            {/* Printable Content - 8.5x11 Vertical Optimized */}
            <div className="max-w-[8.5in] mx-auto space-y-8">

                {/* Header */}
                <div className="text-center border-b pb-4">
                    <h1 className="text-4xl font-bold mb-2">Monthly Budget Report</h1>
                    <p className="text-xl text-gray-600">{user.name}</p>
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>

                {/* High Level Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-gray-600">Total Income</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(user.income)}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-gray-600">Total Expenses</h3>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-gray-600">Left to Spend</h3>
                        <p className={`text-2xl font-bold ${disposableIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(disposableIncome)}
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4">Spending Breakdown</h2>
                    <div className="h-[300px] w-full max-w-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Expense Details</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="py-2">Category</th>
                                <th className="py-2">Item</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">{expense.category}</td>
                                    <td className="py-2 font-medium">{expense.name}</td>
                                    <td className="py-2 text-right">{formatCurrency(expense.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-400 mt-12 pt-4 border-t">
                    Generated by Static Budget App
                </div>

            </div>
        </div>
    )
}
