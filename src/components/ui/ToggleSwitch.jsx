import * as React from "react"
import { X, Check } from "lucide-react"

/**
 * ToggleSwitch - Componente de switch con iconos visuales
 * Muestra un círculo con X cuando está apagado y un check cuando está encendido
 *
 * @param {boolean} checked - Estado del switch
 * @param {function} onCheckedChange - Callback cuando cambia el estado
 * @param {boolean} disabled - Si el switch está deshabilitado
 */
const ToggleSwitch = React.forwardRef(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  ...props
}, ref) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked 
          ? "bg-[#14A4AF] hover:bg-[#0f8a94] focus:ring-[#14A4AF]/50" 
          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-gray-400/50"
        }
        ${className}
      `}
      {...props}
    >
      {checked ? (
        <Check className="w-5 h-5 text-white" strokeWidth={3} />
      ) : (
        <X className="w-5 h-5 text-white" strokeWidth={3} />
      )}
    </button>
  );
});

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
