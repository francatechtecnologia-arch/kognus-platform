// ============================================================
//  render.js — Funções de Renderização
// ============================================================

// Estado: ID do curso em visualização/player atual
let _activeCourseId   = null;
let _activeLessonId   = null;

const Render = {

  // --- Helpers de estilo por categoria ---
  categoryColor: (cat) => {
    const map = {
      'Cabelo':    'bg-violet-500/10 text-violet-400 border-violet-500/30',
      'Negócios':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'Barbearia': 'bg-amber-500/10  text-amber-400  border-amber-500/30',
      'Design':    'bg-blue-500/10   text-blue-400   border-blue-500/30',
      'Marketing': 'bg-pink-500/10   text-pink-400   border-pink-500/30',
    };
    return map[cat] || 'bg-brand-500/10 text-brand-400 border-brand-500/30';
  },

  categoryEmoji: (cat) => {
    const map = {
      'Cabelo':    '💇',
      'Negócios':  '📊',
      'Barbearia': '✂️',
      'Design':    '🎨',
      'Marketing': '📣',
    };
    return map[cat] || '📚';
  },

  categoryGradient: (cat) => {
    const map = {
      'Cabelo':    'from-violet-900/60 to-purple-950',
      'Negócios':  'from-emerald-900/60 to-teal-950',
      'Barbearia': 'from-amber-900/60 to-orange-950',
      'Design':    'from-blue-900/60 to-indigo-950',
      'Marketing': 'from-pink-900/60 to-rose-950',
    };
    return map[cat] || 'from-zinc-800 to-zinc-900';
  },

  // --------------------------------------------------------
  //  Navbar
  // --------------------------------------------------------
  navbar: () => {
    const session = Auth.getSession();
    const navGuest = document.getElementById('nav-guest');
    const navUser  = document.getElementById('nav-user');

    if (session) {
      navGuest.classList.add('hidden');
      navUser.classList.remove('hidden');
      document.getElementById('nav-user-name').textContent = session.name;
      const badge = document.getElementById('nav-role-badge');
      badge.textContent = session.role === 'instrutor' ? 'Instrutor' : 'Aluno';
      badge.className   = session.role === 'instrutor'
        ? 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30'
        : 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30';
    } else {
      navGuest.classList.remove('hidden');
      navUser.classList.add('hidden');
    }
    lucide.createIcons();
  },

  // --------------------------------------------------------
  //  Landing — Grade de Cursos
  // --------------------------------------------------------
  landingCourses: () => {
    const courses = DB.getCourses();
    const grid = document.getElementById('landing-courses-grid');
    if (!grid) return;

    grid.innerHTML = courses.map(c => `
      <article class="course-card group bg-darkCard border border-darkBorder rounded-2xl overflow-hidden flex flex-col hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 shadow-lg cursor-pointer" onclick="App.openCourseDetail(${c.id})">
        <div class="h-40 bg-gradient-to-br ${Render.categoryGradient(c.category)} flex items-center justify-center relative overflow-hidden">
          <span class="text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 select-none">${Render.categoryEmoji(c.category)}</span>
          <div class="absolute inset-0 bg-gradient-to-t from-darkCard via-transparent to-transparent"></div>
          <span class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${Render.categoryColor(c.category)}">${c.category}</span>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-bold text-base text-white leading-snug group-hover:text-brand-300 transition-colors">${c.title}</h3>
          <p class="text-xs text-zinc-400 mt-1">por ${c.instructor}</p>
          <p class="text-xs text-zinc-500 mt-2 flex items-center gap-1">
            <i data-lucide="play-circle" class="w-3 h-3"></i> ${c.lessons ? c.lessons.length : 0} aulas
          </p>
          <div class="mt-auto pt-4 border-t border-darkBorder flex items-center justify-between">
            <span class="font-extrabold text-xl text-white">${fmtCurrency(c.price)}</span>
            <span class="bg-brand-600 group-hover:bg-brand-500 text-white text-xs px-4 py-1.5 rounded-lg transition font-medium">Ver Curso →</span>
          </div>
        </div>
      </article>
    `).join('');
    lucide.createIcons();
  },

  // --------------------------------------------------------
  //  Detalhe do Curso
  // --------------------------------------------------------
  courseDetail: (courseId) => {
    _activeCourseId = courseId;
    const course  = DB.getCourses().find(c => c.id === courseId);
    if (!course) return;

    const session    = Auth.getSession();
    const isEnrolled = session && DB.getUserEnrollments(session.email).includes(courseId);
    const progress   = session ? DB.getUserProgress(session.email, courseId) : [];
    const totalLessons = course.lessons.length;
    const pct = isEnrolled && totalLessons > 0
      ? Math.round((progress.length / totalLessons) * 100) : 0;

    // Cabeçalho da tela
    document.getElementById('detail-banner').className =
      `h-56 bg-gradient-to-br ${Render.categoryGradient(course.category)} flex items-center justify-center relative overflow-hidden`;
    document.getElementById('detail-banner-emoji').textContent = Render.categoryEmoji(course.category);

    const catEl = document.getElementById('detail-category');
    catEl.textContent = course.category;
    catEl.className   = `inline-block text-xs font-bold px-3 py-1 rounded-full border ${Render.categoryColor(course.category)}`;

    document.getElementById('detail-title').textContent       = course.title;
    document.getElementById('detail-instructor').textContent  = `por ${course.instructor}`;
    document.getElementById('detail-description').textContent = course.description;
    document.getElementById('detail-price').textContent       = fmtCurrency(course.price);
    document.getElementById('detail-lesson-count').textContent =
      `${totalLessons} aulas · ~${Render._totalDuration(course.lessons)}`;

    // Barra de progresso (se matriculado)
    const progressSection = document.getElementById('detail-progress-section');
    if (isEnrolled) {
      progressSection.classList.remove('hidden');
      document.getElementById('detail-progress-bar').style.width = `${pct}%`;
      document.getElementById('detail-progress-text').textContent = `${progress.length}/${totalLessons} aulas concluídas`;
    } else {
      progressSection.classList.add('hidden');
    }

    // Botão CTA
    const ctaBtn = document.getElementById('detail-cta-btn');
    if (session && isEnrolled) {
      ctaBtn.innerHTML = `<i data-lucide="play-circle" class="w-5 h-5"></i> ${pct > 0 ? 'Continuar Assistindo' : 'Começar Curso'}`;
      ctaBtn.className = 'w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2';
      ctaBtn.onclick   = () => App.openCoursePlayer(courseId);
    } else if (session) {
      ctaBtn.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5"></i> Matricular-se — ${fmtCurrency(course.price)}`;
      ctaBtn.className = 'w-full bg-brand-600 hover:bg-brand-500 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2';
      ctaBtn.onclick   = () => App.enrollInCourse(courseId);
    } else {
      ctaBtn.innerHTML = `<i data-lucide="log-in" class="w-5 h-5"></i> Entrar para Matricular`;
      ctaBtn.className = 'w-full bg-brand-600 hover:bg-brand-500 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2';
      ctaBtn.onclick   = () => App.navigateTo('login');
    }

    // Lista de aulas (preview)
    const lessonList = document.getElementById('detail-lessons-list');
    lessonList.innerHTML = (course.lessons || []).map((lesson, idx) => {
      const done = progress.includes(lesson.id);
      return `
        <div class="flex items-center justify-between p-3 rounded-lg border border-darkBorder bg-zinc-900/50 hover:border-zinc-600 transition">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
              ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}">${idx + 1}</span>
            <span class="text-sm ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}">${lesson.title}</span>
          </div>
          <span class="text-xs text-zinc-500 ml-2 flex-shrink-0">${lesson.duration}</span>
        </div>`;
    }).join('');

    lucide.createIcons();
  },

  _totalDuration: (lessons) => {
    let totalMin = 0;
    lessons.forEach(l => {
      const [m, s] = l.duration.split(':').map(Number);
      totalMin += m + s / 60;
    });
    const h = Math.floor(totalMin / 60);
    const m = Math.round(totalMin % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  },

  // --------------------------------------------------------
  //  Dashboard do Aluno
  // --------------------------------------------------------
  alunoPanel: () => {
    const session      = Auth.getSession();
    const enrolledIds  = DB.getUserEnrollments(session.email);
    const allCourses   = DB.getCourses();
    const enrolled     = allCourses.filter(c => enrolledIds.includes(c.id));

    document.getElementById('aluno-welcome').textContent = `Olá, ${session.name.split(' ')[0]}! 👋`;

    // Stats
    let totalCompleted = 0;
    let totalInProgress = 0;
    enrolled.forEach(c => {
      const p = DB.getUserProgress(session.email, c.id);
      if (p.length === c.lessons.length && c.lessons.length > 0) totalCompleted++;
      else if (p.length > 0) totalInProgress++;
    });
    document.getElementById('aluno-stat-total').textContent      = enrolled.length;
    document.getElementById('aluno-stat-progress').textContent   = totalInProgress;
    document.getElementById('aluno-stat-completed').textContent  = totalCompleted;

    const grid = document.getElementById('aluno-courses-grid');

    if (enrolled.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16 text-zinc-400">
          <p class="text-5xl mb-4">📚</p>
          <p class="font-semibold text-lg text-zinc-300">Nenhum curso ainda</p>
          <p class="text-sm mt-1">Explore nosso catálogo e comece a aprender hoje.</p>
          <button onclick="App.navigateTo('landing')" class="mt-6 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-brand-600/25">
            Explorar Cursos
          </button>
        </div>`;
      return;
    }

    grid.innerHTML = enrolled.map(c => {
      const progress  = DB.getUserProgress(session.email, c.id);
      const total     = c.lessons ? c.lessons.length : 0;
      const done      = progress.length;
      const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
      const completed = pct === 100;

      return `
        <article class="group bg-darkCard border border-darkBorder rounded-2xl overflow-hidden flex flex-col hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 shadow-lg">
          <div class="h-32 bg-gradient-to-br ${Render.categoryGradient(c.category)} flex items-center justify-center relative overflow-hidden">
            <span class="text-5xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 select-none">${Render.categoryEmoji(c.category)}</span>
            <div class="absolute inset-0 bg-gradient-to-t from-darkCard via-transparent to-transparent"></div>
            ${completed ? `<span class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Concluído</span>` : `<span class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">${pct}%</span>`}
          </div>
          <div class="p-4 flex flex-col flex-1">
            <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${Render.categoryColor(c.category)} mb-2">${c.category}</span>
            <h3 class="font-bold text-sm text-white leading-snug group-hover:text-brand-300 transition-colors">${c.title}</h3>
            <p class="text-xs text-zinc-400 mt-1">por ${c.instructor}</p>
            <div class="mt-3">
              <div class="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>${done}/${total} aulas</span>
                <span>${pct}% concluído</span>
              </div>
              <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-600 to-violet-400'}" style="width: ${pct}%"></div>
              </div>
            </div>
            <button onclick="App.openCoursePlayer(${c.id})" class="mt-4 w-full ${completed ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 hover:bg-zinc-700 text-white'} py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
              <i data-lucide="${completed ? 'rotate-ccw' : 'play-circle'}" class="w-4 h-4"></i>
              ${completed ? 'Rever Curso' : pct > 0 ? 'Continuar' : 'Começar'}
            </button>
          </div>
        </article>`;
    }).join('');
    lucide.createIcons();
  },

  // --------------------------------------------------------
  //  Player de Curso
  // --------------------------------------------------------
  coursePlayer: (courseId) => {
    _activeCourseId = courseId;
    const course  = DB.getCourses().find(c => c.id === courseId);
    const session = Auth.getSession();
    if (!course || !session) return;

    const progress  = DB.getUserProgress(session.email, courseId);
    const total     = course.lessons.length;
    const done      = progress.length;
    const pct       = total > 0 ? Math.round((done / total) * 100) : 0;

    // Primeira aula incompleta, ou a primeira do curso
    const firstLesson = course.lessons.find(l => !progress.includes(l.id)) || course.lessons[0];
    _activeLessonId   = firstLesson.id;

    document.getElementById('player-course-title').textContent  = course.title;
    document.getElementById('player-lesson-title').textContent  = firstLesson.title;
    document.getElementById('player-lesson-number').textContent =
      `Aula ${firstLesson.id} de ${total}`;
    Render._updatePlayerProgress(done, total, pct);
    Render.playerLessonList(course, session.email, firstLesson.id);
  },

  playerLessonList: (course, userEmail, activeLessonId) => {
    const progress = DB.getUserProgress(userEmail, course.id);
    const list = document.getElementById('player-lessons-list');

    list.innerHTML = course.lessons.map(lesson => {
      const done   = progress.includes(lesson.id);
      const active = lesson.id === activeLessonId;
      return `
        <div onclick="App.selectLesson(${course.id}, ${lesson.id})"
             class="lesson-item flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200
             ${active
               ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
               : done
                 ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                 : 'border-darkBorder bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/40'}">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
              ${done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-zinc-800 text-zinc-500'}">
              ${done
                ? '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
                : `<span class="text-[10px] font-bold">${lesson.id}</span>`}
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium ${done ? 'line-through text-zinc-500' : active ? 'text-white' : 'text-zinc-300'}">${lesson.title}</p>
            </div>
          </div>
          <span class="text-zinc-500 ml-2 flex-shrink-0 tabular-nums">${lesson.duration}</span>
        </div>`;
    }).join('');
  },

  _updatePlayerProgress: (done, total, pct) => {
    document.getElementById('player-progress-bar').style.width    = `${pct}%`;
    document.getElementById('player-progress-text').textContent   = `${done}/${total} aulas concluídas`;
    document.getElementById('player-progress-pct').textContent    = `${pct}%`;
  },

  // --------------------------------------------------------
  //  Dashboard do Instrutor (CORRIGIDO)
  // --------------------------------------------------------
  instructorPanel: () => {
    const session    = Auth.getSession();
    const allCourses = DB.getCourses();
    // CORREÇÃO: filtra apenas os cursos do instrutor logado
    const myCourses  = allCourses.filter(c => c.instructor === session.name);
    const enrollments = DB.getEnrollments();

    // CORREÇÃO: métricas calculadas dinamicamente
    let totalStudents = 0;
    let totalRevenue  = 0;

    myCourses.forEach(c => {
      const students = Object.values(enrollments).filter(ids => ids.includes(c.id)).length;
      totalStudents += students;
      totalRevenue  += students * c.price;
    });

    const netRevenue = totalRevenue * (1 - PLATFORM_FEE);

    document.getElementById('stat-gross').textContent    = fmtCurrency(totalRevenue);
    document.getElementById('stat-net').textContent      = fmtCurrency(netRevenue);
    document.getElementById('stat-students').textContent = totalStudents;
    document.getElementById('stat-courses').textContent  = myCourses.length;

    const tbody = document.getElementById('instructor-courses-tbody');
    if (myCourses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-zinc-400 text-sm">
        Nenhum curso publicado ainda. Clique em "Adicionar Novo Curso" para começar.
      </td></tr>`;
      return;
    }

    tbody.innerHTML = myCourses.map(c => {
      const students = Object.values(enrollments).filter(ids => ids.includes(c.id)).length;
      const revenue  = students * c.price;
      return `
        <tr class="hover:bg-zinc-900/30 transition">
          <td class="px-6 py-4 font-medium text-white">${c.title}</td>
          <td class="px-6 py-4">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${Render.categoryColor(c.category)}">${c.category}</span>
          </td>
          <td class="px-6 py-4 tabular-nums">${fmtCurrency(c.price)}</td>
          <td class="px-6 py-4 tabular-nums text-center">${students}</td>
          <td class="px-6 py-4 tabular-nums text-emerald-400">${fmtCurrency(revenue)}</td>
          <td class="px-6 py-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Publicado</span>
          </td>
        </tr>`;
    }).join('');
  }
};
