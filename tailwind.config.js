/** @type {import('tailwindcss').Config} */
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
					// DESIGN TOKENS 2025 - Paleta Profesional
					// Reemplazo de #1C8FA0 por tokens centralizados
					// =====================================================
					50: 'var(--primary-50)',
					100: 'var(--primary-100)',
					500: 'var(--primary-500)',
					600: 'var(--primary-600)',
					700: 'var(--primary-700)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
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
				},
				// =====================================================
				// DESIGN TOKENS 2025 - Estados
				// =====================================================
				status: {
					success: 'var(--status-success)',
					warning: 'var(--status-warning)',
					error: 'var(--status-error)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
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
			},
			// =====================================================
			// DESIGN TOKENS 2025 - Tipografía
			// =====================================================
			fontSize: {
				'xs': '11px',      // labels
				'sm': '14px',
				'base': '16px',
				'lg': '18px',
				'xl': '20px',
				'2xl': '24px',
				'3xl': '30px',
				'4xl': '36px',
				'6xl': '60px',     // hero
			},
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