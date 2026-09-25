// ============================================================
//  data.js — Camada de Dados e LocalStorage
// ============================================================

const PLATFORM_FEE = 0.08; // 8% taxa da plataforma

// --- Dados iniciais de demonstração ---
const INITIAL_USERS = [
  { email: 'aluno@kognus.com',     pass: '123456', name: 'Lucas Aluno',   role: 'aluno'     },
  { email: 'instrutor@kognus.com', pass: '123456', name: 'Renato Mestre', role: 'instrutor' }
];

const INITIAL_COURSES = [
  {
    id: 1,
    title: 'Colorimetria Avançada e Tonalização',
    category: 'Cabelo',
    price: 297,
    instructor: 'Renato Mestre',
    description: 'Domine as técnicas de colorimetria profissional, entenda a roda de cores e aprenda a fazer correções e tonalizações impecáveis em todos os tipos de cabelo.',
    lessons: [
      { id: 1, title: '01. Boas-vindas e Visão Geral',         duration: '08:20' },
      { id: 2, title: '02. Fundamentos da Roda de Cores',      duration: '15:40' },
      { id: 3, title: '03. Pré-Clareamento e Pigmentação',     duration: '22:15' },
      { id: 4, title: '04. Técnicas de Tonalização Fria',      duration: '19:30' },
      { id: 5, title: '05. Correção de Tons Indesejados',      duration: '25:00' },
      { id: 6, title: '06. Finalização e Manutenção',          duration: '12:10' }
    ]
  },
  {
    id: 2,
    title: 'Gestão Financeira para Salões',
    category: 'Negócios',
    price: 197,
    instructor: 'Renato Mestre',
    description: 'Aprenda a organizar as finanças do seu salão, precificar serviços corretamente, controlar fluxo de caixa e escalar seu negócio com lucratividade.',
    lessons: [
      { id: 1, title: '01. Diagnóstico Financeiro do Salão', duration: '14:00' },
      { id: 2, title: '02. Precificação de Serviços',        duration: '20:30' },
      { id: 3, title: '03. Fluxo de Caixa na Prática',      duration: '18:45' },
      { id: 4, title: '04. Indicadores de Performance',      duration: '16:20' },
      { id: 5, title: '05. Estratégias de Crescimento',      duration: '22:00' }
    ]
  },
  {
    id: 3,
    title: 'Design de Cortes Masculinos Modernos',
    category: 'Barbearia',
    price: 147,
    instructor: 'Camila Hair',
    description: 'Do degradê clássico ao design criativo — aprenda as técnicas mais valorizadas do mercado de barbearia masculina com a especialista Camila Hair.',
    lessons: [
      { id: 1, title: '01. Ferramentas e Setup do Barbeiro', duration: '10:00' },
      { id: 2, title: '02. Degradê Clássico Passo a Passo',  duration: '28:15' },
      { id: 3, title: '03. Navalhados e Acabamentos',        duration: '20:40' },
      { id: 4, title: '04. Design Criativo e Desenhos',      duration: '32:00' },
      { id: 5, title: '05. Atendimento e Fidelização',       duration: '15:30' }
    ]
  }
];

// --- Utilitário de formatação ---
function fmtCurrency(value) {
  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return 'R$ ' + parts.join(',');
}

// --- Camada de banco de dados (LocalStorage) ---
const DB = {
  _get: (key)        => JSON.parse(localStorage.getItem(key)),
  _set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),

  getUsers:       () => DB._get('kognus_users')       || [],
  getCourses:     () => DB._get('kognus_courses')     || [],
  getSession:     () => DB._get('kognus_session'),
  getEnrollments: () => DB._get('kognus_enrollments') || {},
  getProgress:    () => DB._get('kognus_progress')    || {},

  getUserEnrollments: (email) => {
    const e = DB.getEnrollments();
    return e[email] || [];
  },

  getUserProgress: (email, courseId) => {
    const p = DB.getProgress();
    return (p[email] && p[email][courseId]) ? p[email][courseId] : [];
  },

  enrollUser: (email, courseId) => {
    const e = DB.getEnrollments();
    if (!e[email]) e[email] = [];
    if (!e[email].includes(courseId)) {
      e[email].push(courseId);
      DB._set('kognus_enrollments', e);
      return true;
    }
    return false;
  },

  toggleLesson: (email, courseId, lessonId) => {
    const p = DB.getProgress();
    if (!p[email]) p[email] = {};
    if (!p[email][courseId]) p[email][courseId] = [];
    const idx = p[email][courseId].indexOf(lessonId);
    if (idx === -1) p[email][courseId].push(lessonId);
    else            p[email][courseId].splice(idx, 1);
    DB._set('kognus_progress', p);
    return p[email][courseId];
  },

  addCourse: (courseData) => {
    const courses = DB.getCourses();
    courses.push(courseData);
    DB._set('kognus_courses', courses);
  },

  initData: () => {
    if (!DB._get('kognus_users'))   DB._set('kognus_users',   INITIAL_USERS);
    if (!DB._get('kognus_courses')) DB._set('kognus_courses', INITIAL_COURSES);
    const enrollments = DB.getEnrollments();
    if (!enrollments['aluno@kognus.com']) {
      DB.enrollUser('aluno@kognus.com', 1);
    }
  }
};
