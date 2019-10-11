import moment from 'moment';

const customValidations = {
  onFinish,
  biggerThanDateFrom,
  biggerThanHourFrom,
  biggerThanDepart,
  biggerThanEndDepart,
};

function onFinish(data) {
  return new Promise((resolve, reject) => {
    resolve();
    // reject({ type: 'validationError', msg: 'validationError'});
  });
}

function biggerThanDateFrom(data) {
  let result;
  const generalInformation = data.formData.formObject.generalInformation;
  if (
    generalInformation.dateFrom &&
    generalInformation.dateTo &&
    moment(generalInformation.dateFrom, 'MM/DD/YYYY') >
      moment(generalInformation.dateTo, 'MM/DD/YYYY')
  ) {
    result = { allValid: false, error: 'Date should be bigger than "Date from"' };
  }
  return result;
}

function biggerThanHourFrom(data) {
  let result;
  const timeAllocationTable =
    data.formData.formObject.timeAllocationTable.timeAllocationTable[data.parentIndex];
  if (
    timeAllocationTable.hourFrom &&
    timeAllocationTable.hourTo &&
    moment(timeAllocationTable.hourFrom, 'HH:mm A') > moment(timeAllocationTable.hourTo, 'HH:mm A')
  ) {
    result = { allValid: false, error: 'Hour should be bigger than "Hour from"' };
  }
  return result;
}

function biggerThanDepart(data) {
  let result;
  const generalInformation = data.formData.formObject.generalInformation;
  if (
    generalInformation.departFromMarchesini &&
    generalInformation.arriveToCustomer &&
    moment(generalInformation.departFromMarchesini, 'MM/DD/YYYY HH:mm A') >
      moment(generalInformation.arriveToCustomer, 'MM/DD/YYYY HH:mm A')
  ) {
    result = { allValid: false, error: 'Should be later than "Depart"' };
  }
  return result;
}

function biggerThanEndDepart(data) {
  let result;
  const generalInformationEnd = data.formData.formObject.generalInformationEnd;
  const generalInformationEnd2 = data.formData.formObject.generalInformationEnd2;
  if (
    generalInformationEnd.departFromCustomer &&
    generalInformationEnd2.arriveToMarchesini &&
    moment(generalInformationEnd.departFromCustomer, 'MM/DD/YYYY HH:mm A') >
      moment(generalInformationEnd2.arriveToMarchesini, 'MM/DD/YYYY HH:mm A')
  ) {
    result = { allValid: false, error: 'Should be later than "Depart"' };
  }
  return result;
}

export default customValidations;
