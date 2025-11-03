module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 
          900:"#1E2257", 500:"#8B5CF6", 400:"#A78BFA", 
          300:"#93C5FD", 200:"#5EEAD4", 100:"#86EFAC" 
        },
        success: { DEFAULT:"#22C55E", light:"#BBF7D0" },
        danger:  { DEFAULT:"#EF4444", light:"#FECACA" },
        gray:    { 
          900:"#111827",700:"#374151",500:"#6B7280",300:"#D1D5DB",
          200:"#E5E7EB",100:"#F3F4F6",50:"#FAFAFA",white:"#FFFFFF" 
        },
      },
      boxShadow:   { card: "0 6px 18px rgba(0,0,0,0.08)" },
      fontFamily:  { rubik: ["Rubik","system-ui","Arial","sans-serif"] },
      borderRadius:{ xl2: "1rem" },
      screens: {
        'tablet': { 'min': '820px', 'max': '1194px' }, // ← טאבלט 11 אינץ'
        'desktop': '1200px',
      },
    },
  },
  plugins: [],
}
