const CONSTANTS = {
  STATE: {
    DRAFT: 1,
    SIGNED: 2,
    FINISHED: 3,
  },
  ENTITY: {
    COMPANY: 1,
    CONTACT: 2,
    USER: 12,
  },
  LITERALS: {
    STATE: {
      1: { en: 'Draft' },
      2: { en: 'Signed' },
    },

    ENTITY: {
      1: { en: 'Company' },
      2: { en: 'Contact' },
      12: { en: 'User' },
    },
  },
};

export default CONSTANTS;
