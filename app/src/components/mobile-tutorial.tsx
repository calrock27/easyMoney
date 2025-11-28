'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileTutorialProps {
    userId: string
    hasData: boolean
    onComplete: () => void
}

export function MobileTutorial({ userId, hasData, onComplete }: MobileTutorialProps) {
    const [step, setStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if tutorial has been seen for this specific user
        const hasSeen = localStorage.getItem(`tutorial_seen_${userId}`)
        if (!hasSeen && !hasData) {
            // Delay slightly to allow UI to settle
            setTimeout(() => setIsVisible(true), 500)
        }
    }, [hasData, userId])

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1)
        } else {
            handleDismiss()
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem(`tutorial_seen_${userId}`, 'true')
        onComplete()
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 pointer-events-none md:hidden">
            {/* Backdrop with hole punch effect (simulated with multiple overlays) */}
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-500" />

            {/* Step 1: Expenses Tab (Bottom Right) */}
            {step === 0 && (
                <div className="absolute inset-0 flex flex-col items-end justify-end pb-24 pr-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <Card className="w-64 pointer-events-auto bg-background/95 backdrop-blur shadow-xl border-primary/20">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">Start Here! 👋</h3>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={handleDismiss}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Tap <span className="font-bold">Expenses</span> to add your first expense.
                            </p>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleNext}>Next</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <ArrowDown className="text-white h-12 w-12 mt-4 mr-8 animate-bounce" />
                </div>
            )}

            {/* Step 2: Summary Tab (Bottom Center) */}
            {step === 1 && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <Card className="w-64 pointer-events-auto bg-background/95 backdrop-blur shadow-xl border-primary/20">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-lg">Track Your Budget 💰</h3>
                            <p className="text-sm text-muted-foreground">
                                Check the <span className="font-bold">Summary</span> tab to add your monthly income.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
                                <Button size="sm" onClick={handleNext}>Next</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <ArrowDown className="text-white h-12 w-12 mt-4 animate-bounce" />
                </div>
            )}

            {/* Step 3: Chart Tab (Bottom Left) */}
            {step === 2 && (
                <div className="absolute inset-0 flex flex-col items-start justify-end pb-24 pl-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <Card className="w-64 pointer-events-auto bg-background/95 backdrop-blur shadow-xl border-primary/20">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-lg">Visualize It 📊</h3>
                            <p className="text-sm text-muted-foreground">
                                The <span className="font-bold">Chart</span> tab gives you a visual breakdown of your spending.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
                                <Button size="sm" onClick={handleNext}>Got it!</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <ArrowDown className="text-white h-12 w-12 mt-4 ml-8 animate-bounce" />
                </div>
            )}
        </div>
    )
}
