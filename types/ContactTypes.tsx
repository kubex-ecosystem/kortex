
export type ContactFormStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type ContactFormType = 'general' | 'support' | 'feedback' | 'bug_report';
export type ContactFormPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormEntry {
  id: string;
  status: ContactFormStatus;
  type: ContactFormType;
  priority: ContactFormPriority;
  createdAt: string;
  updatedAt: string;
  contactForm: ContactForm;
}

export interface ContactFormContextType {
  contactForms: ContactFormEntry[];
  isLoading: boolean;
  error: string | null;
  addContactForm: (form: ContactForm) => void;
  updateContactForm: (id: string, updates: Partial<ContactFormEntry>) => void;
  deleteContactForm: (id: string) => void;
  markContactFormResolved: (id: string) => void;
}

export interface ContactFormServiceConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
}

