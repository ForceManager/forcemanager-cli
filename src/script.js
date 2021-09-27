let domEl;
let guid = '{{name}}';
let context = {
  platform: 'dev',
  type: '{{type}}',
  widgetType: '{{widgetType}}',
  cfmToken: localStorage.getItem('beCfmDevToken') || null,
  cfmBaseUrl: 'https://be-cfm.forcemanager.net/api',
};
let fmDevData = localStorage.getItem('fmDevData') || {};
let devData;
let options;
let userDataTemplate = {
  nic: 'User Test',
  nombre: 'User',
  apellidos: 'Test',
  email: 'usertest',
  movil: '000000000',
  idUsuario: 0,
  currencySymbol: '$',
  currencyId: 2,
  currencyISO: 'USD',
  langISOInterface: 'en',
  langISODDBB: 'en',
  locale: 'en-GB',
  defaultCountryId: 69,
  idEntorno: 17,
  idTimeZone: 29,
  longUserDateFormat: 'dd MMMM yyyy',
  shortUserDateFormat: 'dd/MM/yyyy',
  userLatitude: '45.5642676',
  userLongitude: '12.4276579',
  user: 'usertest',
  lengthSystem: 'metric',
};
let formTemplates;
try {
  fmDevData = JSON.parse(fmDevData);
  devData = fmDevData[guid] || {};
} catch (error) {
  console.warn(error);
  devData = {};
}
context['entityType'] = devData.entityType || '';
context['entity'] = { id: (devData.entity && devData.entity.id) || '' };
context['userData'] = devData.userData || userDataTemplate;
context['form'] = { id: devData.formId || null };

window.onload = function () {
  document.getElementById('dev-body').style.display = 'flex';
  document.getElementById('input-title').value = devData.title || '';
  document.getElementById('widget-title').innerHTML = devData.title || '';
  document.getElementById('username').value = devData.username || '';
  document.getElementById('user-data').innerHTML = JSON.stringify(context.userData);
  document.getElementById('entity-id').value = context.entity.id;
  document.getElementById('form-id').value = context.form.id || '';
  document.getElementById('implementation').value = devData.implementation || '';
  if (context.entityType && context.entityType.id) {
    document.getElementById(`entity-${context.entityType.id}`).checked = true;
  }
  if (devData.columns) {
    document.getElementById(`columns-${devData.columns}`).checked = true;
  }
  if (devData.rows) {
    document.getElementById(`rows-${devData.rows}`).checked = true;
  }

  window.scrollTo(0, 0);
  switch (context.type) {
    case 'widget':
      let widget = document.getElementById('widget');
      widget.classList.add('show', `widget-col-${devData.columns}`, `widget-row-${devData.rows}`);
      document.getElementById('form').outerHTML = '';
      document.getElementById('page').outerHTML = '';
      domEl = 'widget-content';
      options = context.entityType && context.entityType.id && context.entity && context.entity.id;
      break;
    case 'form':
      //document.getElementById('form').style.display = 'block';
      document.getElementById('widget').outerHTML = '';
      document.getElementById('page').outerHTML = '';
      domEl = 'form-content';
      context = {
        ...context,
        entityForm: null,
        entityType: { id: 2 },
        mode: context.form.id ? 'edition' : 'creation',
        isReadonly: false,
        idState: -1,
        endState: 0,
        //TEST
        //form: { formTemplate: { id: 1 } },
      };
      options = true;
      break;
    case 'page':
      document.getElementById('form').outerHTML = '';
      document.getElementById('widget').outerHTML = '';
      document.getElementById('page').style.display = 'block';
      domEl = 'page-content';
      options = true;
      break;
  }
  let panel = document.getElementById('config-panel');

  if (!options) {
    console.log('No entity set');
    document.getElementById('label-entity').classList.add('error');
    panel.classList.toggle('show');
  } else if (options && context.cfmToken) {
    window.FmBridgeBackend.setContext(context)
      .then(() => getExternalKeys())
      .then(({ publicKey, secretKey }) => externalLogin(publicKey, secretKey))
      .then((res) => {
        devData.externalToken = res;
        return window.FmBridgeBackend.init();
      })
      .then(() => window.FmBridgeBackend.getFormTemplates())
      .then((templates) => {
        if (context.type === 'form') {
          formTemplates = Object.keys(templates)
            .filter((key) => templates[key].z_campoextra3 === -1)
            .map((key) => ({
              ...templates[key],
            }));
          if (formTemplates.length < 1) {
            // si no hay template (?)
          } else if (formTemplates.length === 1) {
            // si solo hay un template activo, lo selecciono directamente
            context.form.formTemplate = formTemplates[0];
          } else {
            // si hay varios templates, muestro selector para escoger
            showTemplate();
          }
        }
        //.then(() => {
        return window.FmBridgeBackend.setActions(actions);
      })
      .then(() => window.FmBridgeBackend.loadFragment(guid, 'http://localhost:{{port}}', domEl))
      .catch(console.warn);
  } else if (options && !context.cfmToken) {
    console.log('Not logged in');
    panel.classList.toggle('show');
    selctTab(null, 'login-tab');
  }

  function cfmLogin(username, password) {
    return new Promise((resolve, reject) => {
      window.FmBridgeBackend.setContext(context)
        .then(() => window.FmBridgeBackend.cfmLogin(username, password))
        .then(({ data }) => resolve(data.token))
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            console.log('Wrong user or password');
            reject(err);
          } else if (err.response && err.response.status === 401) {
            console.log('Expired token');
            localStorage.setItem('cfmTokenDev', null);
            reject(err);
          } else {
            reject(err);
          }
        });
    });
  }

  function changeImplementation() {
    return new Promise((resolve, reject) => {
      window.FmBridgeBackend.changeImplementation(context.cfmToken, devData.implementation)
        .then(({ data }) => {
          localStorage.setItem('beCfmDevToken', data.token);
          resolve();
        })
        .catch(reject);
    });
  }

  function getExternalKeys() {
    return new Promise((resolve, reject) => {
      window.FmBridgeBackend.getExternalKeys(context.cfmToken)
        .then(({ data }) => {
          if (data) {
            const fmFragmentsKeys = data.find((el) => el.name === 'fm-fragments');
            if (!fmFragmentsKeys) {
              reject({
                code: 'no-fragments-keys',
                message: 'No fm-fragments keys found in FM CLI getExternalKeys response',
              });
            } else {
              resolve(fmFragmentsKeys);
            }
          } else {
            reject({
              code: 'error-getting-keys',
              message: 'Error getting keys in FM CLI getExternalKeys',
            });
          }
        })
        .catch(reject);
    });
  }

  function externalLogin(publicKey, privateKey) {
    return new Promise((resolve, reject) => {
      window.FmBridgeBackend.externalLogin(publicKey, privateKey)
        .then((res) => {
          if (res.data.token) localStorage.setItem(`fmFragmentToken-${guid}`, res.data.token);
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  // Get form's DOM object
  let login = document.getElementById('login');
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('label-entity').classList.remove('error');
    devData.implementation = document.getElementById('implementation').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    if (!devData.implementation) {
      document.getElementById('label-entity').classList.add('error');
      return;
    }
    cfmLogin(username, password)
      .then(function (token) {
        if (window.PasswordCredential) {
          // var c = new PasswordCredential(e.target);
          // navigator.credentials.store(c);
        }
        context.cfmToken = token;
        return changeImplementation();
      })
      .then(function () {
        location.reload();
      })
      .catch(function (err) {
        console.warn(err);
      });
  });
};

function selctTab(event, tabId = null) {
  let tab;
  if (!tabId && event && event.target.className.includes('selected')) {
    return;
  } else if (tabId) {
    tab = tabId;
  } else {
    tab = event.target.id;
  }
  document.querySelectorAll('.config-panel-tab.selected')[0].classList.remove('selected');
  document.querySelectorAll('.config-panel-tab-content.selected')[0].classList.remove('selected');
  document.getElementById(tab).classList.add('selected');
  document.getElementById(`${tab}-content`).classList.add('selected');
}

function onSave() {
  devData.title = document.getElementById('input-title').value;
  devData.entity = { id: parseInt(document.getElementById('entity-id').value, 10) };
  devData.userData = JSON.parse(document.getElementById('user-data').innerHTML);
  if (context.type === 'widget') {
    devData.entityType = { id: getSelectedValue(document.getElementsByName('entityType')) };
    devData.columns = getSelectedValue(document.getElementsByName('column'));
    devData.rows = getSelectedValue(document.getElementsByName('row'));
  }
  if (context.type === 'form') {
    devData.formId = document.getElementById('form-id').value;
  }
  fmDevData[guid] = devData;
  localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
  location.reload();
}

function getSelectedValue(elements) {
  let selectedElement = Array.from(elements).find(function (el) {
    return el.checked;
  });
  if (!selectedElement.value) return;
  return parseInt(selectedElement.value, 10);
}

function toggleConfig() {
  let panel = document.getElementById('config-panel');
  panel.classList.toggle('show');
}

let dialogId;
let signatureId;

let actions = {
  finishActivity() {
    location.reload();
  },

  saveData(id) {
    if (id) {
      context.form.id = id;
      window.FmBridgeBackend.setContext(context);
    }
  },

  setTitle(title) {
    document.getElementById('form-title').innerHTML = title;
  },

  openSignatureView(id, background) {
    document.getElementById('signature-canvas').style.backgroundColor = background;
    document.getElementById('signature').classList.add('show');
    signatureId = id;
  },

  showCameraImages() {
    document.getElementById('form-camera-images').classList.add('show');
  },

  hideCameraImages() {
    document.getElementById('form-camera-images').classList.remove('show');
  },

  expandImagesView() {
    document.getElementById('form-camera-images').classList.remove('collapse');
  },
  collapseImagesView() {
    document.getElementById('form-camera-images').classList.add('collapse');
  },

  showLoading() {
    document.getElementById('loader').classList.add('show');
  },

  hideLoading() {
    document.getElementById('loader').classList.remove('show');
  },

  showAlertDialog(id, message, btnOk) {
    document.getElementById('alert-dialog-msg').innerHTML = message;
    document.getElementById('alert-dialog-button').innerHTML = btnOk;
    document.getElementById('alert-dialog').classList.add('show');
    dialogId = id;
  },

  showConfirmDialog(id, message, btnOkStr, btnKOStr) {
    document.getElementById('confirm-dialog-msg').innerHTML = message;
    document.getElementById('confirm-dialog-button-ko').innerHTML = btnKOStr;
    document.getElementById('confirm-dialog-button-ok').innerHTML = btnOkStr;
    document.getElementById('confirm-dialog').classList.add('show');
    dialogId = id;
  },

  // showDatePicker(date, dateMax, dateMin) {
  //   document.getElementById('date-picker').classList.add('show');
  // },

  expiredDevLoginToken() {
    console.log('expiredDevLoginToken');
    devData.logged = false;
    fmDevData[guid] = devData;
    localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
    location.reload();
  },
};

function datePicker(res) {
  if (res === 'OK') {
    window.dispatchEvent(
      new CustomEvent('openDatePicker', {
        detail: { response: new Date().getTime() },
      }),
    );
  }
  document.getElementById('date-picker').classList.remove('show');
}

function confirmDialog(res) {
  window.dispatchEvent(
    new CustomEvent('showConfirmDialogResponse', {
      detail: { callbackId: dialogId, response: res },
    }),
  );
  document.getElementById('confirm-dialog').classList.remove('show');
  // document.getElementById('alert-dialog').classList.remove('show');
}

function signature(res) {
  console.log('signature', res);
  if (res === 'OK') {
    window.dispatchEvent(
      new CustomEvent('openSignatureView', {
        detail: {
          callbackId: signatureId,
          response:
            'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAyKADAAQAAAABAAAAyAAAAACbWz2VAAAAHGlET1QAAAACAAAAAAAAAGQAAAAoAAAAZAAAAGQAAAJPgoj4cgAAAhtJREFUeAHs0rGNg1AURUFI3CcdUgfuCa+1SBs48UfiBCuGCOSnGxzP9PIoEBSYgk2TCrzAgiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQA68qs+74fc38vV67/qy2wLv67kDqCgnUxrPccW+8IYF0P62Pxns7A+mBw4vOeYgYDgTUY6svZ8/mcfp95npdlOa7vLA+sL2IGf9627YD1eDzWdQULrEE5zs4VAOtcL9eDBcAaDOXsXAGwzvVyPVjgBwAA//+izC9MAAAByElEQVTt0jENAAAMw7DxJ92hyOcC6BH5ZgoEBS74dKnAwIIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktXpAyz18JzV7aRVAAAAAElFTkSuQmCC',
        },
      }),
    );
  }
  document.getElementById('signature').classList.remove('show');
}

function showTemplate() {
  console.log('show template');
  var test = document.getElementById('form-template');
  // Muestro selector
  document.getElementById('form-template').classList.remove('hide');
  document.getElementById('form-template').classList.add('show');
  // Añado opciones
  let selector = document.getElementById('templates');
  formTemplates.forEach((element) => {
    let opt = document.createElement('option');
    opt.value = element.id;
    opt.text = element.description;
    selector.add(opt, null);
  });
}

function hideTemplate() {
  document.getElementById('form-template').classList.remove('show');
  domEl = 'form-content';
}
/** Función que se ejecuta al seleccionar una opción del selector */
function setTemplate() {
  let templateSelectedID = document.getElementById('templates').value;
  const templateSelected = formTemplates.filter((element) => element.id === +templateSelectedID);
  context.form.formTemplate = templateSelected[0];
  hideTemplate();
}
