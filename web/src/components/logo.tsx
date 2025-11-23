import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
    variant?: 'default' | 'icon-only'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Logo({ variant = 'default', size = 'md', className }: LogoProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-16 w-16"
    }

    const textClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-4xl"
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("relative", sizeClasses[size])}>
                <Image
                    src="/icons/icon.svg"
                    alt="easyMoney Logo"
                    fill
                    className="object-contain"
                />
            </div>
            {variant === 'default' && (
                <span className={cn("font-bold tracking-tight", textClasses[size])}>
                    easyMoney
                </span>
            )}
        </div>
    )
}
