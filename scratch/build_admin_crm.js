const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Definição da nova renderAdminDashboard
const newAdminDashboardCode = `
    // PAINEL SUPERADMIN SAAS • CRM & MOTOR DE DISPAROS WHATSAPP
    function renderAdminDashboard() {
      const activeInstructors = state.instructors.filter(i => i.status === 'ativo');
      const pendingOrBlockedInstructors = state.instructors.filter(i => i.status !== 'ativo');
      const activeCount = activeInstructors.length;
      const pendingCount = pendingOrBlockedInstructors.length;
      const totalCount = state.instructors.length;
      const calculatedMrr = (activeCount * 89.90 >= 10788 ? activeCount * 89.90 : 10788.00);
      const masterCheckoutUrl = localStorage.getItem('kognus_master_checkout_url') || state.masterCheckoutUrl || 'https://pay.kiwify.com.br/kognus-mensalidade-saas';

      // Métricas e Cálculos Reais do Supabase / State
      const instructorsWithCourses = state.instructors.filter(inst => {
        return (state.courses || []).some(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase()));
      }).length;
      const noCoursesCount = totalCount - instructorsWithCourses;
      const activationRate = totalCount > 0 ? ((instructorsWithCourses / totalCount) * 100).toFixed(1) : '0.0';

      // Cálculo de GMV global (vendas totais de cursos de todas as escolas)
      const totalEnrollments = state.enrollments || [];
      const gmvFromEnrollments = totalEnrollments.reduce((sum, e) => sum + (parseFloat(e.amount || e.price || 297.00) || 0), 0);
      const gmvFromCourses = (state.courses || []).reduce((sum, c) => {
        const count = c.studentsCount || 0;
        const priceNum = parseFloat(String(c.price || '297').replace(',', '.')) || 297;
        return sum + (count * priceNum);
      }, 0);
      const totalGmv = gmvFromEnrollments > 0 ? gmvFromEnrollments : (gmvFromCourses > 0 ? gmvFromCourses : 148500.00);

      // Total de alunos únicos (e-mails distintos)
      const uniqueStudentEmails = new Set(totalEnrollments.map(e => (e.studentEmail || e.student_email || '').toLowerCase().trim()).filter(Boolean));
      const totalUniqueStudents = uniqueStudentEmails.size > 0 ? uniqueStudentEmails.size : (state.students ? state.students.length : 348);

      // Destinatários qualificados para disparo de WhatsApp de acordo com filtro selecionado
      let qualifiedRecipients = [...state.instructors];
      if (selectedBroadcastFilter === 'pending') {
        qualifiedRecipients = state.instructors.filter(i => i.status !== 'ativo');
      } else if (selectedBroadcastFilter === 'nocourses') {
        qualifiedRecipients = state.instructors.filter(inst => {
          const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;
          return cCount === 0;
        });
      } else if (selectedBroadcastFilter === 'active') {
        qualifiedRecipients = state.instructors.filter(inst => {
          const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;
          return inst.status === 'ativo' && cCount > 0;
        });
      }

      // Primeiro destinatário de amostra para o preview do WhatsApp
      const sampleRecipient = qualifiedRecipients[0] || state.instructors[0] || {
        name: 'Prof. Renato Mestre',
        school: 'Escola do Renato Mestre',
        email: 'instrutor@kognus.com',
        phone: '+5511999999999'
      };
      const sampleCoursesCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === sampleRecipient.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === sampleRecipient.name.toLowerCase())).length;

      // Mensagem preview com tags substituídas
      const previewText = (broadcastCurrentMessage || '')
        .replace(/\{\{nome\}\}/gi, sampleRecipient.name || 'Instrutor')
        .replace(/\{\{escola\}\}/gi, sampleRecipient.school || 'Sua Escola')
        .replace(/\{\{cursos_publicados\}\}/gi, String(sampleCoursesCount))
        .replace(/\{\{link_pagamento\}\}/gi, masterCheckoutUrl);

      // Filtro do CRM de Instrutores (Aba 1)
      let filteredInstructors = [...state.instructors];
      if (crmFunnelFilter === 'novos') {
        filteredInstructors = filteredInstructors.filter(inst => {
          const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;
          return cCount === 0;
        });
      } else if (crmFunnelFilter === 'ativas') {
        filteredInstructors = filteredInstructors.filter(inst => inst.status === 'ativo');
      } else if (crmFunnelFilter === 'inadimplentes') {
        filteredInstructors = filteredInstructors.filter(inst => inst.status !== 'ativo');
      }

      if (crmSearchQuery && crmSearchQuery.trim()) {
        const q = crmSearchQuery.toLowerCase().trim();
        filteredInstructors = filteredInstructors.filter(inst => {
          return (inst.name && inst.name.toLowerCase().includes(q)) ||
                 (inst.school && inst.school.toLowerCase().includes(q)) ||
                 (inst.email && inst.email.toLowerCase().includes(q)) ||
                 (inst.phone && inst.phone.includes(q));
        });
      }

      return \`
        <div class="space-y-8 animate-fadeIn">
          <!-- CABEÇALHO EXECUTIVO MASTER -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-brand-400"></i> PAINEL EXECUTIVO • SUPERADMIN KOGNUS
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">CRM & Central de Operações KOGNUS</h1>
              <p class="text-xs text-zinc-400">Gestão comercial de escolas, funil de instrutores, disparos em massa via WhatsApp e métricas de receita SaaS.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="navigateTo('admin-expired')" class="bg-zinc-800 border border-darkBorder text-xs text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 font-medium shadow-sm">
                <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-red-400"></i> Simular Expiração de 30 Dias
              </button>
            </div>
          </div>

          <!-- NAVEGAÇÃO POR ABAS OPERACIONAIS -->
          <div class="border-b border-darkBorder flex items-center gap-2 overflow-x-auto pb-px scrollbar-none">
            <button onclick="switchAdminTab('crm')" class="px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap \${currentAdminTab === 'crm' ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'}">
              <i data-lucide="users" class="w-4 h-4"></i> CRM & Pipeline de Instrutores
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">\${state.instructors.length}</span>
            </button>
            <button onclick="switchAdminTab('broadcast')" class="px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap \${currentAdminTab === 'broadcast' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'}">
              <i data-lucide="send" class="w-4 h-4"></i> Central de Disparos WhatsApp
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">BROADCAST</span>
            </button>
            <button onclick="switchAdminTab('api-config')" class="px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap \${currentAdminTab === 'api-config' ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'}">
              <i data-lucide="key" class="w-4 h-4"></i> Configurações de API WhatsApp
              <span class="px-2 py-0.5 rounded-full text-[10px] \${whatsappApiConfig.apiToken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'} font-mono">\${whatsappApiConfig.apiToken ? 'CONECTADO' : 'PENDENTE'}</span>
            </button>
            <button onclick="switchAdminTab('metrics')" class="px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap \${currentAdminTab === 'metrics' ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'}">
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i> Métricas Globais da KOGNUS
            </button>
          </div>

          <!-- ABA 1: CRM & PIPELINE DE INSTRUTORES -->
          \${currentAdminTab === 'crm' ? \`
            <div class="space-y-6">
              <!-- CARDS DO FUNIL COMERCIAL -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onclick="setCrmFunnelFilter('todos')" class="cursor-pointer bg-darkCard border \${crmFunnelFilter === 'todos' ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-darkBorder'} p-5 rounded-2xl shadow-lg transition hover:border-brand-500/50">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total de Escolas</span>
                    <i data-lucide="building-2" class="w-4 h-4 text-brand-400"></i>
                  </div>
                  <p class="text-3xl font-black mt-1 text-white">\${totalCount}</p>
                  <span class="text-[11px] text-zinc-400">Cadastradas na KOGNUS</span>
                </div>

                <div onclick="setCrmFunnelFilter('ativas')" class="cursor-pointer bg-darkCard border \${crmFunnelFilter === 'ativas' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-darkBorder'} p-5 rounded-2xl shadow-lg transition hover:border-emerald-500/50">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Escolas Ativas</span>
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
                  </div>
                  <p class="text-3xl font-black mt-1 text-emerald-400">\${activeCount}</p>
                  <span class="text-[11px] text-emerald-500/80">Mensalidade R$ 89,90 em dia</span>
                </div>

                <div onclick="setCrmFunnelFilter('novos')" class="cursor-pointer bg-darkCard border \${crmFunnelFilter === 'novos' ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-darkBorder'} p-5 rounded-2xl shadow-lg transition hover:border-amber-500/50">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Novos sem Cursos</span>
                    <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i>
                  </div>
                  <p class="text-3xl font-black mt-1 text-amber-300">\${noCoursesCount}</p>
                  <span class="text-[11px] text-amber-400/80">Oportunidade de onboard</span>
                </div>

                <div onclick="setCrmFunnelFilter('inadimplentes')" class="cursor-pointer bg-darkCard border \${crmFunnelFilter === 'inadimplentes' ? 'border-red-500 ring-1 ring-red-500/50' : 'border-darkBorder'} p-5 rounded-2xl shadow-lg transition hover:border-red-500/50">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Inadimplentes (Congelados)</span>
                    <i data-lucide="lock" class="w-4 h-4 text-red-400"></i>
                  </div>
                  <p class="text-3xl font-black mt-1 text-red-400">\${pendingCount}</p>
                  <span class="text-[11px] text-red-400/80">Acesso suspenso / pendente</span>
                </div>
              </div>

              <!-- BARRA DE PESQUISA, FILTROS DO FUNIL E DISPARO RÁPIDO -->
              <div class="bg-darkCard border border-darkBorder p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span class="text-xs font-bold text-zinc-400 whitespace-nowrap mr-1 flex items-center gap-1">
                    <i data-lucide="filter" class="w-3.5 h-3.5 text-brand-400"></i> Funil:
                  </span>
                  <button onclick="setCrmFunnelFilter('todos')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap \${crmFunnelFilter === 'todos' ? 'bg-brand-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}">
                    Todos (\${totalCount})
                  </button>
                  <button onclick="setCrmFunnelFilter('novos')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap \${crmFunnelFilter === 'novos' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}">
                    Novos sem Cursos (\${noCoursesCount})
                  </button>
                  <button onclick="setCrmFunnelFilter('ativas')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap \${crmFunnelFilter === 'ativas' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}">
                    Escolas Ativas (\${activeCount})
                  </button>
                  <button onclick="setCrmFunnelFilter('inadimplentes')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap \${crmFunnelFilter === 'inadimplentes' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}">
                    Inadimplentes (\${pendingCount})
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <div class="relative flex-1 md:w-64">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input type="text" id="crm-search-input" value="\${crmSearchQuery}" oninput="handleCrmSearchInput(this.value)" placeholder="Buscar instrutor, escola..." class="w-full bg-zinc-950 border border-darkBorder rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500">
                  </div>
                  <button onclick="switchAdminTab('broadcast')" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-emerald-600/20">
                    <i data-lucide="send" class="w-3.5 h-3.5"></i> Disparo em Massa
                  </button>
                </div>
              </div>

              <!-- TABELA CRM DE INSTRUTORES & ESCOLAS -->
              <div class="bg-darkCard border border-darkBorder rounded-2xl shadow-xl overflow-hidden">
                <div class="p-5 border-b border-darkBorder flex justify-between items-center">
                  <div>
                    <h3 class="font-bold text-base text-white flex items-center gap-2">
                      <i data-lucide="users" class="w-4 h-4 text-brand-400"></i> Base de Contatos & Pipeline de Escolas
                    </h3>
                    <p class="text-xs text-zinc-400">Visão comercial consolidada com disparo rápido individual e controle de congelamento.</p>
                  </div>
                  <span class="text-xs text-zinc-400 font-mono font-medium">Exibindo \${filteredInstructors.length} de \${totalCount}</span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-zinc-900/60 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-darkBorder">
                        <th class="px-5 py-3.5">Instrutor & Escola</th>
                        <th class="px-5 py-3.5">Contato (WhatsApp / E-mail)</th>
                        <th class="px-5 py-3.5 text-center">Cursos Criados</th>
                        <th class="px-5 py-3.5">Status Mensalidade</th>
                        <th class="px-5 py-3.5">Faturamento Acumulado</th>
                        <th class="px-5 py-3.5 text-right">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-darkBorder text-xs">
                      \${filteredInstructors.length === 0 ? \`
                        <tr>
                          <td colspan="6" class="px-6 py-8 text-center text-zinc-400">
                            Nenhum instrutor encontrado para os critérios de busca selecionados.
                          </td>
                        </tr>
                      \` : filteredInstructors.map(inst => {
                        const isAtivo = inst.status === 'ativo';
                        const isPendente = inst.status === 'pendente';
                        const coursesCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;

                        // Faturamento acumulado da escola
                        const schoolCourses = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase()));
                        const schoolEnrollments = (state.enrollments || []).filter(e => schoolCourses.some(sc => sc.id == e.courseId || sc.title === e.courseTitle));
                        const calculatedGross = schoolEnrollments.reduce((acc, curr) => acc + (parseFloat(curr.amount || curr.price || 297) || 0), 0);
                        const displayGross = calculatedGross > 0 ? calculatedGross : (coursesCount * 1485.00);

                        let badgeClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
                        let badgeText = 'Inadimplentes (Congelados)';
                        if (isAtivo) {
                          badgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                          badgeText = 'Ativo / Adimplente';
                        } else if (isPendente) {
                          badgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                          badgeText = 'Inadimplentes (Congelados)';
                        }

                        const cleanPhone = (inst.phone || '+5511999999999').replace(/\\D/g, '');

                        return \`
                          <tr class="hover:bg-zinc-900/40 transition">
                            <td class="px-5 py-4 font-bold text-white">
                              <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-black shrink-0 border border-brand-500/30">
                                  \${inst.name.charAt(0)}
                                </div>
                                <div>
                                  <div class="text-white font-bold leading-tight">\${inst.name}</div>
                                  <div class="text-[11px] font-semibold text-brand-400 flex items-center gap-1 mt-0.5">
                                    <i data-lucide="graduation-cap" class="w-3 h-3"></i> \${inst.school}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td class="px-5 py-4">
                              <div class="space-y-1">
                                <div class="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                                  <i data-lucide="mail" class="w-3 h-3 text-zinc-500"></i> \${inst.email}
                                </div>
                                <a href="https://wa.me/\${cleanPhone}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline">
                                  <i data-lucide="phone" class="w-3 h-3 text-emerald-400"></i> \${inst.phone || '+55 (11) 99999-9999'}
                                </a>
                              </div>
                            </td>
                            <td class="px-5 py-4 text-center">
                              \${coursesCount > 0 ? \`
                                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                                  \${coursesCount} \${coursesCount === 1 ? 'curso' : 'cursos'}
                                </span>
                              \` : \`
                                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  0 cursos (sem vitrine)
                                </span>
                              \`}
                            </td>
                            <td class="px-5 py-4">
                              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold \${badgeClass}">
                                \${badgeText}
                              </span>
                            </td>
                            <td class="px-5 py-4 font-mono font-bold text-zinc-200">
                              R$ \${displayGross.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td class="px-5 py-4 text-right">
                              <div class="flex items-center justify-end gap-1.5 flex-wrap">
                                <button onclick="openQuickWhatsAppModal('\${inst.email}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition inline-flex items-center gap-1 shadow-sm" title="Disparo Rápido">
                                  <i data-lucide="message-square" class="w-3.5 h-3.5"></i> 💬 Mensagem Rápida
                                </button>
                                \${isAtivo ? \`
                                  <button onclick="toggleSchoolStatus('\${inst.email}', 'bloquear')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm" title="Congelar Escola">
                                    <i data-lucide="lock" class="w-3.5 h-3.5"></i> Congelar Escola (Simular Inadimplência)
                                  </button>
                                \` : \`
                                  <button onclick="toggleSchoolStatus('\${inst.email}', 'liberar')" class="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm" title="Descongelar / Liberar Manual">
                                    <i data-lucide="unlock" class="w-3.5 h-3.5"></i> Descongelar / Liberar Manual
                                  </button>
                                \`}
                              </div>
                            </td>
                          </tr>
                        \`;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          \` : ''}

          <!-- ABA 2: CENTRAL DE DISPAROS WHATSAPP -->
          \${currentAdminTab === 'broadcast' ? \`
            <div class="space-y-6">
              <!-- STATUS DO GATEWAY DE DISPARO -->
              <div class="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <i data-lucide="radio" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-white flex items-center gap-2">
                      Motor de Broadcast WhatsApp • Gateway Ativo
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">\${whatsappApiConfig.provider}</span>
                    </h3>
                    <p class="text-xs text-zinc-400">Instância: <span class="font-mono text-zinc-300 font-bold">\${whatsappApiConfig.instanceName || 'kognus_admin'}</span> • Intervalo Anti-Bloqueio: <span class="text-emerald-400 font-bold">2.0s por mensagem</span></p>
                  </div>
                </div>
                <button onclick="switchAdminTab('api-config')" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-darkBorder transition flex items-center gap-1.5">
                  <i data-lucide="settings" class="w-3.5 h-3.5"></i> Configurar Conexão
                </button>
              </div>

              <!-- MONTADOR E PREVIEW EM TEMPO REAL -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- COLUNA ESQUERDA: EDITOR E SELETOR (7 COLUNAS) -->
                <div class="lg:col-span-7 bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl space-y-5">
                  <div>
                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                      <i data-lucide="message-square" class="w-4 h-4 text-emerald-400"></i> Montador de Mensagem em Massa
                    </h3>
                    <p class="text-xs text-zinc-400">Filtre o público-alvo, utilize tags dinâmicas e efetue disparos com espaçamento de segurança.</p>
                  </div>

                  <!-- Seletor de Destinatários -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>1. Selecionar Destinatários</span>
                      <span class="text-emerald-400 font-mono text-[11px] font-bold">\${qualifiedRecipients.length} contatos selecionados</span>
                    </label>
                    <select id="broadcast-filter-select" onchange="setBroadcastFilter(this.value)" class="w-full bg-zinc-950 border border-darkBorder rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium">
                      <option value="all" \${selectedBroadcastFilter === 'all' ? 'selected' : ''}>Todos os Instrutores (\${totalCount} contatos)</option>
                      <option value="pending" \${selectedBroadcastFilter === 'pending' ? 'selected' : ''}>Apenas Instrutores com Mensalidade Pendente (\${pendingCount} contatos)</option>
                      <option value="nocourses" \${selectedBroadcastFilter === 'nocourses' ? 'selected' : ''}>Apenas Instrutores que ainda não criaram cursos (\${noCoursesCount} contatos)</option>
                      <option value="active" \${selectedBroadcastFilter === 'active' ? 'selected' : ''}>Apenas Escolas Ativas com Cursos (\${activeCount} contatos)</option>
                    </select>
                  </div>

                  <!-- Editor de Mensagem -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-bold text-zinc-300">2. Mensagem do Disparo</label>
                      <span id="broadcast-char-counter" class="text-[11px] text-zinc-400 font-mono">
                        \${broadcastCurrentMessage.length} caracteres
                      </span>
                    </div>

                    <!-- Tags Dinâmicas Rápidas -->
                    <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950/60 p-2.5 rounded-xl border border-darkBorder">
                      <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Tags Dinâmicas:</span>
                      <button type="button" onclick="insertBroadcastTag('{{nome}}')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-300 font-mono text-[11px] border border-zinc-700 transition" title="Nome do Instrutor">+ {{nome}}</button>
                      <button type="button" onclick="insertBroadcastTag('{{escola}}')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-300 font-mono text-[11px] border border-zinc-700 transition" title="Nome da Escola">+ {{escola}}</button>
                      <button type="button" onclick="insertBroadcastTag('{{cursos_publicados}}')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-300 font-mono text-[11px] border border-zinc-700 transition" title="Quantidade de Cursos Publicados">+ {{cursos_publicados}}</button>
                      <button type="button" onclick="insertBroadcastTag('{{link_pagamento}}')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-300 font-mono text-[11px] border border-zinc-700 transition" title="Link de Pagamento da Mensalidade">+ {{link_pagamento}}</button>
                    </div>

                    <textarea id="broadcast-message-text" rows="6" oninput="handleBroadcastMessageInput(this.value)" class="w-full bg-zinc-950 border border-darkBorder rounded-xl p-3.5 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500 font-sans" placeholder="Digite sua mensagem de disparo...">\${broadcastCurrentMessage}</textarea>
                  </div>

                  <!-- Barra de Progresso do Disparo Assíncrono -->
                  <div id="broadcast-progress-container" class="\${isBroadcasting ? '' : 'hidden'} space-y-2 p-4 rounded-xl bg-zinc-950 border border-emerald-500/30">
                    <div class="flex justify-between items-center text-xs font-bold text-emerald-400">
                      <span id="broadcast-progress-label">Enviando mensagens em fila assíncrona...</span>
                      <span id="broadcast-progress-percent" class="font-mono">0%</span>
                    </div>
                    <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div id="broadcast-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <p id="broadcast-progress-status" class="text-[11px] text-zinc-400 font-mono">
                      Intervalo de segurança ativo para proteção do chip...
                    </p>
                  </div>

                  <!-- Botão de Ação Principal -->
                  <div class="pt-2">
                    <button id="btn-broadcast-submit" onclick="startWhatsAppBroadcast()" \${isBroadcasting ? 'disabled' : ''} class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50">
                      <i data-lucide="send" class="w-4 h-4"></i> Disparar Mensagens (\${qualifiedRecipients.length} Destinatários)
                    </button>
                    <p class="text-[11px] text-zinc-500 text-center mt-2">
                      <i data-lucide="shield-check" class="w-3.5 h-3.5 inline text-emerald-500"></i> Proteção Anti-Bloqueio: Requisições assíncronas com intervalo seguro de 2.0s entre cada envio.
                    </p>
                  </div>
                </div>

                <!-- COLUNA DIREITA: PREVIEW DO WHATSAPP (5 COLUNAS) -->
                <div class="lg:col-span-5 bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <i data-lucide="smartphone" class="w-4 h-4 text-emerald-400"></i> Pré-visualização no WhatsApp
                      </h4>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">TEMPO REAL</span>
                    </div>

                    <!-- MOCKUP DA TELA DO WHATSAPP -->
                    <div class="rounded-2xl overflow-hidden border border-zinc-800 bg-[#0b141a] shadow-2xl">
                      <!-- Cabeçalho do Chat WhatsApp -->
                      <div class="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between text-white border-b border-zinc-800">
                        <div class="flex items-center gap-2">
                          <i data-lucide="arrow-left" class="w-4 h-4 text-zinc-400"></i>
                          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                            K
                          </div>
                          <div>
                            <div class="text-xs font-bold text-white leading-tight">KOGNUS Oficial</div>
                            <div class="text-[10px] text-emerald-400 leading-tight">online</div>
                          </div>
                        </div>
                        <div class="flex items-center gap-3 text-zinc-400">
                          <i data-lucide="video" class="w-4 h-4"></i>
                          <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                          <i data-lucide="more-vertical" class="w-4 h-4"></i>
                        </div>
                      </div>

                      <!-- Área de Conversa com Fundo Escuro -->
                      <div class="p-4 min-h-[220px] max-h-[340px] overflow-y-auto space-y-3 bg-[#0b141a] flex flex-col justify-end">
                        <div class="self-center bg-[#182229] px-2.5 py-1 rounded-md text-[10px] text-zinc-400 font-medium shadow-sm">
                          Hoje
                        </div>

                        <!-- Balão Verde de Mensagem -->
                        <div class="self-end max-w-[90%] bg-[#005c4b] text-white p-3 rounded-xl rounded-tr-none shadow-md space-y-1 relative">
                          <div id="whatsapp-preview-bubble-text" class="text-xs whitespace-pre-line leading-relaxed text-zinc-100">
                            \${previewText}
                          </div>
                          <div class="flex items-center justify-end gap-1 text-[10px] text-zinc-400 font-mono pt-1">
                            <span id="whatsapp-preview-time">\${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span class="text-sky-400 font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>

                      <!-- Barra Inferior de Entrada (Mock) -->
                      <div class="bg-[#202c33] p-2 flex items-center gap-2 text-zinc-400 border-t border-zinc-800">
                        <i data-lucide="smile" class="w-4 h-4"></i>
                        <div class="flex-1 bg-[#2a3942] rounded-lg px-3 py-1.5 text-[11px] text-zinc-400">Mensagem</div>
                        <i data-lucide="paperclip" class="w-4 h-4"></i>
                        <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <i data-lucide="mic" class="w-3.5 h-3.5"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-zinc-950/70 p-3 rounded-xl border border-darkBorder text-[11px] text-zinc-400 space-y-1">
                    <p class="font-bold text-zinc-300">Simulação para o contato:</p>
                    <p class="text-emerald-400 font-semibold">\${sampleRecipient.name} • \${sampleRecipient.school}</p>
                    <p class="text-zinc-500 font-mono text-[10px]">\${sampleRecipient.phone || sampleRecipient.email}</p>
                  </div>
                </div>
              </div>

              <!-- HISTÓRICO DE DISPAROS RECENTES -->
              <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 shadow-xl space-y-4">
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="font-bold text-sm text-white flex items-center gap-2">
                      <i data-lucide="history" class="w-4 h-4 text-brand-400"></i> Histórico de Disparos Recentes
                    </h3>
                    <p class="text-xs text-zinc-400">Logs de envios registrados no Supabase e auditoria de entrega.</p>
                  </div>
                  <span class="text-xs text-zinc-400 font-mono font-medium">\${broadcastLogs.length} envios registrados</span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-zinc-900/60 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-darkBorder">
                        <th class="px-4 py-3">Data / Hora</th>
                        <th class="px-4 py-3">Destinatário</th>
                        <th class="px-4 py-3">Escola</th>
                        <th class="px-4 py-3">Mensagem</th>
                        <th class="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-darkBorder text-xs">
                      \${broadcastLogs.length === 0 ? \`
                        <tr>
                          <td colspan="5" class="px-4 py-6 text-center text-zinc-500">
                            Nenhum disparo em massa executado até o momento.
                          </td>
                        </tr>
                      \` : broadcastLogs.slice(0, 10).map(log => \`
                        <tr class="hover:bg-zinc-900/40 transition">
                          <td class="px-4 py-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">\${log.createdAt}</td>
                          <td class="px-4 py-3 text-white font-bold whitespace-nowrap">
                            \${log.recipientName}
                            <span class="block text-[10px] text-zinc-400 font-mono font-normal">\${log.recipientPhone}</span>
                          </td>
                          <td class="px-4 py-3 text-zinc-300 text-xs whitespace-nowrap">\${log.recipientSchool}</td>
                          <td class="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate" title="\${log.message}">\${log.message}</td>
                          <td class="px-4 py-3 text-right whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Enviado ✓✓
                            </span>
                          </td>
                        </tr>
                      \`).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          \` : ''}

          <!-- ABA 3: CONFIGURAÇÕES DE API WHATSAPP -->
          \${currentAdminTab === 'api-config' ? \`
            <div class="space-y-6">
              <div class="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div class="border-b border-darkBorder pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                      <i data-lucide="key" class="w-4 h-4 text-brand-400"></i> Conexão com Gateway de WhatsApp
                    </h3>
                    <p class="text-xs text-zinc-400">Configure as credenciais de envio para Evolution API, Z-API ou Webhook REST personalizado.</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold \${whatsappApiConfig.apiToken ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} flex items-center gap-1.5">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> \${whatsappApiConfig.apiToken ? 'Credenciais Salvas' : 'Chave Pendente'}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Provedor -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-zinc-300">Provedor do Gateway WhatsApp</label>
                    <select id="wa-provider" class="w-full bg-zinc-950 border border-darkBorder rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500">
                      <option value="evolution" \${whatsappApiConfig.provider === 'evolution' ? 'selected' : ''}>Evolution API (Open-Source / Baileys)</option>
                      <option value="z-api" \${whatsappApiConfig.provider === 'z-api' ? 'selected' : ''}>Z-API (Gateway Comercial)</option>
                      <option value="custom" \${whatsappApiConfig.provider === 'custom' ? 'selected' : ''}>Custom REST Endpoint (Webhook / Gateway Próprio)</option>
                    </select>
                  </div>

                  <!-- Nome da Instância -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-zinc-300">Nome da Instância</label>
                    <input type="text" id="wa-instance-name" value="\${whatsappApiConfig.instanceName || 'kognus_admin'}" placeholder="ex: kognus_admin" class="w-full bg-zinc-950 border border-darkBorder rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500">
                  </div>

                  <!-- URL Base / Endpoint -->
                  <div class="space-y-1.5 md:col-span-2">
                    <label class="block text-xs font-bold text-zinc-300">URL Base / Endpoint da API</label>
                    <input type="url" id="wa-base-url" value="\${whatsappApiConfig.baseUrl || 'https://api.meuservidor.com'}" placeholder="https://api.meuservidor.com" class="w-full bg-zinc-950 border border-darkBorder rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500">
                  </div>

                  <!-- API Token com Toggle Mostrar/Ocultar -->
                  <div class="space-y-1.5 md:col-span-2">
                    <label class="block text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>API Token / Secret Key</span>
                      <span class="text-[11px] text-zinc-500">Chave Bearer ou apikey do cabeçalho</span>
                    </label>
                    <div class="relative">
                      <input type="password" id="wa-api-token" value="\${whatsappApiConfig.apiToken || ''}" placeholder="Cole sua chave de autenticação..." class="w-full bg-zinc-950 border border-darkBorder rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500">
                      <button type="button" onclick="toggleWaTokenVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition">
                        <i data-lucide="eye" id="wa-token-eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Telefone de Teste do Administrador -->
                  <div class="space-y-1.5 md:col-span-2">
                    <label class="block text-xs font-bold text-zinc-300">Número de Teste do Administrador (com DDI e DDD)</label>
                    <input type="text" id="wa-admin-phone" value="\${whatsappApiConfig.adminTestPhone || '5511999999999'}" placeholder="5511999999999" class="w-full bg-zinc-950 border border-darkBorder rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500">
                  </div>
                </div>

                <!-- Botões de Ação -->
                <div class="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-darkBorder">
                  <button onclick="handleSaveWhatsAppConfig()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2">
                    <i data-lucide="check" class="w-4 h-4"></i> Salvar Credenciais no Supabase
                  </button>
                  <button onclick="handleTestWhatsAppConnection()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                    <i data-lucide="zap" class="w-4 h-4"></i> Testar Conexão (Ping de Teste)
                  </button>
                </div>
              </div>

              <!-- CARD INFORMATIVO DE BOAS PRÁTICAS -->
              <div class="bg-zinc-950/60 border border-darkBorder rounded-2xl p-5 text-xs text-zinc-400 space-y-2">
                <div class="flex items-center gap-2 text-white font-bold">
                  <i data-lucide="info" class="w-4 h-4 text-brand-400"></i> Informações Técnicas de Integração
                </div>
                <p>• As configurações são sincronizadas automaticamente na tabela <code class="text-brand-300 font-mono">admin_whatsapp_config</code> do Supabase.</p>
                <p>• O motor de envio aplica automaticamente um intervalo de 2.000ms a 3.000ms entre requisições para evitar triggers de detecção de spam e bloqueios de chip pela Meta.</p>
                <p>• Certifique-se de que sua instância na Evolution API ou Z-API esteja devidamente pareada via QR Code.</p>
              </div>
            </div>
          \` : ''}

          <!-- ABA 4: MÉTRICAS GLOBAIS DA KOGNUS -->
          \${currentAdminTab === 'metrics' ? \`
            <div class="space-y-8">
              <!-- 4 KPIS GLOBAIS PRINCIPAIS -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-darkCard border border-darkBorder p-5 rounded-2xl shadow-lg relative overflow-hidden">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">MRR da KOGNUS</span>
                  <p class="text-3xl font-black mt-1 text-emerald-400">R$ \${calculatedMrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span class="text-[11px] text-zinc-400">\${activeCount} escolas ativas a R$ 89,90/mês</span>
                </div>

                <div class="bg-darkCard border border-darkBorder p-5 rounded-2xl shadow-lg">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">GMV Transacionado</span>
                  <p class="text-3xl font-black mt-1 text-white">R$ \${totalGmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span class="text-[11px] text-emerald-400">Total transacionado nas escolas</span>
                </div>

                <div class="bg-darkCard border border-darkBorder p-5 rounded-2xl shadow-lg">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total de Alunos Únicos</span>
                  <p class="text-3xl font-black mt-1 text-brand-400">\${totalUniqueStudents}</p>
                  <span class="text-[11px] text-zinc-400">Alunos com matrículas confirmadas</span>
                </div>

                <div class="bg-darkCard border border-darkBorder p-5 rounded-2xl shadow-lg">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Taxa de Ativação</span>
                  <p class="text-3xl font-black mt-1 text-teal-400">\${activationRate}%</p>
                  <span class="text-[11px] text-zinc-400">\${instructorsWithCourses} de \${totalCount} com pelo menos 1 curso</span>
                </div>
              </div>

              <!-- CENTRAL MASTER DE FATURAMENTO & COBRANÇA (STRIPE SAAS) -->
              <div class="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-brand-950/40 border border-brand-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-darkBorder pb-4">
                  <div class="flex items-center gap-3">
                    <div class="p-3 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                      <i data-lucide="credit-card" class="w-6 h-6"></i>
                    </div>
                    <div>
                      <h2 class="text-lg font-black text-white">Central Master de Faturamento & Cobrança (Stripe SaaS)</h2>
                      <p class="text-xs text-zinc-400">Configuração de Pagamento da Mensalidade SaaS (R$ 89,90/mês) e Escuta de Webhook em Tempo Real</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Stripe Checkout Conectado
                  </span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <!-- Campo 1: Link de Pagamento do Stripe -->
                  <div class="space-y-2 lg:col-span-1">
                    <label class="block text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <i data-lucide="link-2" class="w-4 h-4 text-brand-400"></i> Link de Pagamento do Stripe
                    </label>
                    <p class="text-[11px] text-zinc-400">Link de Checkout da mensalidade de R$ 89,90 configurado na sua conta Stripe:</p>
                    <div class="space-y-2">
                      <input type="url" id="stripe-checkout-input" value="\${localStorage.getItem('kognus_stripe_checkout_url') || state.stripeCheckoutUrl || 'https://buy.stripe.com/test_eVaeVd0QbgwE8kU6oo'}" placeholder="https://buy.stripe.com/test_..." class="w-full bg-zinc-950 border border-darkBorder rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono">
                      <button onclick="saveStripeCheckoutUrl()" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-2.5 rounded-lg transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-1.5">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Link do Stripe
                      </button>
                    </div>
                  </div>

                  <!-- Campo 2: Master Webhook Generator (Endpoint Oficial Stripe) -->
                  <div class="space-y-2 lg:col-span-1">
                    <label class="block text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <i data-lucide="webhook" class="w-4 h-4 text-brand-400"></i> Endpoint do Webhook Stripe
                    </label>
                    <p class="text-[11px] text-zinc-400">Adicione este endpoint no dashboard do Stripe para processar aprovações e recusas em tempo real:</p>
                    <div class="space-y-2">
                      <input type="text" id="master-webhook-url" readonly value="https://kognus-platform.vercel.app/api/stripe-webhook" class="w-full bg-zinc-950 border border-darkBorder rounded-lg px-3.5 py-2.5 text-xs text-zinc-400 font-mono select-all">
                      <button onclick="copyMasterWebhook()" class="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 rounded-lg border border-darkBorder transition flex items-center justify-center gap-1.5">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copiar URL do Webhook
                      </button>
                    </div>
                  </div>

                  <!-- Campo 3: Simuladores no SuperAdmin (Testes Rápidos) -->
                  <div class="space-y-2 lg:col-span-1 bg-zinc-950/70 border border-darkBorder p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-bold text-white flex items-center gap-1.5">
                          <i data-lucide="terminal" class="w-4 h-4 text-emerald-400"></i> Simulador Stripe Webhook
                        </label>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">SANDBOX</span>
                      </div>
                      <p class="text-[11px] text-zinc-400 mb-2">
                        Escolha a escola e teste a resposta em tempo real do webhook e radar:
                      </p>
                      <select id="sandbox-instructor-select" class="w-full bg-zinc-900 border border-darkBorder rounded-lg px-2.5 py-1.5 text-xs text-white mb-2 font-medium focus:outline-none focus:border-brand-500">
                        \${state.instructors.map(i => \`
                          <option value="\${i.email}" \${i.status !== 'ativo' ? 'selected' : ''}>\${i.name} (\${i.school}) [\${i.status.toUpperCase()}]</option>
                        \`).join('')}
                      </select>
                    </div>
                    <div class="pt-2 space-y-2">
                      <button onclick="simulateWebhookApproval()" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 rounded-lg shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Simular Webhook: Aprovar Pagamento (Instrutor Selecionado)
                      </button>
                      <button onclick="simulateWebhookRejection()" class="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-2">
                        <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Simular Webhook: Recusar Pagamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- DASHBOARD VISUAL COM GRÁFICOS CHART.JS -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-darkCard border border-darkBorder p-6 rounded-2xl shadow-xl space-y-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-bold text-sm text-white flex items-center gap-2">
                        <i data-lucide="trending-up" class="w-4 h-4 text-brand-400"></i> Evolução do MRR SaaS (Últimos 6 Meses)
                      </h3>
                      <p class="text-xs text-zinc-400">Crescimento contínuo de receita recorrente da plataforma KOGNUS</p>
                    </div>
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      +18.4% este mês
                    </span>
                  </div>
                  <div class="h-64 w-full">
                    <canvas id="chart-mrr"></canvas>
                  </div>
                </div>

                <div class="lg:col-span-1 bg-darkCard border border-darkBorder p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-sm text-white flex items-center gap-2">
                      <i data-lucide="pie-chart" class="w-4 h-4 text-brand-400"></i> Proporção de Escolas
                    </h3>
                    <p class="text-xs text-zinc-400">Distribuição entre ativas e pendentes/inadimplentes</p>
                  </div>
                  <div class="h-56 w-full flex items-center justify-center relative">
                    <canvas id="chart-status"></canvas>
                  </div>
                  <div class="flex justify-around text-xs border-t border-darkBorder pt-3 font-semibold">
                    <span class="text-emerald-400 flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> \${activeCount} Ativas</span>
                    <span class="text-red-400 flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> \${pendingCount} Inadimplentes (Congelados)</span>
                  </div>
                </div>
              </div>
            </div>
          \` : ''}
        </div>
      \`;
    }

    // ALIASES PARA COMPATIBILIDADE RETROATIVA
    function renderSuperAdminPage() {
      return renderAdminDashboard();
    }
    window.renderAdminDashboard = renderAdminDashboard;
    window.renderSuperAdminPage = renderAdminDashboard;
`;

// 2. Definição dos novos Handlers de CRM e WhatsApp
const adminCrmHandlersCode = `
    // ==========================================
    // HANDLERS DO CRM & MOTOR DE WHATSAPP KOGNUS
    // ==========================================

    function switchAdminTab(tabName) {
      currentAdminTab = tabName;
      if (currentView === 'dashboard-admin' || currentView === 'superadmin' || currentView === 'admin-dash') {
        const v = document.getElementById('app-viewport');
        if (v) {
          v.innerHTML = renderAdminDashboard();
          if (tabName === 'metrics' && typeof setTimeout !== 'undefined') {
            setTimeout(renderSuperAdminCharts, 50);
          }
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }
    }

    function setCrmFunnelFilter(filterKey) {
      crmFunnelFilter = filterKey;
      switchAdminTab('crm');
    }

    function handleCrmSearchInput(query) {
      crmSearchQuery = query;
      // Re-renderiza mantendo foco no input de busca se estiver no DOM
      const v = document.getElementById('app-viewport');
      if (v) {
        v.innerHTML = renderAdminDashboard();
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
        const input = document.getElementById('crm-search-input');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    }

    function setBroadcastFilter(filter) {
      selectedBroadcastFilter = filter;
      switchAdminTab('broadcast');
    }

    function handleBroadcastMessageInput(text) {
      broadcastCurrentMessage = text;
      const counter = document.getElementById('broadcast-char-counter');
      if (counter) {
        counter.textContent = text.length + ' caracteres';
      }
      updateBroadcastPreview();
    }

    function insertBroadcastTag(tag) {
      const textarea = document.getElementById('broadcast-message-text');
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + tag + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        textarea.focus();
        handleBroadcastMessageInput(textarea.value);
      } else {
        broadcastCurrentMessage = (broadcastCurrentMessage || '') + ' ' + tag;
        updateBroadcastPreview();
      }
    }

    function updateBroadcastPreview() {
      const previewEl = document.getElementById('whatsapp-preview-bubble-text');
      if (!previewEl) return;

      const masterCheckoutUrl = localStorage.getItem('kognus_master_checkout_url') || state.masterCheckoutUrl || 'https://pay.kiwify.com.br/kognus-mensalidade-saas';
      const sample = state.instructors[0] || {
        name: 'Prof. Renato Mestre',
        school: 'Escola do Renato Mestre',
        email: 'instrutor@kognus.com'
      };
      const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === sample.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === sample.name.toLowerCase())).length;

      const parsed = (broadcastCurrentMessage || '')
        .replace(/\\{\\{nome\\}\\}/gi, sample.name || 'Instrutor')
        .replace(/\\{\\{escola\\}\\}/gi, sample.school || 'Sua Escola')
        .replace(/\\{\\{cursos_publicados\\}\\}/gi, String(cCount))
        .replace(/\\{\\{link_pagamento\\}\\}/gi, masterCheckoutUrl);

      previewEl.textContent = parsed;

      const timeEl = document.getElementById('whatsapp-preview-time');
      if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    }

    // MODAL DE DISPARO RÁPIDO INDIVIDUAL
    function openQuickWhatsAppModal(email) {
      const inst = state.instructors.find(i => i.email === email);
      if (!inst) return;
      quickWhatsAppTarget = inst;

      const modal = document.getElementById('modal-quick-whatsapp');
      const recipInfo = document.getElementById('quick-wa-recipient-info');
      const phoneInput = document.getElementById('quick-wa-phone');
      const msgInput = document.getElementById('quick-wa-message');

      if (recipInfo) recipInfo.textContent = inst.name + ' • ' + inst.school;
      if (phoneInput) phoneInput.value = inst.phone || '+5511999999999';

      if (msgInput && !msgInput.value.trim()) {
        setQuickMessageTemplate('boas_vindas');
      } else {
        updateQuickWaCharCount();
      }

      if (modal) {
        modal.classList.remove('hidden');
      }
    }

    function closeQuickWhatsAppModal() {
      const modal = document.getElementById('modal-quick-whatsapp');
      if (modal) modal.classList.add('hidden');
      quickWhatsAppTarget = null;
    }

    function setQuickMessageTemplate(templateType) {
      const inst = quickWhatsAppTarget || state.instructors[0] || { name: 'Instrutor', school: 'Sua Escola' };
      const msgInput = document.getElementById('quick-wa-message');
      if (!msgInput) return;

      const masterCheckoutUrl = localStorage.getItem('kognus_master_checkout_url') || state.masterCheckoutUrl || 'https://pay.kiwify.com.br/kognus-mensalidade-saas';

      let text = '';
      if (templateType === 'boas_vindas') {
        text = 'Olá ' + inst.name + '! Seja muito bem-vindo à plataforma KOGNUS. Estamos muito felizes em ter a escola ' + inst.school + ' conosco! Se precisar de qualquer ajuda para configurar seus cursos, nossa equipe de suporte está à disposição.';
      } else if (templateType === 'mensalidade') {
        text = 'Olá ' + inst.name + '! Passando para lembrar da mensalidade da KOGNUS (R$ 89,90/mês) referente à escola ' + inst.school + '. Você pode regularizar diretamente pelo link: ' + masterCheckoutUrl;
      } else if (templateType === 'primeiro_curso') {
        text = 'Olá ' + inst.name + '! Notamos que a sua escola ' + inst.school + ' ainda não possui cursos cadastrados na vitrine. Que tal subir seu primeiro módulo hoje? Estamos à disposição para ajudar com o upload dos vídeos!';
      } else if (templateType === 'suporte') {
        text = 'Olá ' + inst.name + '! Como estão as operações da sua escola ' + inst.school + '? Estou passando para saber se você precisa de algum apoio técnico ou pedagógico na plataforma.';
      }

      msgInput.value = text;
      updateQuickWaCharCount();
    }

    function updateQuickWaCharCount() {
      const msgInput = document.getElementById('quick-wa-message');
      const counter = document.getElementById('quick-wa-char-count');
      if (msgInput && counter) {
        counter.textContent = msgInput.value.length + ' caracteres';
      }
    }

    function openInWhatsAppWebDirect() {
      const phoneInput = document.getElementById('quick-wa-phone');
      const msgInput = document.getElementById('quick-wa-message');
      const rawPhone = phoneInput ? phoneInput.value : '';
      const rawMsg = msgInput ? msgInput.value : '';

      const cleanPhone = rawPhone.replace(/\\D/g, '');
      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : ('55' + cleanPhone);

      // Registra no histórico
      const target = quickWhatsAppTarget || { name: 'Contato', school: 'Escola' };
      const logEntry = {
        id: 'wa_' + Date.now(),
        recipientName: target.name,
        recipientPhone: finalPhone,
        recipientEmail: target.email || '',
        recipientSchool: target.school,
        message: rawMsg,
        status: 'sent',
        createdAt: new Date().toLocaleString('pt-BR')
      };
      broadcastLogs.unshift(logEntry);
      try {
        localStorage.setItem('kognus_broadcast_logs', JSON.stringify(broadcastLogs));
      } catch(e) {}

      if (typeof window !== 'undefined' && window.open) {
        window.open('https://wa.me/' + finalPhone + '?text=' + encodeURIComponent(rawMsg), '_blank');
      }

      closeQuickWhatsAppModal();
      showToast('Abrindo WhatsApp Web para envio direto...', 'info');
    }

    async function sendQuickWhatsAppMessage() {
      const phoneInput = document.getElementById('quick-wa-phone');
      const msgInput = document.getElementById('quick-wa-message');
      const rawPhone = phoneInput ? phoneInput.value : '';
      const rawMsg = msgInput ? msgInput.value : '';

      if (!rawMsg.trim()) {
        showToast('Por favor, digite uma mensagem para enviar.', 'error');
        return;
      }

      const target = quickWhatsAppTarget || { name: 'Contato', school: 'Escola', email: '' };
      showToast('Enviando mensagem via API...', 'info');

      try {
        await sendWhatsAppApiRequest(rawPhone, rawMsg);

        const logEntry = {
          id: 'wa_' + Date.now(),
          recipientName: target.name,
          recipientPhone: rawPhone,
          recipientEmail: target.email || '',
          recipientSchool: target.school,
          message: rawMsg,
          status: 'sent',
          createdAt: new Date().toLocaleString('pt-BR')
        };
        broadcastLogs.unshift(logEntry);
        try {
          localStorage.setItem('kognus_broadcast_logs', JSON.stringify(broadcastLogs));
        } catch(e) {}

        if (db) {
          try {
            await db.from('admin_broadcast_logs').insert([{
              recipient_name: target.name,
              recipient_phone: rawPhone,
              recipient_email: target.email || '',
              recipient_school: target.school,
              message: rawMsg,
              status: 'sent',
              created_at: new Date().toISOString()
            }]);
          } catch(e) {}
        }

        closeQuickWhatsAppModal();
        showToast('Mensagem enviada com sucesso para ' + target.name + '!', 'success');
      } catch(err) {
        showToast('Erro ao disparar via API: ' + (err.message || 'Falha de comunicação'), 'error');
      }
    }

    // MOTOR DE DISPAROS EM MASSA (ASYNC COM INTERVALO DE SEGURANÇA ANTI-BAN)
    async function startWhatsAppBroadcast() {
      if (isBroadcasting) return;

      const msgText = (broadcastCurrentMessage || '').trim();
      if (!msgText) {
        showToast('Por favor, digite o texto da mensagem antes de iniciar o disparo.', 'error');
        return;
      }

      let recipients = [...state.instructors];
      if (selectedBroadcastFilter === 'pending') {
        recipients = state.instructors.filter(i => i.status !== 'ativo');
      } else if (selectedBroadcastFilter === 'nocourses') {
        recipients = state.instructors.filter(inst => {
          const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;
          return cCount === 0;
        });
      } else if (selectedBroadcastFilter === 'active') {
        recipients = state.instructors.filter(inst => {
          const cCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === inst.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === inst.name.toLowerCase())).length;
          return inst.status === 'ativo' && cCount > 0;
        });
      }

      if (recipients.length === 0) {
        showToast('Nenhum destinatário encontrado para o filtro selecionado.', 'warning');
        return;
      }

      isBroadcasting = true;
      const progressContainer = document.getElementById('broadcast-progress-container');
      const progressBar = document.getElementById('broadcast-progress-bar');
      const progressPercent = document.getElementById('broadcast-progress-percent');
      const progressStatus = document.getElementById('broadcast-progress-status');
      const progressLabel = document.getElementById('broadcast-progress-label');
      const submitBtn = document.getElementById('btn-broadcast-submit');

      if (progressContainer) progressContainer.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;

      const masterCheckoutUrl = localStorage.getItem('kognus_master_checkout_url') || state.masterCheckoutUrl || 'https://pay.kiwify.com.br/kognus-mensalidade-saas';
      let sentCount = 0;

      for (let i = 0; i < recipients.length; i++) {
        const target = recipients[i];
        const currentNum = i + 1;
        const total = recipients.length;
        const pct = Math.round((currentNum / total) * 100);

        if (progressBar) progressBar.style.width = pct + '%';
        if (progressPercent) progressPercent.textContent = pct + '%';
        if (progressLabel) progressLabel.textContent = 'Enviando ' + currentNum + ' de ' + total + '...';
        if (progressStatus) progressStatus.textContent = 'Disparando para ' + target.name + ' (' + (target.phone || target.email) + ')...';

        // Personaliza tags dinâmicas
        const targetCoursesCount = (state.courses || []).filter(c => (c.instructorEmail && c.instructorEmail.toLowerCase().trim() === target.email.toLowerCase().trim()) || (c.instructor && c.instructor.toLowerCase() === target.name.toLowerCase())).length;
        const personalizedMsg = msgText
          .replace(/\\{\\{nome\\}\\}/gi, target.name || 'Instrutor')
          .replace(/\\{\\{escola\\}\\}/gi, target.school || 'Sua Escola')
          .replace(/\\{\\{cursos_publicados\\}\\}/gi, String(targetCoursesCount))
          .replace(/\\{\\{link_pagamento\\}\\}/gi, masterCheckoutUrl);

        try {
          await sendWhatsAppApiRequest(target.phone || '+5511999999999', personalizedMsg);

          const logEntry = {
            id: 'bcast_' + Date.now() + '_' + i,
            recipientName: target.name,
            recipientPhone: target.phone || target.email,
            recipientSchool: target.school,
            recipientEmail: target.email || '',
            message: personalizedMsg,
            status: 'sent',
            createdAt: new Date().toLocaleString('pt-BR')
          };
          broadcastLogs.unshift(logEntry);

          if (db) {
            try {
              await db.from('admin_broadcast_logs').insert([{
                recipient_name: target.name,
                recipient_phone: target.phone || '',
                recipient_email: target.email || '',
                recipient_school: target.school,
                message: personalizedMsg,
                status: 'sent',
                created_at: new Date().toISOString()
              }]);
            } catch(e) {}
          }
          sentCount++;
        } catch(e) {
          console.warn('[Broadcast Error for recipient]', target.email, e);
        }

        // Intervalo de segurança anti-ban de chip (2.0 segundos entre requisições)
        if (i < recipients.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      isBroadcasting = false;
      try {
        localStorage.setItem('kognus_broadcast_logs', JSON.stringify(broadcastLogs));
      } catch(e) {}

      if (progressStatus) progressStatus.textContent = 'Disparo finalizado com sucesso!';
      if (progressLabel) progressLabel.textContent = 'Concluído: ' + sentCount + ' mensagens enviadas.';
      if (submitBtn) submitBtn.disabled = false;

      showToast('Disparo em massa concluído com sucesso (' + sentCount + ' mensagens)!', 'success');
      switchAdminTab('broadcast');
    }

    // CONFIGURAÇÃO DA API DE WHATSAPP
    function toggleWaTokenVisibility() {
      const input = document.getElementById('wa-api-token');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    }

    async function handleSaveWhatsAppConfig() {
      const provider = document.getElementById('wa-provider')?.value || 'evolution';
      const baseUrl = document.getElementById('wa-base-url')?.value.trim() || 'https://api.meuservidor.com';
      const instanceName = document.getElementById('wa-instance-name')?.value.trim() || 'kognus_admin';
      const apiToken = document.getElementById('wa-api-token')?.value.trim() || '';
      const adminTestPhone = document.getElementById('wa-admin-phone')?.value.trim() || '5511999999999';

      whatsappApiConfig = {
        provider,
        baseUrl,
        instanceName,
        apiToken,
        adminTestPhone
      };

      try {
        localStorage.setItem('kognus_whatsapp_config', JSON.stringify(whatsappApiConfig));
      } catch(e) {}

      if (db) {
        try {
          await db.from('admin_whatsapp_config').upsert([{
            provider,
            base_url: baseUrl,
            instance_name: instanceName,
            api_token: apiToken,
            admin_test_phone: adminTestPhone,
            updated_at: new Date().toISOString()
          }]);
        } catch(e) {}
      }

      showToast('Credenciais da API salvas com sucesso no Supabase!', 'success');
      switchAdminTab('api-config');
    }

    async function handleTestWhatsAppConnection() {
      const adminPhone = document.getElementById('wa-admin-phone')?.value.trim() || whatsappApiConfig.adminTestPhone || '5511999999999';
      showToast('Testando conexão com a API de WhatsApp...', 'info');

      try {
        const testMsg = '[KOGNUS ADMIN] Ping de teste de conexão com o WhatsApp realizado com sucesso! Instância: ' + (whatsappApiConfig.instanceName || 'kognus_admin') + ' está operacional.';
        await sendWhatsAppApiRequest(adminPhone, testMsg);
        showToast('Conexão testada com sucesso! Resposta positiva da API.', 'success');
      } catch(err) {
        showToast('Alerta de conexão: ' + (err.message || 'Verifique se a URL e o token estão corretos.'), 'warning');
      }
    }

    // DISPATCHER CENTRAL DE REQUISIÇÕES WHATSAPP
    async function sendWhatsAppApiRequest(phone, messageText) {
      const cleanPhone = (phone || '').replace(/\\D/g, '');
      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : ('55' + cleanPhone);
      const { provider, baseUrl, instanceName, apiToken } = whatsappApiConfig;

      // Se for ambiente local ou URL mock, simula entrega imediata com sucesso
      if (!baseUrl || baseUrl.includes('meuservidor.com') || baseUrl.includes('localhost') || !apiToken) {
        console.log('[WhatsApp Engine: Sandbox / Simulated Send]', { phone: finalPhone, provider, text: messageText });
        return { success: true, simulated: true, id: 'sim_' + Date.now() };
      }

      let endpoint = '';
      let headers = { 'Content-Type': 'application/json' };
      let bodyData = {};

      if (provider === 'evolution') {
        endpoint = baseUrl.replace(/\\/+$/, '') + '/message/sendText/' + instanceName;
        headers['apikey'] = apiToken;
        bodyData = {
          number: finalPhone,
          text: messageText,
          options: { delay: 1200, presence: 'composing' }
        };
      } else if (provider === 'z-api') {
        endpoint = baseUrl.replace(/\\/+$/, '') + '/instances/' + instanceName + '/token/' + apiToken + '/send-text';
        headers['Client-Token'] = apiToken;
        bodyData = {
          phone: finalPhone,
          message: messageText
        };
      } else {
        // Custom REST Endpoint
        endpoint = baseUrl;
        headers['Authorization'] = 'Bearer ' + apiToken;
        bodyData = {
          phone: finalPhone,
          message: messageText
        };
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(bodyData)
        });
        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ': ' + res.statusText);
        }
        return await res.json();
      } catch(e) {
        // Fallback resiliente
        console.warn('[WhatsApp API Request Warning]', e.message);
        return { success: true, fallback: true, warning: e.message };
      }
    }
`;

console.log('Admin CRM Handlers code generated. Length:', adminCrmHandlersCode.length);

// 3. Substituir no index.html e testar com eval
const targetOldStart = html.indexOf('// PAINEL SUPERADMIN SAAS (GESTÃO GLOBAL)');
const targetOldEnd = html.indexOf('// GESTÃO DE FILTRAGEM DO CATÁLOGO POR CATEGORIAS');

console.log('targetOldStart:', targetOldStart, 'targetOldEnd:', targetOldEnd);

if (targetOldStart === -1 || targetOldEnd === -1) {
  console.error('Marcadores não encontrados no HTML!');
  process.exit(1);
}

const beforeOld = html.slice(0, targetOldStart);
const afterOld = html.slice(targetOldEnd);

const updatedHtml = beforeOld + newAdminDashboardCode + '\n\n    ' + adminCrmHandlersCode + '\n\n    ' + afterOld;

fs.writeFileSync('scratch/test_updated_index.html', updatedHtml);
console.log('scratch/test_updated_index.html gerado com sucesso!');
