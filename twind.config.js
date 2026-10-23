export default {
  theme: {
    extend: {
      colors: {
        //  Paleta institucional azul (principal)
        'sistema': {
          50:  '#eef5ff',
          100: '#d9e7ff',
          200: '#a9c8ff',
          300: '#78a9ff',
          400: '#4b8cff',
          500: '#1e70ff',   // azul primário (botões, links)
          600: '#155cd6',
          700: '#0c47ac',   // azul do header
          800: '#07388a',
          900: '#02245a',
        },

        // Verde - ações de sucesso / editar
        'sucesso': {
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },

        //  Vermelho - exclusão / erro
        'erro': {
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
        },

        //  Tons neutros - fundo e textos
        'neutra': {
          50:  '#f4f4f9',  // fundo das páginas
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
