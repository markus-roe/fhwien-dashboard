import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        className={`custom-checkbox mt-0.5 shrink-0 ${className}`}
        {...props}
      />
      {label && (
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
            {label}
          </p>
        </div>
      )}
    </label>
  )
}

