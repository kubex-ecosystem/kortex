// Next.js API Configuration
export const config = {
  api: {
    responseLimit: false,
    // responseLimit: '15mb', // Alternativa se responseLimit: false não funcionar
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
  // Configuração para requests grandes
  maxDuration: 30,
  // Configuração de runtime
  runtime: 'nodejs',
}
