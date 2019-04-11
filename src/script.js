let domEl;
let name = '{{name}}';
let context = {
  platform: 'dev',
  type: '{{type}}',
  widgetType: '{{widgetType}}',
};
let fmDevData = localStorage.getItem('fmDevData') || {};
let devData;
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
  console.log('fmDevData', fmDevData);
  devData = fmDevData[name] || {};
} catch (error) {
  console.warn(error);
  devData = {};
}
context['entity'] = devData.entity || '';
context['entityId'] = devData.entityId || '';
context['userData'] = devData.userData || userDataTemplate;

window.onload = function() {
  document.getElementById('dev-body').style.display = 'flex';
  document.getElementById('input-title').value = devData.title || '';
  document.getElementById('widget-title').innerHTML = devData.title || '';
  document.getElementById('public-key').value = devData.publicKey || '';
  document.getElementById('user-data').innerHTML = JSON.stringify(context.userData);
  document.getElementById('entity-id').value = context.entityId;
  if (context.entity) {
    document.getElementById(`entity-${context.entity}`).checked = true;
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
      break;
    case 'form':
      document.getElementById('form').style.display = 'block';
      document.getElementById('widget').outerHTML = '';
      document.getElementById('page').outerHTML = '';
      domEl = 'form-content';
      context['form'] = {
        entityForm: null,
        mode: 'creation',
        isReadonly: false,
        idState: -1,
        endState: 0,
      };
      break;
    case 'page':
      document.getElementById('form').outerHTML = '';
      document.getElementById('widget').outerHTML = '';
      document.getElementById('page').style.display = 'block';
      domEl = 'page-content';
      break;
  }
  let panel = document.getElementById('config-panel');
  if (context.entity && devData.logged) {
    window.FmBridgeBackend.setContext(context);
    window.FmBridgeBackend.init();
    window.FmBridgeBackend.loadFragment(name, 'http://localhost:{{port}}', domEl);
  } else if (!context.entity) {
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
        // location.reload();
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
  let entities = document.getElementsByName('entity');
  let cols = document.getElementsByName('column');
  let rows = document.getElementsByName('row');
  check(entities, 'entity');
  check(cols, 'columns');
  check(rows, 'rows');
  function check(elements, name) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].checked) {
        devData[name] = elements[i].value;
      }
    }
  }
  devData.title = document.getElementById('input-title').value;
  devData.entityId = document.getElementById('entity-id').value;
  devData.userData = JSON.parse(document.getElementById('user-data').innerHTML);
  fmDevData[name] = devData;
  localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
  location.reload();
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

  expiredDevLoginToken() {
    console.log('expiredDevLoginToken');
    devData.logged = false;
    fmDevData[name] = devData;
    localStorage.setItem('fmDevData', JSON.stringify(fmDevData));
    location.reload();
  },
};

function confirmDialog(res) {
  window.dispatchEvent(
    new CustomEvent('showConfirmDialogResponse', {
      detail: { callbackId: dialogId, response: res },
    }),
  );
}

function signature(res) {
  if (res === 'OK') {
    window.dispatchEvent(
      new CustomEvent('signatureResponse', {
        detail: {
          callbackId: signatureId,
          response:
            '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',
        },
      }),
    );
  } else {
    document.getElementById('signature').classList.remove('show');
  }
}
