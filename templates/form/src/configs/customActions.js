import moment from 'moment';
import CONSTANTS from '../constants';
import config from '../configs/config.json';

const customActions = {
  onChange: {
    standardService: {
      generalInformation: {
        contact: onChangeContact,
        // dateFrom: setDateToMin,
      },
      signatures: {
        customerSignature: setDateCustomerSignature,
        serviceEngineerSignature: setDateServiceEngineerSignature,
      },
    },
    newMachine: {
      generalInformation: {
        contact: onChangeContact,
        // dateFrom: setDateToMin,
      },
      signatures: {
        customerSignature: setDateCustomerSignature,
        serviceEngineerSignature: setDateServiceEngineerSignature,
      },
    },
  },
  beforeChangePage,
};

function onChangeContact(data) {
  return new Promise((resolve) => {
    let newFormSchema = data.state.formSchema;
    let generalInformation = newFormSchema[0].fields;
    if (
      data.state.formData.formObject.generalInformation.contact &&
      data.state.formData.formObject.generalInformation.contact.value === 'other'
    ) {
      let otherContactName = {
        ...config.formSchema[data.state.selectedForm.value].schema[0].fields[2],
      };
      let otherContactEmail = {
        ...config.formSchema[data.state.selectedForm.value].schema[0].fields[3],
      };
      generalInformation.splice(2, 0, otherContactName, otherContactEmail);
    } else {
      if (generalInformation[2].name === 'otherContactName') {
        generalInformation.splice(2, 2);
      }
    }
    let newState = {
      ...data.state,
      formSchema: newFormSchema,
    };
    resolve(newState);
  });
}

// function setDateToMin(data) {
//   return new Promise((resolve) => {
//     let fields = data.state.formSchema[data.currentPage].fields.map((el) => {
//       if (el.name === 'dateTo') {
//         el['attrs']['minDate'] = data.values[data.field.name];
//       }
//       return el;
//     });
//     let newState = {
//       ...data.state,
//       formSchema: {
//         ...data.state.formSchema,
//         [data.currentPage]: {
//           ...data.state.formSchema[data.currentPage],
//           fields,
//         },
//       },
//     };
//     resolve(newState);
//   });
// }

function setDateCustomerSignature(data) {
  return new Promise((resolve) => {
    let newState = {
      ...data.state,
      formData: {
        ...data.state.formData,
        formObject: {
          ...data.state.formData.formObject,
          signatures: {
            ...data.state.formData.formObject.signatures,
            dateCustomerSignature: moment().format('DD/MM/YYYY'),
          },
        },
      },
    };
    resolve(newState);
  });
}

function setDateServiceEngineerSignature(data) {
  return new Promise((resolve) => {
    let newState = {
      ...data.state,
      formData: {
        ...data.state.formData,
        formObject: {
          ...data.state.formData.formObject,
          signatures: {
            ...data.state.formData.formObject.signatures,
            dateServiceEngineerSignature: moment().format('DD/MM/YYYY'),
          },
        },
      },
    };
    resolve(newState);
  });
}

function beforeChangePage(data) {
  return new Promise((resolve) => {
    if (data.currentPage === 4) {
      let detailValues = [...data.state.formData.detailObject.detailValues];
      detailValues[3].value = CONSTANTS.LITERALS.STATE[CONSTANTS.STATE.SIGNED]['en'];
      let newState = {
        ...data.state,
        formData: {
          ...data.state.formData,
          listObject: {
            ...data.state.formData.listObject,
            pos21: CONSTANTS.LITERALS.STATE[CONSTANTS.STATE.SIGNED]['en'],
          },
          detailObject: {
            ...data.state.formData.detailObject,
            detailValues,
          },
          idState: CONSTANTS.STATE.SIGNED,
        },
      };
      resolve(newState);
    } else {
      resolve();
    }
  });
}

export default customActions;
