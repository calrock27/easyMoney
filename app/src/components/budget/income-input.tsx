'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { updateIncome } from '@/app/actions/budget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Check, Edit2, DollarSign } from 'lucide-react'

export function IncomeInput() {
    const { user, setUser } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [income, setIncome] = useState(user?.income?.toString() || '0')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setIncome(user.income.toString())
        }
    }, [user])

    async function handleSave() {
        if (!user) return
        setIsLoading(true)
        const amount = parseFloat(income)
        if (isNaN(amount)) return

        const res = await updateIncome(user.id, amount)
        if (res.success && res.data) {
            setUser(res.data)
            setIsEditing(false)
        }
        setIsLoading(false)
    }

    if (!user) return null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="flex gap-2 items-center mt-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
                            <Input
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSave()
                                    }
                                }}
                                className="pl-6"
                                autoFocus
                            />
                        </div>
                        <Button size="icon" onClick={handleSave} disabled={isLoading}>
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className="flex items-center justify-between mt-2 cursor-pointer group"
                        onClick={() => setIsEditing(true)}
                    >
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(user.income)}
                        </div>
                        <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    Total monthly earnings
                </p>
            </CardContent>
        </Card>
    )
}
