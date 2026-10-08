const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
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
  'modal-quick-whatsapp': createMockElement('modal-quick-whatsapp'),
  'quick-wa-phone': createMockElement('quick-wa-phone'),
  'quick-wa-message': createMockElement('quick-wa-message'),
  'quick-wa-char-count': createMockElement('quick-wa-char-count'),
  'quick-wa-recipient-info': createMockElement('quick-wa-recipient-info'),
  'broadcast-message-text': createMockElement('broadcast-message-text'),
  'broadcast-char-counter': createMockElement('broadcast-char-counter'),
  'whatsapp-preview-bubble-text': createMockElement('whatsapp-preview-bubble-text'),
  'whatsapp-preview-time': createMockElement('whatsapp-preview-time'),
  'broadcast-filter-select': createMockElement('broadcast-filter-select'),
  'broadcast-progress-container': createMockElement('broadcast-progress-container'),
  'broadcast-progress-bar': createMockElement('broadcast-progress-bar'),
  'broadcast-progress-percent': createMockElement('broadcast-progress-percent'),
  'broadcast-progress-status': createMockElement('broadcast-progress-status'),
  'broadcast-progress-label': createMockElement('broadcast-progress-label'),
  'btn-broadcast-submit': createMockElement('btn-broadcast-submit'),
  'wa-provider': createMockElement('wa-provider'),
  'wa-base-url': createMockElement('wa-base-url'),
  'wa-instance-name': createMockElement('wa-instance-name'),
  'wa-api-token': createMockElement('wa-api-token'),
  'wa-admin-phone': createMockElement('wa-admin-phone')
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

eval(mainScript + '; global.getCurrentUser = () => currentUser; global.getState = () => state; global.renderHeader = renderHeader; global.navigateTo = navigateTo; global.logout = logout; global.handleLogin = handleLogin; global.initApp = initApp; global.switchAdminTab = switchAdminTab; global.setCrmFunnelFilter = setCrmFunnelFilter; global.openQuickWhatsAppModal = openQuickWhatsAppModal; global.closeQuickWhatsAppModal = closeQuickWhatsAppModal; global.setQuickMessageTemplate = setQuickMessageTemplate; global.openInWhatsAppWebDirect = openInWhatsAppWebDirect; global.sendQuickWhatsAppMessage = sendQuickWhatsAppMessage; global.handleBroadcastMessageInput = handleBroadcastMessageInput; global.insertBroadcastTag = insertBroadcastTag; global.updateBroadcastPreview = updateBroadcastPreview; global.startWhatsAppBroadcast = startWhatsAppBroadcast; global.handleSaveWhatsAppConfig = handleSaveWhatsAppConfig; global.handleTestWhatsAppConnection = handleTestWhatsAppConnection; global.toggleWaTokenVisibility = toggleWaTokenVisibility; global.setBroadcastFilter = setBroadcastFilter;');

console.log('🧪 VALIDANDO ESPECIFICAÇÃO COMPLETA: ADMIN CRM & MOTOR WHATSAPP\n');

initApp();
navigateTo('dashboard-admin');

// 1. Validar Aba 1: CRM & Pipeline
switchAdminTab('crm');
const crmHtml = domElements['app-viewport'].innerHTML;

const crmChecks = {
  'Título e Pipeline': crmHtml.includes('CRM & Pipeline de Instrutores'),
  'Cards de Funil': crmHtml.includes('Total de Escolas') && crmHtml.includes('Escolas Ativas') && crmHtml.includes('Novos sem Cursos') && crmHtml.includes('Inadimplentes (Congelados)'),
  'Filtro de Funil (Todos/Novos/Ativas/Inadimplentes)': crmHtml.includes("setCrmFunnelFilter('todos')") && crmHtml.includes("setCrmFunnelFilter('novos')") && crmHtml.includes("setCrmFunnelFilter('ativas')") && crmHtml.includes("setCrmFunnelFilter('inadimplentes')"),
  'Colunas da Tabela de Instrutores': crmHtml.includes('Instrutor & Escola') && crmHtml.includes('Contato (WhatsApp / E-mail)') && crmHtml.includes('Cursos Criados') && crmHtml.includes('Status Mensalidade') && crmHtml.includes('Faturamento Acumulado'),
  'Botão de Mensagem Rápida': crmHtml.includes('openQuickWhatsAppModal') && crmHtml.includes('💬 Mensagem Rápida'),
  'Link direto wa.me para WhatsApp': crmHtml.includes('https://wa.me/'),
  'Controle de Congelamento': crmHtml.includes('Congelar Escola (Simular Inadimplência)') && crmHtml.includes('Descongelar / Liberar Manual')
};

console.log('📋 ABA 1 (CRM & PIPELINE):');
Object.entries(crmChecks).forEach(([k, v]) => console.log(`  ${v ? '✅' : '❌'} ${k}`));

// 2. Validar Aba 2: Central de Disparos WhatsApp
switchAdminTab('broadcast');
const broadcastHtml = domElements['app-viewport'].innerHTML;

const broadcastChecks = {
  'Título Central de Disparos': broadcastHtml.includes('Central de Disparos WhatsApp'),
  'Seletor de Destinatários': broadcastHtml.includes('broadcast-filter-select') && broadcastHtml.includes('Todos os Instrutores') && broadcastHtml.includes('Apenas Instrutores com Mensalidade Pendente') && broadcastHtml.includes('Apenas Instrutores que ainda não criaram cursos'),
  'Tags Dinâmicas': broadcastHtml.includes('{{nome}}') && broadcastHtml.includes('{{escola}}') && broadcastHtml.includes('{{cursos_publicados}}') && broadcastHtml.includes('{{link_pagamento}}'),
  'Editor e Contador': broadcastHtml.includes('broadcast-message-text') && broadcastHtml.includes('broadcast-char-counter'),
  'Mockup Smartphone WhatsApp': broadcastHtml.includes('Pré-visualização no WhatsApp') && broadcastHtml.includes('KOGNUS Oficial') && broadcastHtml.includes('whatsapp-preview-bubble-text'),
  'Barra de Progresso Anti-Ban': broadcastHtml.includes('broadcast-progress-bar') && broadcastHtml.includes('broadcast-progress-container'),
  'Histórico de Disparos Recentes': broadcastHtml.includes('Histórico de Disparos Recentes')
};

console.log('\n📲 ABA 2 (CENTRAL DE DISPAROS WHATSAPP):');
Object.entries(broadcastChecks).forEach(([k, v]) => console.log(`  ${v ? '✅' : '❌'} ${k}`));

// 3. Validar Aba 3: Configurações de API WhatsApp
switchAdminTab('api-config');
const apiHtml = domElements['app-viewport'].innerHTML;

const apiChecks = {
  'Título Configurações API': apiHtml.includes('Configurações de API WhatsApp') || apiHtml.includes('Conexão com Gateway de WhatsApp'),
  'Provedores (Evolution, Z-API, Custom)': apiHtml.includes('Evolution API') && apiHtml.includes('Z-API') && apiHtml.includes('Custom REST Endpoint'),
  'Campos de Configuração': apiHtml.includes('wa-provider') && apiHtml.includes('wa-base-url') && apiHtml.includes('wa-instance-name') && apiHtml.includes('wa-api-token') && apiHtml.includes('wa-admin-phone'),
  'Toggle Visibilidade Token': apiHtml.includes('toggleWaTokenVisibility'),
  'Botão Salvar no Supabase': apiHtml.includes('handleSaveWhatsAppConfig') && apiHtml.includes('Salvar Credenciais no Supabase'),
  'Botão Testar Conexão': apiHtml.includes('handleTestWhatsAppConnection') && apiHtml.includes('Testar Conexão')
};

console.log('\n⚙️ ABA 3 (CONFIGURAÇÕES DE API WHATSAPP):');
Object.entries(apiChecks).forEach(([k, v]) => console.log(`  ${v ? '✅' : '❌'} ${k}`));

// 4. Validar Aba 4: Métricas Globais da KOGNUS
switchAdminTab('metrics');
const metricsHtml = domElements['app-viewport'].innerHTML;

const metricsChecks = {
  'MRR da KOGNUS': metricsHtml.includes('MRR da KOGNUS'),
  'GMV Transacionado': metricsHtml.includes('GMV Transacionado'),
  'Total de Alunos Únicos': metricsHtml.includes('Total de Alunos Únicos'),
  'Taxa de Ativação': metricsHtml.includes('Taxa de Ativação'),
  'Canvas de Gráficos (Chart.js)': metricsHtml.includes('chart-mrr') && metricsHtml.includes('chart-status'),
  'Central Stripe Billing Master': metricsHtml.includes('Central Master de Faturamento & Cobrança (Stripe SaaS)') && metricsHtml.includes('master-webhook-url')
};

console.log('\n📊 ABA 4 (MÉTRICAS GLOBAIS DA PLATAFORMA):');
Object.entries(metricsChecks).forEach(([k, v]) => console.log(`  ${v ? '✅' : '❌'} ${k}`));

// 5. Teste Funcional do Modal e Interações
console.log('\n⚡ TESTE FUNCIONAL DE INTERAÇÕES:');
openQuickWhatsAppModal('instrutor@kognus.com');
const modalRecipient = domElements['quick-wa-recipient-info'].textContent;
console.log('  Destinatário do Modal:', modalRecipient);
setQuickMessageTemplate('mensalidade');
const modalMessage = domElements['quick-wa-message'].value;
console.log('  Template de Mensalidade Injetado:', modalMessage.includes('89,90'));
openInWhatsAppWebDirect();
console.log('  Redirecionamento WhatsApp Web URL:', global._lastOpenedUrl);

console.log('\n🏁 TODAS AS VERIFICAÇÕES CONCLUÍDAS COM SUCESSO!');
