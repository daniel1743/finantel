/** @type {import('tailwindcss').Config} */
const designTokens = require('./src/theme/designTokens.cjs');

module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// =====================================================
				// SHADCN/UI COLORS (mantener compatibilidad)
				// =====================================================
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					// =====================================================
					// DESIGN TOKENS 2025 - Paleta Profesional Completa
					// =====================================================
					...designTokens.colors.primary,
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					...designTokens.colors.secondary,
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// =====================================================
				// DESIGN TOKENS 2025 - Colores Neutrales
				// =====================================================
				neutral: {
					text: 'var(--neutral-text)',
					'text-secondary': 'var(--neutral-text-secondary)',
					background: 'var(--neutral-background)',
					'background-soft': 'var(--neutral-background-soft)',
					border: 'var(--neutral-border)',
					...designTokens.colors.neutral,
				},
				// =====================================================
				// DESIGN TOKENS 2025 - Estados
				// =====================================================
				status: {
					success: 'var(--status-success)',
					warning: 'var(--status-warning)',
					error: 'var(--status-error)',
				},
				success: designTokens.colors.success,
				warning: designTokens.colors.warning,
				error: designTokens.colors.error,
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// =====================================================
				// DESIGN TOKENS 2025 - Border Radius Unificado
				// =====================================================
				'card-sm': designTokens.borderRadius.md,
				'card': designTokens.borderRadius.lg,
				'card-lg': designTokens.borderRadius.xl,
				'button': designTokens.borderRadius.base,
				'input': designTokens.borderRadius.base,
				'modal': designTokens.borderRadius.xl,
			},
			// =====================================================
			// DESIGN TOKENS 2025 - Espaciado
			// =====================================================
			spacing: {
				'1': '8px',
				'1.5': '12px',
				'2': '16px',
				'3': '24px',
				'4': '32px',
				'5': '40px',
				'6': '48px',
				'8': '64px',
				...designTokens.spacing,
			},
			// =====================================================
			// DESIGN TOKENS 2025 - Tipografía
			// =====================================================
			fontFamily: designTokens.typography.fontFamily,
			fontSize: designTokens.typography.fontSize,
			fontWeight: designTokens.typography.fontWeight,
			boxShadow: designTokens.shadows,
			zIndex: designTokens.zIndex,
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};