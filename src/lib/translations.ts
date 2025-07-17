export const translations = {
  en: {
    contact: {
      title: "Let's Work Together",
      subtitle: "Have a project in mind or just want to chat? I'd love to hear from you.",
      getInTouch: "Get in Touch",
      description: "I'm always open to discussing new opportunities, interesting projects, or just having a conversation about technology and development.",
      quickResponse: "Quick Response Guaranteed",
      quickResponseDesc: "I typically respond to all inquiries within 24 hours. Looking forward to hearing from you!",
      sendMessage: "Send a Message",
      form: {
        name: "Name",
        namePlaceholder: "Your full name",
        email: "Email",
        emailPlaceholder: "your@email.com",
        subject: "Subject",
        subjectPlaceholder: "What is this about?",
        message: "Message",
        messagePlaceholder: "Tell me about your project or just say hello!",
        sending: "Sending...",
        send: "Send Message"
      },
      validation: {
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address",
        subjectRequired: "Subject is required",
        messageRequired: "Message is required",
        messageMinLength: "Message must be at least 10 characters long"
      },
      location: "Location",
      github: "GitHub",
      linkedin: "LinkedIn"
    },
    hero: {
      externalLink: "View Projects",
      externalLinkButton: "View Projects",
      contactLink: "Get in Touch",
      contactLinkButton: "Get in Touch",
    }
  },
  pt: {
    contact: {
      title: "Vamos Trabalhar Juntos",
      subtitle: "Tem um projeto em mente ou só quer conversar? Eu adoraria ouvir de você.",
      getInTouch: "Entre em Contato",
      description: "Estou sempre aberto para discutir novas oportunidades, projetos interessantes, ou apenas ter uma conversa sobre tecnologia e desenvolvimento.",
      quickResponse: "Resposta Rápida Garantida",
      quickResponseDesc: "Eu respondo normalmente a todas as consultas em até 24 horas. Ansioso para ouvir de você!",
      sendMessage: "Enviar Mensagem",
      form: {
        name: "Nome",
        namePlaceholder: "Seu nome completo",
        email: "Email",
        emailPlaceholder: "seu@email.com",
        subject: "Assunto",
        subjectPlaceholder: "Sobre o que é?",
        message: "Mensagem",
        messagePlaceholder: "Conte-me sobre seu projeto ou apenas diga olá!",
        sending: "Enviando...",
        send: "Enviar Mensagem"
      },
      validation: {
        nameRequired: "Nome é obrigatório",
        emailRequired: "Email é obrigatório",
        emailInvalid: "Por favor, insira um endereço de email válido",
        subjectRequired: "Assunto é obrigatório",
        messageRequired: "Mensagem é obrigatória",
        messageMinLength: "Mensagem deve ter pelo menos 10 caracteres"
      },
      location: "Localização",
      github: "GitHub",
      linkedin: "LinkedIn"
    },
    hero : {
      externalLink: "Ver Projetos",
      externalLinkButton: "Ver Projetos",
      contactLink: "Entre em Contato",
      contactLinkButton: "Entre em Contato",
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
