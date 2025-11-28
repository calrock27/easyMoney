'use client'

import { useUser } from '@/components/providers/user-provider'
import { UserSwitcher } from '@/components/user-switcher'
import { Dashboard } from '@/components/dashboard'

interface HomeClientProps {
    isDemoMode: boolean
}

export function HomeClient({ isDemoMode }: HomeClientProps) {
    const { user, isLoading } = useUser()

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user) {
        return <UserSwitcher />
    }

    return <Dashboard isDemoMode={isDemoMode} />
}
