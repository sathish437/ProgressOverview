/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./client/index.html",
        "./client/src/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./index.html"
    ],
    theme: {
        extend: {
            colors: {
                background: '#121214',
                surface: '#18181D',
                primary: '#3B82F6',
                secondary: '#10B981',
                text: '#E5E7EB',
                muted: '#9CA3AF',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
