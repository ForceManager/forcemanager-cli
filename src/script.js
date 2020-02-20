let domEl;
let name = '{{name}}';
let context = {
  platform: 'dev',
  type: '{{type}}',
  widgetType: '{{widgetType}}',
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
  idUsuario: 000,
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
try {
  fmDevData = JSON.parse(fmDevData);
  devData = fmDevData[name] || {};
} catch (error) {
  console.warn(error);
  devData = {};
}
context['entityType'] = devData.entityType || '';
context['entity'] = { id: (devData.entity && devData.entity.id) || '' };
context['userData'] = devData.userData || userDataTemplate;
context['formId'] = devData.formId || '';

window.onload = function() {
  document.getElementById('dev-body').style.display = 'flex';
  document.getElementById('input-title').value = devData.title || '';
  document.getElementById('widget-title').innerHTML = devData.title || '';
  document.getElementById('public-key').value = devData.publicKey || '';
  document.getElementById('user-data').innerHTML = JSON.stringify(context.userData);
  document.getElementById('entity-id').value = context.entity.id;
  document.getElementById('form-id').value = context.formId;
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
      document.getElementById('form').style.display = 'block';
      document.getElementById('widget').outerHTML = '';
      document.getElementById('page').outerHTML = '';
      domEl = 'form-content';
      context = {
        ...context,
        entityForm: null,
        entityType: { id: 2 },
        mode: context.formId ? 'edition' : 'creation',
        isReadonly: false,
        idState: -1,
        endState: 0,
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

  if (options && devData.logged) {
    window.FmBridgeBackend.setContext(context);
    window.FmBridgeBackend.init();
    window.FmBridgeBackend.loadFragment(name, 'http://localhost:{{port}}', domEl);
  } else if (!options) {
    console.log('No entity set');
    document.getElementById('label-entity').classList.add('error');
    panel.classList.toggle('show');
  } else if (!devData.logged) {
    console.log('Not logged in');
    panel.classList.toggle('show');
    selctTab(null, 'login-tab');
  }
  // Get form's DOM object
  let login = document.getElementById('login');
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    let privateKey = document.getElementById('private-key').value;
    let publicKey = document.getElementById('public-key').value;
    window.FmBridgeBackend.getDevLoginToken(name, publicKey, privateKey)
      .then(function() {
        console.log('getDevLoginToken OK');
        if (window.PasswordCredential) {
          var c = new PasswordCredential(e.target);
          navigator.credentials.store(c);
        }
        devData.logged = true;
        fmDevData[name] = devData;
        localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
        location.reload();
      })
      .catch(function(err) {
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
  fmDevData[name] = devData;
  localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
  location.reload();
}

function getSelectedValue(elements) {
  let selectedElement = Array.from(elements).find(function(el) {
    return el.checked;
  });
  if (!selectedElement.value) return;
  return parseInt(selectedElement.value, 10);
}

function toggleConfig() {
  let panel = document.getElementById('config-panel');
  panel.classList.toggle('show');
}

var dialogId;
var signatureId;

window.fmDevFunctions = {
  setTitle(title) {
    document.getElementById('form-title').innerHTML = title;
  },

  collapseImagesView() {
    document.getElementById('form-camera-images').classList.add('collapse');
  },

  expandImagesView() {
    document.getElementById('form-camera-images').classList.remove('collapse');
  },

  showCameraImages() {
    document.getElementById('form-camera-images').classList.add('show');
  },

  hideCameraImages() {
    document.getElementById('form-camera-images').classList.remove('show');
  },

  showLoading() {
    document.getElementById('loader').classList.add('show');
  },

  hideLoading() {
    document.getElementById('loader').classList.remove('show');
  },

  showConfirmDialog(id, message, btnOkStr, btnKOStr) {
    document.getElementById('confirm-dialog-msg').innerHTML = message;
    document.getElementById('confirm-dialog-button-ko').innerHTML = btnKOStr;
    document.getElementById('confirm-dialog-button-ok').innerHTML = btnOkStr;
    document.getElementById('confirm-dialog').classList.add('show');
    dialogId = id;
  },

  hideConfirmDialog() {
    document.getElementById('confirm-dialog').classList.remove('show');
  },

  showAlertDialog(id, message, btnOk) {
    document.getElementById('alert-dialog-msg').innerHTML = message;
    document.getElementById('alert-dialog-button').innerHTML = btnOk;
    document.getElementById('alert-dialog').classList.add('show');
    dialogId = id;
  },

  hideAlertDialog() {
    document.getElementById('alert-dialog').classList.remove('show');
  },

  showAlertDialog(id, message, btnOk) {
    document.getElementById('alert-dialog-msg').innerHTML = message;
    document.getElementById('alert-dialog-button').innerHTML = btnOk;
    document.getElementById('alert-dialog').classList.add('show');
    dialogId = id;
  },

  hideAlertDialog() {
    document.getElementById('alert-dialog').classList.remove('show');
  },

  showSignatureView(id, background) {
    document.getElementById('signature-canvas').style.backgroundColor = background;
    document.getElementById('signature').classList.add('show');
    signatureId = id;
  },

  hideSignatureView() {
    document.getElementById('signature').classList.remove('show');
  },

  showDatePicker(date, dateMax, dateMin) {
    document.getElementById('date-picker').classList.add('show');
  },

  hideDatePicker() {
    document.getElementById('date-picker').classList.remove('show');
  },

  expiredDevLoginToken() {
    console.log('expiredDevLoginToken');
    devData.logged = false;
    fmDevData[name] = devData;
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
  } else {
    window.fmDevFunctions.hideDatePicker();
  }
}

function confirmDialog(res) {
  window.dispatchEvent(
    new CustomEvent('showConfirmDialogResponse', {
      detail: { callbackId: dialogId, response: res },
    }),
  );
}

function signature(res) {
  console.log('signature', res);
  if (res === 'OK') {
    window.dispatchEvent(
      new CustomEvent('signatureResponse', {
        detail: {
          callbackId: signatureId,
          response:
            'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAyKADAAQAAAABAAAAyAAAAACbWz2VAAAAHGlET1QAAAACAAAAAAAAAGQAAAAoAAAAZAAAAGQAAAJPgoj4cgAAAhtJREFUeAHs0rGNg1AURUFI3CcdUgfuCa+1SBs48UfiBCuGCOSnGxzP9PIoEBSYgk2TCrzAgiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQAK8lqFCwGkgJgJVmNgsVAUgCsJKtRsBhICoCVZDUKFgNJAbCSrEbBYiApAFaS1ShYDCQFwEqyGgWLgaQAWElWo2AxkBQA68qs+74fc38vV67/qy2wLv67kDqCgnUxrPccW+8IYF0P62Pxns7A+mBw4vOeYgYDgTUY6svZ8/mcfp95npdlOa7vLA+sL2IGf9627YD1eDzWdQULrEE5zs4VAOtcL9eDBcAaDOXsXAGwzvVyPVjgBwAA//+izC9MAAAByElEQVTt0jENAAAMw7DxJ92hyOcC6BH5ZgoEBS74dKnAwIIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktUpWAwkBcBKsjoFi4GkAFhJVqdgMZAUACvJ6hQsBpICYCVZnYLFQFIArCSrU7AYSAqAlWR1ChYDSQGwkqxOwWIgKQBWktXpAyz18JzV7aRVAAAAAElFTkSuQmCC',
        },
      }),
    );
  } else {
    window.fmDevFunctions.hideSignatureView();
  }
}
