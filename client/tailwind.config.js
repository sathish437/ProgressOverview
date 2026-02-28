/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#121212', // Charcoal/Dark
                surface: '#1E1E1E', // Slightly lighter
                primary: '#3B82F6', // Blue accent
                secondary: '#10B981', // Green accent
                text: '#E5E7EB', // Off-white
                muted: '#9CA3AF',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
