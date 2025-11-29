'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DemoTimer({ className }: { className?: string }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/system/status')
                const data = await res.json() as { lastReset?: string }
                if (data.lastReset) {
                    const lastReset = new Date(Number(data.lastReset))
                    const nextReset = new Date(lastReset.getTime() + 60 * 1000) // +60 seconds

                    // If next reset is in the past (e.g. cron failed), default to next minute from now
                    if (nextReset.getTime() < Date.now()) {
                        const now = new Date()
                        nextReset.setTime(now.getTime())
                        nextReset.setMinutes(now.getMinutes() + 1, 0, 0)
                    }

                    return nextReset
                }
            } catch (e) {
                console.error('Failed to fetch status', e)
            }
            // Fallback
            const now = new Date()
            const nextMinute = new Date(now)
            nextMinute.setMinutes(now.getMinutes() + 1, 0, 0)
            return nextMinute
        }

        let nextResetTime: Date | null = null

        const updateTimer = () => {
            if (!nextResetTime) return

            const now = new Date()
            const diff = nextResetTime.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft('Resetting...')
                // Refresh status if we hit zero
                fetchStatus().then(time => nextResetTime = time)
                return
            }

            const minutes = Math.floor((diff / 1000 / 60) % 60)
            const seconds = Math.floor((diff / 1000) % 60)

            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }

        fetchStatus().then(time => {
            nextResetTime = time
            updateTimer()
        })

        const timer = setInterval(updateTimer, 1000)

        return () => clearInterval(timer)
    }, [])

    // Don't render on server to avoid hydration mismatch
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    return (
        <div className={cn("flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md", className)}>
            <Clock className="h-3 w-3" />
            <span className="whitespace-nowrap">Reset in <span className="inline-block w-[5ch] text-center tabular-nums">{timeLeft}</span></span>
        </div>
    )
}
