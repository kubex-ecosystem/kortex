import { Language, TranslationKey, translations } from '../translations';

describe('Translations', () => {
  describe('Structure validation', () => {
    it('exports translations object', () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
    });

    it('has expected languages', () => {
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('pt');
    });

    it('languages have contact section', () => {
      expect(translations.en).toHaveProperty('contact');
      expect(translations.pt).toHaveProperty('contact');
    });

    it('languages have hero section', () => {
      expect(translations.en).toHaveProperty('hero');
      expect(translations.pt).toHaveProperty('hero');
    });
  });

  describe('Contact section structure', () => {
    it('has all required contact fields in English', () => {
      const contact = translations.en.contact;
      
      expect(contact).toHaveProperty('title');
      expect(contact).toHaveProperty('subtitle');
      expect(contact).toHaveProperty('getInTouch');
      expect(contact).toHaveProperty('description');
      expect(contact).toHaveProperty('quickResponse');
      expect(contact).toHaveProperty('quickResponseDesc');
      expect(contact).toHaveProperty('sendMessage');
      expect(contact).toHaveProperty('form');
      expect(contact).toHaveProperty('validation');
      expect(contact).toHaveProperty('location');
      expect(contact).toHaveProperty('github');
      expect(contact).toHaveProperty('linkedin');
    });

    it('has all required contact fields in Portuguese', () => {
      const contact = translations.pt.contact;
      
      expect(contact).toHaveProperty('title');
      expect(contact).toHaveProperty('subtitle');
      expect(contact).toHaveProperty('getInTouch');
      expect(contact).toHaveProperty('description');
      expect(contact).toHaveProperty('quickResponse');
      expect(contact).toHaveProperty('quickResponseDesc');
      expect(contact).toHaveProperty('sendMessage');
      expect(contact).toHaveProperty('form');
      expect(contact).toHaveProperty('validation');
      expect(contact).toHaveProperty('location');
      expect(contact).toHaveProperty('github');
      expect(contact).toHaveProperty('linkedin');
    });

    it('has correct form structure in English', () => {
      const form = translations.en.contact.form;
      
      expect(form).toHaveProperty('name');
      expect(form).toHaveProperty('namePlaceholder');
      expect(form).toHaveProperty('email');
      expect(form).toHaveProperty('emailPlaceholder');
      expect(form).toHaveProperty('subject');
      expect(form).toHaveProperty('subjectPlaceholder');
      expect(form).toHaveProperty('message');
      expect(form).toHaveProperty('messagePlaceholder');
      expect(form).toHaveProperty('sending');
      expect(form).toHaveProperty('send');
    });

    it('has correct form structure in Portuguese', () => {
      const form = translations.pt.contact.form;
      
      expect(form).toHaveProperty('name');
      expect(form).toHaveProperty('namePlaceholder');
      expect(form).toHaveProperty('email');
      expect(form).toHaveProperty('emailPlaceholder');
      expect(form).toHaveProperty('subject');
      expect(form).toHaveProperty('subjectPlaceholder');
      expect(form).toHaveProperty('message');
      expect(form).toHaveProperty('messagePlaceholder');
      expect(form).toHaveProperty('sending');
      expect(form).toHaveProperty('send');
    });

    it('has correct validation structure in English', () => {
      const validation = translations.en.contact.validation;
      
      expect(validation).toHaveProperty('nameRequired');
      expect(validation).toHaveProperty('emailRequired');
      expect(validation).toHaveProperty('emailInvalid');
      expect(validation).toHaveProperty('subjectRequired');
      expect(validation).toHaveProperty('messageRequired');
      expect(validation).toHaveProperty('messageMinLength');
    });

    it('has correct validation structure in Portuguese', () => {
      const validation = translations.pt.contact.validation;
      
      expect(validation).toHaveProperty('nameRequired');
      expect(validation).toHaveProperty('emailRequired');
      expect(validation).toHaveProperty('emailInvalid');
      expect(validation).toHaveProperty('subjectRequired');
      expect(validation).toHaveProperty('messageRequired');
      expect(validation).toHaveProperty('messageMinLength');
    });
  });

  describe('Hero section structure', () => {
    it('has all required hero fields in English', () => {
      const hero = translations.en.hero;
      
      expect(hero).toHaveProperty('externalLink');
      expect(hero).toHaveProperty('externalLinkButton');
      expect(hero).toHaveProperty('contactLink');
      expect(hero).toHaveProperty('contactLinkButton');
    });

    it('has all required hero fields in Portuguese', () => {
      const hero = translations.pt.hero;
      
      expect(hero).toHaveProperty('externalLink');
      expect(hero).toHaveProperty('externalLinkButton');
      expect(hero).toHaveProperty('contactLink');
      expect(hero).toHaveProperty('contactLinkButton');
    });
  });

  describe('Content validation', () => {
    it('all strings are non-empty in English', () => {
      const checkNonEmpty = (obj: any, path: string = '') => {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value, currentPath);
          }
        });
      };
      
      checkNonEmpty(translations.en);
    });

    it('all strings are non-empty in Portuguese', () => {
      const checkNonEmpty = (obj: any, path: string = '') => {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value, currentPath);
          }
        });
      };
      
      checkNonEmpty(translations.pt);
    });

    it('contact titles are different between languages', () => {
      expect(translations.en.contact.title).not.toBe(translations.pt.contact.title);
      expect(translations.en.contact.title).toBe("Let's Work Together");
      expect(translations.pt.contact.title).toBe("Vamos Trabalhar Juntos");
    });

    it('hero links are different between languages', () => {
      expect(translations.en.hero.externalLink).not.toBe(translations.pt.hero.externalLink);
      expect(translations.en.hero.externalLink).toBe("View Projects");
      expect(translations.pt.hero.externalLink).toBe("Ver Projetos");
    });

    it('form validation messages are different between languages', () => {
      expect(translations.en.contact.validation.nameRequired).not.toBe(translations.pt.contact.validation.nameRequired);
      expect(translations.en.contact.validation.nameRequired).toBe("Name is required");
      expect(translations.pt.contact.validation.nameRequired).toBe("Nome é obrigatório");
    });
  });

  describe('Structure consistency', () => {
    it('both languages have the same structure', () => {
      const getStructure = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) {
          return typeof obj;
        }
        
        const structure: any = {};
        Object.keys(obj).forEach(key => {
          structure[key] = getStructure(obj[key]);
        });
        return structure;
      };
      
      const enStructure = getStructure(translations.en);
      const ptStructure = getStructure(translations.pt);
      
      expect(enStructure).toEqual(ptStructure);
    });

    it('both languages have same number of keys at root level', () => {
      const enKeys = Object.keys(translations.en);
      const ptKeys = Object.keys(translations.pt);
      
      expect(enKeys.length).toBe(ptKeys.length);
      expect(enKeys.sort()).toEqual(ptKeys.sort());
    });

    it('contact sections have same number of properties', () => {
      const enContactKeys = Object.keys(translations.en.contact);
      const ptContactKeys = Object.keys(translations.pt.contact);
      
      expect(enContactKeys.length).toBe(ptContactKeys.length);
      expect(enContactKeys.sort()).toEqual(ptContactKeys.sort());
    });

    it('hero sections have same number of properties', () => {
      const enHeroKeys = Object.keys(translations.en.hero);
      const ptHeroKeys = Object.keys(translations.pt.hero);
      
      expect(enHeroKeys.length).toBe(ptHeroKeys.length);
      expect(enHeroKeys.sort()).toEqual(ptHeroKeys.sort());
    });
  });

  describe('Type exports', () => {
    it('Language type includes expected languages', () => {
      // This is more of a compile-time check, but we can verify the structure
      const languages: Language[] = ['en', 'pt'];
      
      languages.forEach(lang => {
        expect(translations).toHaveProperty(lang);
      });
    });

    it('TranslationKey type reflects actual structure', () => {
      // Verify that the actual structure matches what TypeScript expects
      const translationKeys: TranslationKey[] = ['contact', 'hero'];
      
      translationKeys.forEach(key => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.pt).toHaveProperty(key);
      });
    });
  });

  describe('Email placeholders', () => {
    it('both languages use same email format in placeholders', () => {
      expect(translations.en.contact.form.emailPlaceholder).toBe('your@email.com');
      expect(translations.pt.contact.form.emailPlaceholder).toBe('seu@email.com');
    });
  });

  describe('Social links consistency', () => {
    it('social media names are consistent across languages', () => {
      expect(translations.en.contact.github).toBe('GitHub');
      expect(translations.pt.contact.github).toBe('GitHub');
      expect(translations.en.contact.linkedin).toBe('LinkedIn');
      expect(translations.pt.contact.linkedin).toBe('LinkedIn');
    });
  });
});
