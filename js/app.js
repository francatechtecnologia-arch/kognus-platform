// ============================================================
//  app.js — Controlador Principal da Aplicação
// ============================================================

const App = {
  _toastTimer: null,

  // --------------------------------------------------------
  //  Navegação
  // --------------------------------------------------------
  navigateTo: (screenId) => {
    document.querySelectorAll('.screen-view').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('screen-' + screenId);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    Render.navbar();
    lucide.createIcons();
  },

  // --------------------------------------------------------
  //  Toast
  // --------------------------------------------------------
  showToast: (msg, type = 'default') => {
    const toast    = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = msg;

    toast.className = toast.className
      .replace(/border-\w+-\d+\/\d+/g, '')
      .replace(/text-\w+-\d+/g, '');

    const styles = {
      success: 'border-emerald-500/30',
      error:   'border-red-500/30',
      default: 'border-darkBorder',
    };
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.setAttribute('data-type', type);

    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
  },

  // --------------------------------------------------------
  //  Autenticação
  // --------------------------------------------------------
  checkAuth: () => {
    const session = Auth.getSession();
    Render.navbar();
    if (session) {
      if (session.role === 'instrutor') {
        Render.instructorPanel();
        App.navigateTo('instrutor-dash');
      } else {
        Render.alunoPanel();
        App.navigateTo('aluno-dash');
      }
    } else {
      App.navigateTo('landing');
    }
  },

  handleRegister: (e) => {
    e.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-password').value;
    const role  = document.querySelector('input[name="reg-role"]:checked').value;

    const result = Auth.register(name, email, pass, role);
    if (!result.success) { App.showToast(result.message, 'error'); return; }

    App.showToast('Conta criada com sucesso! Bem-vindo(a) à Kognus! 🎉', 'success');
    document.getElementById('form-register').reset();
    App.checkAuth();
  },

  handleLogin: (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;

    const result = Auth.login(email, pass);
    if (!result.success) { App.showToast(result.message, 'error'); return; }

    App.showToast('Login realizado com sucesso! ✓', 'success');
    document.getElementById('form-login').reset();
    App.checkAuth();
  },

  handleLogout: () => {
    Auth.logout();
    App.showToast('Sessão encerrada.');
    App.checkAuth();
  },

  openRegisterAs: (role) => {
    const radio = document.querySelector(`input[name="reg-role"][value="${role}"]`);
    if (radio) radio.checked = true;
    App.navigateTo('register');
  },

  // --------------------------------------------------------
  //  Cursos
  // --------------------------------------------------------
  openCourseDetail: (courseId) => {
    Render.courseDetail(courseId);
    App.navigateTo('course-detail');
  },

  enrollInCourse: (courseId) => {
    const session = Auth.getSession();
    if (!session) { App.navigateTo('login'); return; }

    DB.enrollUser(session.email, courseId);
    App.showToast('Matrícula realizada com sucesso! 🎓', 'success');
    // Atualiza o botão na tela de detalhe
    Render.courseDetail(courseId);
    // Redireciona para o player após 1 segundo
    setTimeout(() => App.openCoursePlayer(courseId), 1000);
  },

  openCoursePlayer: (courseId) => {
    const session = Auth.getSession();
    if (!session) { App.navigateTo('login'); return; }

    const enrolled = DB.getUserEnrollments(session.email).includes(courseId);
    if (!enrolled) {
      App.openCourseDetail(courseId);
      App.showToast('Matricule-se primeiro para acessar as aulas.', 'error');
      return;
    }

    Render.coursePlayer(courseId);
    App.navigateTo('course-player');
  },

  selectLesson: (courseId, lessonId) => {
    const session = Auth.getSession();
    const course  = DB.getCourses().find(c => c.id === courseId);
    const lesson  = course.lessons.find(l => l.id === lessonId);
    if (!course || !lesson || !session) return;

    // Atualiza título da aula
    _activeLessonId = lessonId;
    document.getElementById('player-lesson-title').textContent  = lesson.title;
    document.getElementById('player-lesson-number').textContent =
      `Aula ${lesson.id} de ${course.lessons.length}`;

    // Marca/desmarca como concluída e atualiza progresso
    const updatedProgress = DB.toggleLesson(session.email, courseId, lessonId);
    const total = course.lessons.length;
    const done  = updatedProgress.length;
    const pct   = Math.round((done / total) * 100);

    Render._updatePlayerProgress(done, total, pct);
    Render.playerLessonList(course, session.email, lessonId);
    lucide.createIcons();

    if (pct === 100) {
      App.showToast('🎓 Parabéns! Você concluiu o curso!', 'success');
    }
  },

  // --------------------------------------------------------
  //  Modal de Criar Curso
  // --------------------------------------------------------
  handleCreateCourse: (e) => {
    e.preventDefault();
    const session = Auth.getSession();
    if (!session) return;

    const title       = document.getElementById('course-title').value.trim();
    const category    = document.getElementById('course-cat').value.trim();
    const price       = parseFloat(document.getElementById('course-price').value);
    const description = document.getElementById('course-desc').value.trim();

    DB.addCourse({
      id: Date.now(),
      title,
      category,
      price,
      description: description || 'Descrição não informada.',
      instructor: session.name,
      lessons: []
    });

    App.toggleModal('modal-course', false);
    document.getElementById('form-create-course').reset();
    App.showToast('Curso publicado com sucesso! 🚀', 'success');
    Render.instructorPanel();
    Render.landingCourses();
  },

  toggleModal: (modalId, show) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.toggle('hidden', !show);
    modal.classList.toggle('flex',   show);
    if (show) lucide.createIcons();
  },

  // --------------------------------------------------------
  //  Bootstrap
  // --------------------------------------------------------
  init: () => {
    DB.initData();
    Render.landingCourses();
    App.checkAuth();
    lucide.createIcons();
  }
};

// Inicializa ao carregar o DOM
window.addEventListener('DOMContentLoaded', App.init);
