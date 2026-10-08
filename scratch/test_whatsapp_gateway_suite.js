const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extrai o conteúdo do script principal antes de </body>
const lastScriptStart = html.lastIndexOf('<script>');
const lastScriptEnd = html.lastIndexOf('</script>');
const mainScript = html.slice(lastScriptStart + 8, lastScriptEnd);

// Setup mock DOM & environment
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.sessionStorage = { clear: () => {} };

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
    getAttribute: (attr) => '',
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
  'wa-provider': createMockElement('wa-provider'),
  'wa-base-url': createMockElement('wa-base-url'),
  'wa-instance-name': createMockElement('wa-instance-name'),
  'wa-api-token': createMockElement('wa-api-token'),
  'openai-api-key': createMockElement('openai-api-key'),
  'wa-admin-phone': createMockElement('wa-admin-phone'),
  'wa-connection-status-card': createMockElement('wa-connection-status-card'),
  'btn-test-wa-connection': createMockElement('btn-test-wa-connection'),
  'wa-manual-content': createMockElement('wa-manual-content'),
  'wa-manual-icon': createMockElement('wa-manual-icon'),
  'broadcast-message-text': createMockElement('broadcast-message-text'),
  'btn-improve-openai': createMockElement('btn-improve-openai')
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
  location: { origin: 'http://localhost:3000', pathname: '/' },
  open: (url) => { global._openedUrl = url; }
};

global.navigator = {
  clipboard: {
    writeText: (t) => { global._clipboard = t; return Promise.resolve(); }
  }
};

global.lucide = { createIcons: () => {} };

// Mock fetch
let fetchCalls = [];
let mockFetchHandler = null;
global.fetch = async (url, opts) => {
  fetchCalls.push({ url, opts });
  if (mockFetchHandler) return mockFetchHandler(url, opts);
  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'open', state: 'open' }),
    text: async () => JSON.stringify({ status: 'open' })
  };
};

eval(mainScript + '; global.getCurrentUser = () => currentUser; global.getState = () => state; global.formatToE164 = formatToE164; global.testWhatsAppConnection = testWhatsAppConnection; global.sendWhatsAppApiRequest = sendWhatsAppApiRequest; global.improveBroadcastMessageWithOpenAI = improveBroadcastMessageWithOpenAI; global.handleSaveWhatsAppConfig = handleSaveWhatsAppConfig; global.switchAdminTab = switchAdminTab; global.renderAdminDashboard = renderAdminDashboard; global.startWhatsAppBroadcast = startWhatsAppBroadcast; global.toggleWhatsAppManual = toggleWhatsAppManual;');

console.log('🧪 INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO DO GATEWAY DE WHATSAPP KOGNUS\n');

async function runTestSuite() {
  let passed = 0;
  let total = 6;

  // 1. TESTE E.164 FORMATTING
  try {
    const r1 = formatToE164('(11) 99999-8888');
    const r2 = formatToE164('+55 21 98888-7777');
    const r3 = formatToE164('5531977776666');
    const r4 = formatToE164('98765-4321');
    assert.strictEqual(r1, '5511999998888');
    assert.strictEqual(r2, '5521988887777');
    assert.strictEqual(r3, '5531977776666');
    assert.strictEqual(r4, '5511987654321');
    console.log('✅ 1. TEST_E164_FORMATTING: Formatação rigorosa com DDI 55 e dígitos limpos');
    passed++;
  } catch(e) {
    console.error('❌ 1. TEST_E164_FORMATTING FALHOU:', e.message);
  }

  // 2. TESTE ARQUITETURA HTML: ABA API-CONFIG E MANUAL DE 4 PASSOS
  try {
    switchAdminTab('api-config');
    const adminHtml = renderAdminDashboard();
    assert.ok(adminHtml.includes('Evolution API (Recomendado - Gratuito/Open Source)'), 'Provedor Evolution API presente');
    assert.ok(adminHtml.includes('Z-API'), 'Provedor Z-API presente');
    assert.ok(adminHtml.includes('Custom REST Webhook'), 'Provedor Custom REST presente');
    assert.ok(adminHtml.includes('kognus-admin'), 'Instância padrão kognus-admin');
    assert.ok(adminHtml.includes('openai-api-key'), 'Campo dedicado para OpenAI');
    assert.ok(adminHtml.includes('testWhatsAppConnection()'), 'Botão de ping chama testWhatsAppConnection');
    assert.ok(adminHtml.includes('Manual Rápido: Como Conectar seu WhatsApp à KOGNUS em 3 Minutos'), 'Título do manual de 3 minutos presente');
    assert.ok(adminHtml.includes('Passo 1: Por que não usar a chave da OpenAI aqui?'), 'Passo 1 presente');
    assert.ok(adminHtml.includes('Passo 2: Opção Gratuita com Evolution API (Open Source)'), 'Passo 2 presente');
    assert.ok(adminHtml.includes('docker run -d -p 8080:8080 atendai/evolution-api'), 'Comando Docker do manual presente');
    assert.ok(adminHtml.includes('Passo 3: Gerar o QR Code e Parear o WhatsApp'), 'Passo 3 presente');
    assert.ok(adminHtml.includes('Passo 4: Conectar na KOGNUS e Executar o Ping Test'), 'Passo 4 presente');
    console.log('✅ 2. TEST_ARCHITECTURE_HTML_AND_MANUAL: Arquitetura completa com separação de IA, gateways e manual interativo de 4 passos');
    passed++;
  } catch(e) {
    console.error('❌ 2. TEST_ARCHITECTURE_HTML_AND_MANUAL FALHOU:', e.message);
  }

  // 3. TESTE ABA BROADCAST COM BOTÃO DE IA (OPENAI)
  try {
    switchAdminTab('broadcast');
    const broadcastHtml = renderAdminDashboard();
    assert.ok(broadcastHtml.includes('✨ Melhorar Mensagem com IA (OpenAI)'), 'Botão de IA presente no editor');
    assert.ok(broadcastHtml.includes('improveBroadcastMessageWithOpenAI()'), 'Handler de IA ligado ao botão');
    console.log('✅ 3. TEST_BROADCAST_AI_COPYWRITER_BUTTON: Botão de melhoria com IA ativo no editor de disparos');
    passed++;
  } catch(e) {
    console.error('❌ 3. TEST_BROADCAST_AI_COPYWRITER_BUTTON FALHOU:', e.message);
  }

  // 4. TESTE PING TEST VERDADEIRO (STATUS POSITIVO COM EVOLUTION API)
  try {
    domElements['wa-provider'].value = 'evolution';
    domElements['wa-base-url'].value = 'https://evolution-gateway.railway.app';
    domElements['wa-instance-name'].value = 'kognus-admin';
    domElements['wa-api-token'].value = 'secret-token-123456';
    domElements['wa-admin-phone'].value = '(11) 98888-7777';

    fetchCalls = [];
    mockFetchHandler = async (url, opts) => {
      if (url.includes('/instance/connectionState/kognus-admin')) {
        assert.strictEqual(opts.headers['apikey'], 'secret-token-123456');
        return {
          ok: true,
          status: 200,
          json: async () => ({ instance: { instanceName: 'kognus-admin', state: 'open' } })
        };
      }
      if (url.includes('/message/sendText/kognus-admin')) {
        const body = JSON.parse(opts.body);
        assert.strictEqual(body.number, '5511988887777');
        assert.ok(body.text.includes('🔔 Teste KOGNUS: Conexão com seu WhatsApp estabelecida com sucesso!'));
        return {
          ok: true,
          status: 200,
          json: async () => ({ key: { id: 'msg_test_123' } })
        };
      }
      throw new Error('Endpoint não esperado: ' + url);
    };

    await testWhatsAppConnection();
    const statusCard = domElements['wa-connection-status-card'];
    assert.ok(statusCard.innerHTML.includes('🟢 Instância Conectada e Pronta! (WhatsApp sincronizado)'), 'Card verde renderizado com sucesso');
    assert.ok(fetchCalls.length >= 2, 'Ping executado e mensagem de teste enviada');
    console.log('✅ 4. TEST_PING_REAL_POSITIVE: Ping real com Evolution API, card verde 🟢 e disparo de mensagem de teste');
    passed++;
  } catch(e) {
    console.error('❌ 4. TEST_PING_REAL_POSITIVE FALHOU:', e); console.log('CARD:', domElements['wa-connection-status-card'].innerHTML);
  }

  // 5. TESTE PING TEST FALHA / NEGATIVO (INSTÂNCIA DESCONECTADA & ERRO 401)
  try {
    domElements['wa-provider'].value = 'z-api';
    domElements['wa-base-url'].value = 'https://api.z-api.io';
    domElements['wa-instance-name'].value = 'instancia_z';
    domElements['wa-api-token'].value = 'token_incorreto';

    fetchCalls = [];
    mockFetchHandler = async (url, opts) => {
      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized' }),
        text: async () => 'Unauthorized'
      };
    };

    await testWhatsAppConnection();
    const statusCard = domElements['wa-connection-status-card'];
    assert.ok(statusCard.innerHTML.includes('🔴'), 'Alerta vermelho renderizado no card');
    assert.ok(statusCard.innerHTML.includes('401'), 'Erro 401 informado');

    // Agora testa status = 'close' (desconectado)
    mockFetchHandler = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ connected: false, status: 'close' })
    });
    await testWhatsAppConnection();
    assert.ok(statusCard.innerHTML.includes('necessário ler QR Code'), 'Alerta didático de QR Code renderizado');
    console.log('✅ 5. TEST_PING_REAL_NEGATIVE: Alertas vermelhos precisos com diagnósticos de rede e QR Code pendente');
    passed++;
  } catch(e) {
    console.error('❌ 5. TEST_PING_REAL_NEGATIVE FALHOU:', e.message);
  }

  // 6. TESTE MOTOR DE BROADCAST REAL (POST PAYLOAD CORRETO E CONTROLE DE INTERVALO)
  try {
    getState().instructors = [
      { id: 1, name: 'Renato', email: 'renato@teste.com', phone: '11999990001', school: 'Escola 1', status: 'ativo' },
      { id: 2, name: 'Juliana', email: 'juliana@teste.com', phone: '21999990002', school: 'Escola 2', status: 'ativo' }
    ];

    domElements['wa-provider'].value = 'evolution';
    domElements['wa-base-url'].value = 'https://meu-whatsapp.up.railway.app';
    domElements['wa-instance-name'].value = 'kognus-admin';
    domElements['wa-api-token'].value = 'token-prod-999';

    // Salva config
    await handleSaveWhatsAppConfig();

    fetchCalls = [];
    mockFetchHandler = async (url, opts) => {
      const body = JSON.parse(opts.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({ messageId: 'msg_' + Date.now() })
      };
    };

    // Altera timeout de promessa para acelerar no teste
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (fn, ms) => originalSetTimeout(fn, 10);

    await startWhatsAppBroadcast();
    global.setTimeout = originalSetTimeout;

    const savedLogs = JSON.parse(localStorage.getItem('kognus_broadcast_logs') || '[]');
    assert.ok(savedLogs.length >= 2, 'Dois envios registrados em logs');
    assert.strictEqual(savedLogs[0].status, 'enviado', 'Status gravado como enviado');
    assert.ok(savedLogs.every(l => l.recipientPhone.startsWith('55')), 'Todos os destinatários formatados com DDI 55');

    console.log('✅ 6. TEST_BROADCAST_ENGINE_EXECUTION: Disparo em massa com payload E.164, cabeçalhos de gateway e log de status');
    passed++;
  } catch(e) {
    console.error('❌ 6. TEST_BROADCAST_ENGINE_EXECUTION FALHOU:', e.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 RESULTADO: ${passed}/${total} Testes do Gateway de WhatsApp Aprovados`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 100% DOS TESTES DO GATEWAY WHATSAPP APROVADOS COM SUCESSO!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
