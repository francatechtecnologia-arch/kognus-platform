const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('Arquivo index.html não encontrado em:', htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

// Extrai o conteúdo do script principal antes de </body>
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const mainScript = scriptMatches[scriptMatches.length - 1][1];
if (!mainScript) {
  console.error('Script principal não encontrado em index.html');
  process.exit(1);
}

// Simulação de Storage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

function createMockElement(initialClasses = []) {
  const classes = new Set(initialClasses);
  return {
    value: '',
    checked: false,
    src: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    className: initialClasses.join(' '),
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
    getAttribute: () => '',
    reset: () => {}
  };
}

const screenIds = [
  'screen-landing',
  'screen-login',
  'screen-register',
  'screen-aluno-dash',
  'screen-course-player',
  'screen-aluno-catalogo',
  'screen-instrutor-dash',
  'screen-instrutor-aulas',
  'screen-direct-course',
  'screen-admin-dash'
];

const domElements = {
  'test-runner-badge': createMockElement(),
  'test-runner-badge-text': createMockElement(),
  'nav-user': createMockElement(['hidden']),
  'nav-guest': createMockElement(),
  'nav-user-name': createMockElement(),
  'nav-role-badge': createMockElement(),
  'nav-brand-title': { ...createMockElement(), textContent: 'KOGNUS' },
  'nav-brand-logo': { ...createMockElement(), textContent: 'K', src: 'logo.png', tagName: 'IMG', getAttribute: (attr) => attr === 'src' ? 'logo.png' : '' },
  'nav-user-avatar-img': createMockElement(['hidden']),
  'nav-user-avatar-initials': createMockElement(),
  'nl-aluno': createMockElement(['hidden']),
  'nl-catalogo': createMockElement(['hidden']),
  'nl-instrutor': createMockElement(['hidden']),
  'nl-admin': createMockElement(['hidden']),
  'toast': createMockElement(['translate-y-20', 'opacity-0']),
  'toast-icon': createMockElement(),
  'toast-message': createMockElement(),

  'login-email': createMockElement(),
  'login-password': createMockElement(),
  'form-login': createMockElement(),
  'reg-name': createMockElement(),
  'reg-school-name': createMockElement(),
  'reg-email': createMockElement(),
  'reg-password': createMockElement(),
  'form-register': createMockElement(),

  'modal-student-first-access': createMockElement(['hidden']),
  'first-access-student-email': createMockElement(),
  'first-access-new-pass': createMockElement(),
  'first-access-confirm-pass': createMockElement(),
  'form-student-first-access': createMockElement(),

  'modal-student-checkout': createMockElement(['hidden']),
  'checkout-course-id': createMockElement(),
  'checkout-course-title': createMockElement(),
  'checkout-course-inst': createMockElement(),
  'checkout-course-price': createMockElement(),
  'checkout-course-emoji': createMockElement(),
  'checkout-course-img': createMockElement(['hidden']),
  'checkout-student-name': createMockElement(),
  'checkout-student-email': createMockElement(),
  'form-student-checkout': createMockElement(),

  'modal-purchase-success': createMockElement(['hidden']),
  'succ-course-title': createMockElement(),
  'succ-student-name': createMockElement(),
  'succ-student-email': createMockElement(),
  'succ-student-pass': createMockElement(),
  'btn-succ-access': createMockElement(),

  'aluno-welcome': createMockElement(),
  'aluno-welcome-msg': createMockElement(),
  'as-total': createMockElement(),
  'as-prog': createMockElement(),
  'as-done': createMockElement(),
  'aluno-grid': createMockElement(),
  'aluno-header-avatar-img': createMockElement(['hidden']),
  'aluno-header-avatar-initials': createMockElement(),

  'landing-grid': createMockElement(),
  'catalogo-grid': createMockElement(),

  'player-course-title': createMockElement(),
  'player-school-label': createMockElement(),
  'player-prog-text': createMockElement(),
  'player-prog-pct': createMockElement(),
  'player-progress-bar': createMockElement(),
  'player-video-wrap': createMockElement(),
  'player-pdf-quick-wrap': createMockElement(),
  'player-tab-content': createMockElement(),
  'player-cert-box': createMockElement(),
  'player-btn-emit-cert': { ...createMockElement(), disabled: true },
  'player-cert-msg': createMockElement(),
  'player-cert-badge-tag': createMockElement(),
  'player-cert-icon-wrap': createMockElement(),
  'modal-config-cert': createMockElement(['hidden']),
  'modal-view-certificate': createMockElement(['hidden']),
  'cert-view-school': createMockElement(),
  'cert-view-student': createMockElement(),
  'cert-view-statement': createMockElement(),
  'cert-view-date': createMockElement(),
  'cert-view-auth-code': createMockElement(),
  'cert-view-issuer': createMockElement(),
  'cert-view-sig-img': createMockElement(['hidden']),
  'cert-view-sig-typo': createMockElement(),
  'cfg-cert-course-id': createMockElement(),
  'cfg-cert-course-name': createMockElement(),
  'cfg-cert-enabled': { ...createMockElement(), checked: true },
  'cfg-cert-workload': { ...createMockElement(), value: '40' },
  'cfg-cert-issuer': createMockElement(),
  'cfg-cert-statement': createMockElement(),
  'cfg-cert-sig-preview-wrap': createMockElement(),
  'cfg-cert-typo-preview-wrap': createMockElement(),
  'cfg-cert-sig-img': createMockElement(),
  'cfg-cert-typo-preview': createMockElement(),
  'cfg-cert-sig-file': createMockElement(),

  'sub-panel-status-badge': createMockElement(),
  'sub-panel-alert': createMockElement(),
  'sub-panel-due-date': createMockElement(),
  'sub-panel-courses-status': createMockElement(),
  'cfg-pay-gateway': { ...createMockElement(), value: 'kiwify' },
  'cfg-pay-checkout-url': createMockElement(),
  'wh-display-url': createMockElement(),
  'wh-display-secret': createMockElement(),
  'sim-wh-email': createMockElement(),
  'sim-wh-name': createMockElement(),
  'sim-wh-course': { ...createMockElement(), value: '1' },
  'sim-wh-log': createMockElement(),

  'direct-course-frozen-alert': createMockElement(['hidden']),
  'direct-course-id-badge': createMockElement(),
  'direct-course-cat': createMockElement(),
  'direct-course-title': createMockElement(),
  'direct-course-instructor': createMockElement(),
  'direct-course-lessons-count': createMockElement(),
  'direct-course-price': createMockElement(),
  'direct-course-desc': createMockElement(),
  'direct-course-lessons-list': createMockElement(),
  'direct-course-enroll-btn': { ...createMockElement(), disabled: false },
  'direct-course-gateway-hint': createMockElement(),
  'direct-course-banner-img': createMockElement(),

  'admin-mrr': createMockElement(),
  'admin-active-inst': createMockElement(),
  'admin-inadimplentes': createMockElement(),
  'admin-gmv': createMockElement(),
  'admin-students': createMockElement(),
  'admin-tbody': createMockElement(),
  'admin-header-avatar-img': createMockElement(['hidden']),
  'admin-header-avatar-icon': createMockElement(),

  'inst-dashboard-title': createMockElement(),
  'inst-dashboard-sub': createMockElement(),
  'inst-school-tag': createMockElement(['hidden']),
  'inst-header-logo-wrap': createMockElement(['hidden']),
  'inst-header-logo-img': createMockElement(),
  'inst-gross': createMockElement(),
  'inst-net': createMockElement(),
  'inst-students': createMockElement(),
  'inst-courses': createMockElement(),
  'inst-tbody': createMockElement(),

  'modal-user-profile': createMockElement(['hidden']),
  'profile-name-input': createMockElement(),
  'profile-email-input': createMockElement(),
  'profile-curr-pass': createMockElement(),
  'profile-new-pass': createMockElement(),
  'profile-confirm-pass': createMockElement(),
  'profile-modal-avatar-img': createMockElement(['hidden']),
  'profile-modal-avatar-initials': createMockElement(),
  'btn-remove-profile-photo': createMockElement(['hidden']),
  'profile-admin-security-box': createMockElement(['hidden']),
  'profile-pass-updated-badge': createMockElement(),
  'admin-pass-status-badge': createMockElement(),
  'admin-pass-expiry-text': createMockElement(),

  'modal-admin-password-expired': createMockElement(['hidden']),
  'expired-admin-curr-pass': createMockElement(),
  'expired-admin-new-pass': createMockElement(),
  'expired-admin-confirm-pass': createMockElement(),
  'form-admin-expired-password': createMockElement()
};

screenIds.forEach(id => {
  domElements[id] = createMockElement(id === 'screen-landing' ? [] : ['hidden']);
});

const cssProps = {};
global.document = {
  body: { classList: { add: () => {}, remove: () => {} } },
  documentElement: {
    style: {
      setProperty: (k, v) => { cssProps[k] = v; },
      getPropertyValue: (k) => cssProps[k] || ''
    }
  },
  getElementById: (id) => domElements[id] || (domElements[id] = createMockElement()),
  querySelectorAll: (selector) => {
    if (selector === '.screen-view') {
      return screenIds.map(id => domElements[id]);
    }
    if (selector.includes('#nav-user button') || selector.includes('#nav-guest button')) {
      return [
        { textContent: 'Meus Cursos', classList: { contains: () => false }, style: { display: 'inline-flex' }, getAttribute: () => 'navigateTo("aluno-dash")' },
        { textContent: 'Catálogo', classList: { contains: () => false }, style: { display: 'inline-flex' }, getAttribute: () => 'openAlunoCatalogo()' }
      ];
    }
    return [];
  },
  querySelector: (selector) => {
    if (selector === 'input[name="reg-role"]:checked') {
      return { value: 'aluno' };
    }
    return null;
  }
};

global.window = {
  scrollTo: () => {},
  addEventListener: () => {},
  confirm: () => true,
  print: () => { window._printed = true; },
  location: { origin: 'http://localhost:3000', pathname: '/' }
};
global.confirm = () => true;

global.navigator = {
  clipboard: {
    writeText: (t) => { global._clipboard = t; return Promise.resolve(); }
  }
};

global.lucide = {
  createIcons: () => {}
};

global.FileReader = class {
  readAsDataURL(file) {
    if (this.onload) {
      this.onload({ target: { result: file._mockData || 'data:image/png;base64,mock' } });
    }
  }
};

eval(mainScript + '; global.DB = DB; global.KOGNUS_SAAS_FEE = KOGNUS_SAAS_FEE; global.PLATFORM_FEE = PLATFORM_FEE; global.handleLogin = handleLogin; global.handleRegister = handleRegister; global.simulateWebhookPurchase = simulateWebhookPurchase; global.handleDirectCourseEnroll = handleDirectCourseEnroll; global.openStudentCheckoutModal = openStudentCheckoutModal; global.handleCompleteStudentCheckout = handleCompleteStudentCheckout; global.handleAccessFromSuccessModal = handleAccessFromSuccessModal; global.openStudentFirstAccessModal = openStudentFirstAccessModal; global.handleStudentSetFirstPassword = handleStudentSetFirstPassword; global.navigateTo = navigateTo; global.checkAuth = checkAuth; global.openProfileModal = openProfileModal; global.handleSaveProfile = handleSaveProfile; global.handleProfilePhotoUpload = handleProfilePhotoUpload; global.handleRemoveProfilePhoto = handleRemoveProfilePhoto; global.handleSimulateExpiredAdminPassword = handleSimulateExpiredAdminPassword; global.handleAdminUpdateExpiredPassword = handleAdminUpdateExpiredPassword; global.isAdminPasswordExpired = isAdminPasswordExpired; global.renderAdminPanel = renderAdminPanel;');

initData();
const testReport = window.runKognusFunctionalTests();

console.log('\n================================================================');
console.log(`🏁 RESULTADO: ${testReport.passed}/${testReport.total} Testes Funcionais Aprovados`);
console.log('================================================================\n');

if (testReport.passed !== testReport.total) {
  console.error('❌ Falha nos testes automatizados!');
  process.exit(1);
} else {
  console.log('🎉 100% DOS TESTES AUTOMATIZADOS APROVADOS COM SUCESSO!\n');
  process.exit(0);
}
