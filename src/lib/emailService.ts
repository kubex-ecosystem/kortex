import { ContactForm } from '../types';
import { translations } from './translations';

export const emailService = {
  async sendContactForm(formData: ContactForm, language: 'en' | 'pt' = 'en'): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar mensagem');
      }

      return {
        success: true,
        message: result.message || 'Mensagem enviada com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.',
      };
    }
  },

  validateForm(formData: ContactForm, language: 'en' | 'pt' = 'en'): { isValid: boolean; errors: Partial<ContactForm> } {
    const errors: Partial<ContactForm> = {};
    const t = translations[language].contact.validation;

    if (!formData.name.trim()) {
      errors.name = t.nameRequired;
    }

    if (!formData.email.trim()) {
      errors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t.emailInvalid;
    }

    if (!formData.subject.trim()) {
      errors.subject = t.subjectRequired;
    }

    if (!formData.message.trim()) {
      errors.message = t.messageRequired;
    } else if (formData.message.length < 10) {
      errors.message = t.messageMinLength;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

