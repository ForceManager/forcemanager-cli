const data = {
  formStates: [
    {
      checked: false,
      extraFields: {},
      value: 1,
      label: 'Draft',
    },
    {
      checked: false,
      extraFields: {},
      value: 2,
      label: 'Signed',
    },
    {
      checked: false,
      extraFields: {},
      value: 3,
      label: 'Finished',
    },
  ],
  initDataCreation: {
    account: {
      name: 'Fortius Canada ',
      id: 456,
    },
    user: {
      username: 'test@marchesiniusad',
      id: 109,
      name: 'Test',
      lang: 'en',
      langDB: 'en',
      locale: 'en-US',
    },
    endState: 2,
    idState: 1,
    isReadonly: false,
    mode: 'creation',
    platform: 'dev',
    form: {},
  },
  initDataEditionDraft: '',
  initDataEditionSigned: '',
  initDataEditionFinished: '',
};

const localBridge = {
  getFormStates: function() {
    return data.formStates;
  },
  getFormInitData: function() {
    return data.initDataCreation;
  },
};

export default localBridge;
