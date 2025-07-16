'use client'

import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm hover:shadow-md',
      secondary: 'border border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500',
      outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl'
    }
    
    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
