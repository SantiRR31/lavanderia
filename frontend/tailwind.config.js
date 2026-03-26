/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#ec5b13',
                    50: '#fef4ee',
                    100: '#fde5d5',
                    200: '#fbcaac',
                    300: '#f8a577',
                    400: '#f4773d',
                    500: '#ec5b13',
                    600: '#d5460f',
                    700: '#b03510',
                    800: '#8c2c13',
                    900: '#712613',
                },
                "background-light": "#f8f6f6",
                "background-dark": "#221610",
            },
            fontFamily: {
                display: ['"Public Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
