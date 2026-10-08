const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'test_updated_index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const lastScriptStart = html.lastIndexOf('<script>');
const lastScriptEnd = html.lastIndexOf('</script>');
const mainScript = html.slice(lastScriptStart + 8, lastScriptEnd);

const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.sessionStorage = {
  clear: () => {}
};

function createMockElement(id = '') {
  const classes = new Set();
  return {
    id,
    value: '',
    checked: false,
    src: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    className: '',
    classList: {
      add: (...cls) => { cls.forEach(c => classes.add(c)); },
      remove: (...cls) => { cls.forEach(c => classes.delete(c)); },
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        } else if (force) classes.add(c);
        else classes.delete(c);
      },
      contains: (c) => classes.has(c)
    },
    setAttribute: () => {},
    getAttribute: (attr) => attr === 'src' ? 'logo.png' : '',
    scrollIntoView: () => {},
    appendChild: () => {},
    remove: () => {},
    reset: () => {}
  };
}

const domElements = {
  'nav-links': createMockElement('nav-links'),
  'nav-user-area': createMockElement('nav-user-area'),
  'app-viewport': createMockElement('app-viewport'),
  'toast-container': createMockElement('toast-container'),
  'login-email': createMockElement('login-email'),
  'login-password': createMockElement('login-password'),
  'new-pass': createMockElement('new-pass'),
  'confirm-pass': createMockElement('confirm-pass'),
  'chk-name': createMockElement('chk-name'),
  'chk-email': createMockElement('chk-email'),
  'inst-name': createMockElement('inst-name'),
  'inst-school': createMockElement('inst-school'),
  'inst-email': createMockElement('inst-email'),
  'inst-pass': createMockElement('inst-pass'),
  'modal-quick-whatsapp': createMockElement('modal-quick-whatsapp'),
  'quick-wa-phone': createMockElement('quick-wa-phone'),
  'quick-wa-message': createMockElement('quick-wa-message'),
  'quick-wa-char-count': createMockElement('quick-wa-char-count'),
  'quick-wa-recipient-info': createMockElement('quick-wa-recipient-info'),
  'broadcast-message-text': createMockElement('broadcast-message-text'),
  'broadcast-char-counter': createMockElement('broadcast-char-counter'),
  'whatsapp-preview-bubble-text': createMockElement('whatsapp-preview-bubble-text'),
  'whatsapp-preview-time': createMockElement('whatsapp-preview-time')
};

global.document = {
  body: { classList: { add: () => {}, remove: () => {} } },
  getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
  createElement: (tag) => createMockElement(tag),
  querySelectorAll: () => [],
  querySelector: () => null
};

global.window = {
  scrollTo: () => {},
  addEventListener: () => {},
  print: () => { global._printed = true; },
  location: { origin: 'http://localhost:3000', pathname: '/' },
  open: (url) => { global._lastOpenedUrl = url; },
  supabase: {
    createClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      })
    })
  }
};

global.navigator = {
  clipboard: {
    writeText: (t) => { global._clipboard = t; return Promise.resolve(); }
  }
};

global.lucide = {
  createIcons: () => {}
};

eval(mainScript + '; global.getCurrentUser = () => currentUser; global.getState = () => state; global.renderHeader = renderHeader; global.navigateTo = navigateTo; global.logout = logout; global.handleLogin = handleLogin; global.initApp = initApp; global.handleCheckoutSimulate = handleCheckoutSimulate; global.handlePasswordChange = handlePasswordChange; global.handleInstructorRegister = handleInstructorRegister; global.handleAdminPasswordRenew = handleAdminPasswordRenew; global.toggleLessonComplete = toggleLessonComplete; global.switchAdminTab = switchAdminTab; global.setCrmFunnelFilter = setCrmFunnelFilter; global.openQuickWhatsAppModal = openQuickWhatsAppModal; global.closeQuickWhatsAppModal = closeQuickWhatsAppModal; global.setQuickMessageTemplate = setQuickMessageTemplate; global.openInWhatsAppWebDirect = openInWhatsAppWebDirect; global.handleBroadcastMessageInput = handleBroadcastMessageInput; global.startWhatsAppBroadcast = startWhatsAppBroadcast; global.handleSaveWhatsAppConfig = handleSaveWhatsAppConfig; global.handleTestWhatsAppConnection = handleTestWhatsAppConnection;');

console.log('Script evaluated successfully! Testing Test 3 (SaaS Freeze & SuperAdmin)...');

// Test 1: Original test suite
initApp();
navigateTo('creator');
const creatorHtml = domElements['app-viewport'].innerHTML;
const hasSaaSPromise = creatorHtml.includes('89,90') && (creatorHtml.includes('0% de comissão') || creatorHtml.includes('comissões'));

navigateTo('superadmin');
const adminHtml = domElements['app-viewport'].innerHTML;
const hasFreezeManagement = adminHtml.includes('Inadimplentes (Congelados)') && adminHtml.includes('Congelar Escola');

console.log('hasSaaSPromise:', hasSaaSPromise);
console.log('hasFreezeManagement:', hasFreezeManagement);

if (hasSaaSPromise && hasFreezeManagement) {
  console.log('✅ TEST 3 PASSED!');
} else {
  console.error('❌ TEST 3 FAILED!');
  process.exit(1);
}

// Test Admin Tabs
console.log('Testing Admin Tabs...');
switchAdminTab('crm');
let htmlCrm = domElements['app-viewport'].innerHTML;
console.log('CRM Tab contains Pipeline:', htmlCrm.includes('Pipeline de Escolas'));

switchAdminTab('broadcast');
let htmlBroadcast = domElements['app-viewport'].innerHTML;
console.log('Broadcast Tab contains Montador:', htmlBroadcast.includes('Montador de Mensagem em Massa'));
console.log('Broadcast Tab contains Preview WhatsApp:', htmlBroadcast.includes('Pré-visualização no WhatsApp'));

switchAdminTab('api-config');
let htmlApi = domElements['app-viewport'].innerHTML;
console.log('API Config Tab contains Provedor:', htmlApi.includes('Provedor do Gateway WhatsApp'));

switchAdminTab('metrics');
let htmlMetrics = domElements['app-viewport'].innerHTML;
console.log('Metrics Tab contains MRR:', htmlMetrics.includes('MRR da KOGNUS'));
console.log('Metrics Tab contains GMV:', htmlMetrics.includes('GMV Transacionado'));
console.log('Metrics Tab contains Alunos Únicos:', htmlMetrics.includes('Total de Alunos Únicos'));
console.log('Metrics Tab contains Taxa de Ativação:', htmlMetrics.includes('Taxa de Ativação'));

// Test Quick Message Modal
console.log('Testing Quick WhatsApp Modal...');
openQuickWhatsAppModal('instrutor@kognus.com');
console.log('Quick modal opened, recipient set:', domElements['quick-wa-recipient-info'].textContent);
console.log('Quick modal phone set:', domElements['quick-wa-phone'].value);

setQuickMessageTemplate('mensalidade');
console.log('Template applied:', domElements['quick-wa-message'].value.includes('89,90'));

openInWhatsAppWebDirect();
console.log('WhatsApp Web URL opened:', global._lastOpenedUrl);

console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
