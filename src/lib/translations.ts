


export const translations = {
  en: {
    contact: {
      title: "Let's Work Together",
      subtitle: "Have a project in mind or just want to chat? I'd love to hear from you.",
      getInTouch: "Get in Touch",
      description: "I'm always open to discussing new opportunities, interesting projects, or just having a conversation about technology and development.",
      quickResponse: "Quick Response Guaranteed",
      quickResponseDesc: "I typically respond to all inquiries within 24 hours. Looking forward to hearing from you!",
      sendMessage: "Send a Message"
    }
  },
  pt: {
    contact: {
      title: "Vamos Trabalhar Juntos",
      subtitle: "Tem um projeto em mente ou apenas quer conversar? Adoraria ouvir de você.",
      getInTouch: "Entre em Contato",
      description: "Estou sempre aberto a discutir novas oportunidades, projetos interessantes ou apenas ter uma conversa sobre tecnologia e desenvolvimento.",
      quickResponse: "Resposta Rápida Garantida",
      quickResponseDesc: "Normalmente respondo a todas as consultas dentro de 24 horas. Estou ansioso para ouvir de você!",
      sendMessage: "Enviar uma Mensagem"
    }
  }
};


export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;