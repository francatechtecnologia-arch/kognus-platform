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
  'modal-nova-aula': createMockElement('modal-nova-aula'),
  'modal-novo-curso': createMockElement('modal-novo-curso'),
  'nl-course-id': createMockElement('nl-course-id'),
  'nl-module-title': createMockElement('nl-module-title'),
  'nl-lesson-title': createMockElement('nl-lesson-title'),
  'nl-lesson-duration': createMockElement('nl-lesson-duration'),
  'nl-video-url': createMockElement('nl-video-url'),
  'nl-pdf-name': createMockElement('nl-pdf-name'),
  'course-modal-title': createMockElement('course-modal-title'),
  'course-modal-price': createMockElement('course-modal-price'),
  'course-modal-category': createMockElement('course-modal-category'),
  'course-modal-checkout-url': createMockElement('course-modal-checkout-url'),
  'course-cover-preview': createMockElement('course-cover-preview'),
  'inst-name': createMockElement('inst-name'),
  'inst-school': createMockElement('inst-school'),
  'inst-email': createMockElement('inst-email'),
  'inst-pass': createMockElement('inst-pass')
};

domElements['modal-nova-aula'].classList.add('hidden');
domElements['modal-novo-curso'].classList.add('hidden');

global.document = {
  body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} },
  getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
  createElement: (tag) => createMockElement(tag),
  querySelectorAll: () => [],
  querySelector: () => null
};

global.window = {
  scrollTo: () => {},
  addEventListener: () => {},
  print: () => {},
  location: { origin: 'http://localhost:3000', pathname: '/' },
  supabase: {
    createClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        upsert: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      })
    })
  }
};

global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.lucide = { createIcons: () => {} };

eval(mainScript + '; global.getCurrentUser = () => currentUser; global.setCurrentUser = (u) => { currentUser = u; }; global.setSelectedLesson = (l) => { selectedLesson = l; }; global.getState = () => state; global.initApp = initApp; global.handleInstructorRegister = handleInstructorRegister; global.getMyInstructorCourses = getMyInstructorCourses; global.openModalNovaAula = openModalNovaAula; global.openCourseModal = openCourseModal; global.renderCreatorPage = renderCreatorPage; global.renderPlayerPage = renderPlayerPage; global.handleSaveCourse = handleSaveCourse; global.handleSaveNewLesson = handleSaveNewLesson; global.extractYoutubeId = extractYoutubeId;');

async function runAudit() {
  console.log('🧪 RUNNING TENANT ISOLATION & MOCK PURGE AUDIT TESTS...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
    }
  }

  // 1. Check input default values in HTML
  assert(
    !html.includes('id="nl-video-url" value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"'),
    'TEST 1: nl-video-url does not contain hardcoded Rick Astley mock in HTML'
  );
  assert(
    html.includes('id="nl-video-url" value="" placeholder="Cole o link do YouTube, Vimeo ou URL do vídeo..."'),
    'TEST 2: nl-video-url starts strictly empty with proper placeholder'
  );
  assert(
    extractYoutubeId('') === '' && extractYoutubeId(null) === '',
    'TEST 3: extractYoutubeId returns empty string for empty input (zero mock fallback)'
  );

  // 2. Initialize App and check default Renato instructor
  initApp();
  const state = getState();

  // Log in as Renato Mestre
  setCurrentUser({
    id: '00000000-0000-0000-0000-000000000002',
    email: 'instrutor@kognus.com',
    name: 'Prof. Renato Mestre',
    role: 'instrutor'
  });

  const renatoCourses = getMyInstructorCourses();
  assert(
    renatoCourses.length === 2 && renatoCourses.some(c => c.id === 1),
    'TEST 4: Renato Mestre has access to his 2 courses'
  );

  // 3. Register a brand new instructor (Tenant 2)
  domElements['inst-name'].value = 'Dra. Beatriz Dermatologia';
  domElements['inst-school'].value = 'Instituto Pele Radiante';
  domElements['inst-email'].value = 'beatriz@peleradiante.com';
  domElements['inst-pass'].value = 'senha123';
  await handleInstructorRegister({ preventDefault: () => {} });

  const newInstUser = getCurrentUser();
  assert(
    newInstUser && newInstUser.email === 'beatriz@peleradiante.com' && newInstUser.role === 'instrutor',
    'TEST 5: New instructor registered successfully'
  );

  // Check that new instructor has strictly 0 courses (ZERO DATA LEAKAGE)
  const beatrizCourses = getMyInstructorCourses();
  assert(
    beatrizCourses.length === 0,
    'TEST 6: Strict Isolation - New instructor sees 0 courses (no leaked courses from other instructors)',
    `Expected 0 but got ${beatrizCourses.length}`
  );

  // 4. Test Creator Studio view for new instructor (both locked and active states)
  const lockedCreatorHtml = renderCreatorPage();
  assert(
    lockedCreatorHtml.includes('Novo Curso (Bloqueado)') || lockedCreatorHtml.includes('0 Cursos'),
    'TEST 7: Creator Studio displays locked state or empty courses for new pending instructor'
  );

  // Activate instructor to test unlocked Creator Studio with 0 courses
  const instRecord = state.instructors.find(i => i.email === 'beatriz@peleradiante.com');
  if (instRecord) instRecord.status = 'ativo';
  getCurrentUser().status = 'ativo';
  const unlockedCreatorHtml = renderCreatorPage();
  assert(
    unlockedCreatorHtml.includes('Crie seu primeiro curso antes de adicionar aulas!') &&
    unlockedCreatorHtml.includes('Nenhum curso cadastrado ainda'),
    'TEST 8: "Nova Aula" button is disabled/shielded when active instructor has 0 courses'
  );

  // 5. Test opening "Nova Aula" modal when instructor has 0 courses
  domElements['modal-nova-aula'].classList.add('hidden');
  openModalNovaAula();
  assert(
    domElements['modal-nova-aula'].classList.contains('hidden'),
    'TEST 9: openModalNovaAula blocks modal and redirects if instructor has 0 courses'
  );

  // 6. New instructor creates their first course
  domElements['course-modal-title'].value = 'Harmonização Facial Prática';
  domElements['course-modal-price'].value = '590,00';
  domElements['course-modal-category'].value = 'Estética Avançada';
  domElements['course-modal-checkout-url'].value = 'https://pay.kiwify.com.br/harmonizacao';
  await handleSaveCourse({ preventDefault: () => {} }, null);

  const updatedBeatrizCourses = getMyInstructorCourses();
  assert(
    updatedBeatrizCourses.length === 1 && updatedBeatrizCourses[0].title === 'Harmonização Facial Prática',
    'TEST 10: New instructor now owns only their newly created course'
  );
  assert(
    updatedBeatrizCourses[0].instructor_email === 'beatriz@peleradiante.com',
    'TEST 11: Created course is strictly bound to new instructor email'
  );

  // Now open "Nova Aula" modal with 1 course
  openModalNovaAula();
  assert(
    !domElements['modal-nova-aula'].classList.contains('hidden'),
    'TEST 12: openModalNovaAula now opens successfully'
  );
  assert(
    domElements['nl-course-id'].innerHTML.includes('Harmonização Facial Prática') &&
    !domElements['nl-course-id'].innerHTML.includes('Colorimetria Avançada'),
    'TEST 13: nl-course-id select contains ONLY the new instructor course (no leaked courses)'
  );

  // 7. Test Player Neutral Video State when lesson has no video
  const testCourseWithNoVideoLesson = {
    id: 999,
    title: 'Curso de Leitura',
    instructor: 'Dra. Beatriz',
    modules: [
      {
        id: 1,
        title: 'Módulo 1',
        lessons: [
          {
            id: 9991,
            title: 'Aula Texto Sem Vídeo',
            duration: '10 min',
            youtubeId: '',
            videoUrl: ''
          }
        ]
      }
    ]
  };
  state.courses.push(testCourseWithNoVideoLesson);
  setSelectedLesson(testCourseWithNoVideoLesson.modules[0].lessons[0]);

  const playerHtml = renderPlayerPage(999);
  assert(
    playerHtml.includes('Nenhum vídeo anexado a esta aula') && playerHtml.includes('video-off'),
    'TEST 14: Neutral state rendered in player when lesson has no video URL'
  );

  console.log(`\n================================================================`);
  console.log(`🏁 AUDIT RESULT: ${passed}/${total} Tests Passed`);
  console.log(`================================================================\n`);

  if (passed === total) {
    console.log('🎉 100% DAS DIRETRIZES DE ISOLAMENTO E REMOÇÃO DE MOCKS VALIDADAS COM SUCESSO!\n');
    process.exit(0);
  } else {
    console.error('❌ Falha nos testes de isolamento!');
    process.exit(1);
  }
}

runAudit();
