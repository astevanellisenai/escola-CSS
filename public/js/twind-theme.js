// Tema centralizado do projeto
export const config = {
  theme: {
    extend: {
      colors: {
        // 🔴 Paleta institucional vermelha (base do sistema)
        sistema: {
          50:  '#fff5f5',
          100: '#ffe3e3',
          200: '#ffbaba',
          300: '#ff8a8a',
          400: '#f35454',
          500: '#e02424',   // vermelho principal (botões e links)
          600: '#c81e1e',
          700: '#991b1b',   // header
          800: '#7f1d1d',
          900: '#450a0a',
        },

        // 💚 Verde - sucesso / editar
        sucesso: {
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },

        // ❤️ Vermelho - erro / deletar (mantém igual para contraste)
        erro: {
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
        },

        // 🩶 Tons neutros - fundo e textos
        neutra: {
          50:  '#f4f4f9',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#374151',
          600: '#1f2937',
          700: '#111827',
        },
      },
    },
  },
};
