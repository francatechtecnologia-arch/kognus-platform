// ./api/stripe-webhook.js
// Endpoint oficial do Webhook do Stripe (Compatível com Node.js local e Vercel Serverless Functions)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nbpxotppnjlxqjgzcblw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icHhvdHBwbmpseHFqZ3pjYmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTAwNjYsImV4cCI6MjEwNTg4NjA2Nn0.QsaRhyuqXA8gXT890V7W8o2pL4unrFVatxlOnLwGnXA';

module.exports = async function handler(req, res) {
  // CORS & cabeçalhos de resposta
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    if (res.status) return res.status(204).end();
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    if (res.status) return res.status(405).json({ error: 'Method Not Allowed' });
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    let event = req.body;
    if (typeof event === 'string') {
      try {
        event = JSON.parse(event);
      } catch (e) {
        console.error('[Stripe Webhook] Falha ao fazer parse do corpo JSON:', e.message);
      }
    }

    if (!event || !event.type) {
      const errPayload = { error: 'Payload de evento inválido ou ausente' };
      if (res.status) return res.status(400).json(errPayload);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(errPayload));
    }

    console.log(`[Stripe Webhook] Evento recebido: ${event.type}`);

    const obj = event.data?.object || {};

    // 1. Extração do E-mail e client_reference_id
    const rawEmail = obj.customer_details?.email ||
                     obj.customer_email ||
                     obj.receipt_email ||
                     obj.metadata?.prefilled_email ||
                     obj.metadata?.email ||
                     obj.email ||
                     obj.last_payment_error?.payment_method?.billing_details?.email ||
                     (typeof obj.customer === 'string' && obj.customer.includes('@') ? obj.customer : null);

    const clientRef = obj.client_reference_id || obj.metadata?.client_reference_id || '';

    // Extração do course_id via client_reference_id ou metadata
    const matchCourse = clientRef.match(/course_(\w+)/);
    const courseId = matchCourse ? matchCourse[1] : (obj.metadata?.course_id || null);

    // Se o email não estiver no topo, tenta extrair de client_reference_id (student_EMAIL__course_ID)
    let email = rawEmail;
    if (!email && clientRef.includes('student_')) {
      const matchEmail = clientRef.match(/student_([^__]+)/);
      if (matchEmail && matchEmail[1]) {
        email = decodeURIComponent(matchEmail[1]);
      }
    }

    // Identificação de aluno vs instrutor
    const isStudentPurchase = !!(courseId || clientRef.includes('course_') || clientRef.includes('student_') || obj.metadata?.type === 'student');

    console.log(`[Stripe Webhook] Processando: email=${email}, clientRef=${clientRef}, courseId=${courseId}, isStudent=${isStudentPurchase}`);

    let targetStatus = null;
    let subStatus = null;
    let handledAction = 'ok';

    // 1. Aprovação
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
      targetStatus = 'ativo';
      subStatus = 'active';
      handledAction = 'payment_success';
    }
    // 2. Falha
    else if (event.type === 'payment_intent.payment_failed' || event.type === 'invoice.payment_failed') {
      targetStatus = 'recusado';
      subStatus = 'failed';
      handledAction = 'payment_failed';
    }
    // 3. Cancelamento / Pausa
    else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
      targetStatus = 'inadimplente';
      subStatus = 'canceled';
      handledAction = 'subscription_locked';
    }

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // 2. Gravação no Supabase
    if (email && targetStatus === 'ativo') {
      const cleanEmail = email.toLowerCase().trim();

      if (isStudentPurchase) {
        // Matrícula de Aluno
        const finalCourseId = String(courseId || '1');
        console.log(`[Stripe Webhook] Gravando matrícula de ${cleanEmail} no curso ${finalCourseId}...`);

        try {
          // Upsert na tabela enrollments
          const enrollUpsertUrl = `${SUPABASE_URL}/rest/v1/enrollments?on_conflict=student_email,course_id`;
          const enrollRes = await fetch(enrollUpsertUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify({
              student_email: cleanEmail,
              course_id: finalCourseId,
              status: 'active',
              created_at: new Date().toISOString()
            })
          });

          if (!enrollRes.ok) {
            // Fallback se constraint única não estiver configurada no Supabase
            const checkUrl = `${SUPABASE_URL}/rest/v1/enrollments?student_email=eq.${encodeURIComponent(cleanEmail)}&course_id=eq.${encodeURIComponent(finalCourseId)}`;
            const checkRes = await fetch(checkUrl, { headers });
            const existingEnroll = await checkRes.json().catch(() => []);

            if (!existingEnroll || existingEnroll.length === 0) {
              await fetch(`${SUPABASE_URL}/rest/v1/enrollments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  student_email: cleanEmail,
                  course_id: finalCourseId,
                  status: 'active',
                  created_at: new Date().toISOString()
                })
              });
            } else {
              await fetch(checkUrl, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                  status: 'active',
                  updated_at: new Date().toISOString()
                })
              });
            }
          }
          console.log(`[Supabase REST Success] Matrícula de ${cleanEmail} no curso ${finalCourseId} confirmada.`);

          // Garante usuário na tabela users
          const userCheckUrl = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`;
          const userCheckRes = await fetch(userCheckUrl, { headers });
          const existingUsers = await userCheckRes.json().catch(() => []);

          if (!existingUsers || existingUsers.length === 0) {
            const studentName = obj.customer_details?.name || 'Aluno';
            await fetch(`${SUPABASE_URL}/rest/v1/users`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                email: cleanEmail,
                name: studentName,
                role: 'aluno',
                status: 'ativo',
                must_change_password: true,
                created_at: new Date().toISOString()
              })
            });
            console.log(`[Supabase REST Success] Novo usuário aluno criado: ${cleanEmail}`);
          }
        } catch (dbErr) {
          console.warn('[Supabase Connection Warning - Enrollment]:', dbErr.message);
        }
      } else {
        // Assinatura de Instrutor
        console.log(`[Stripe Webhook] Atualizando status de instrutor ${cleanEmail} para '${targetStatus}' (${subStatus})...`);

        try {
          const updateUrl = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`;
          const dbRes = await fetch(updateUrl, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              status: targetStatus,
              subscription_status: subStatus,
              updated_at: new Date().toISOString()
            })
          });

          if (!dbRes.ok) {
            const errDetail = await dbRes.text();
            console.warn(`[Supabase REST Warning] Status ${dbRes.status}: ${errDetail}`);
          } else {
            console.log(`[Supabase REST Success] Instrutor ${cleanEmail} atualizado para status '${targetStatus}'`);
          }
        } catch (dbErr) {
          console.warn('[Supabase Connection Warning - Instructor]:', dbErr.message);
        }
      }
    } else if (email && targetStatus && !isStudentPurchase) {
      // Falha ou cancelamento de instrutor
      try {
        const updateUrl = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`;
        await fetch(updateUrl, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: targetStatus,
            subscription_status: subStatus,
            updated_at: new Date().toISOString()
          })
        });
      } catch(e) {}
    }

    const responsePayload = {
      received: true,
      type: (isStudentPurchase || courseId) ? 'student_enrollment' : 'instructor_subscription',
      handled: handledAction,
      event: event.type,
      email: email || null,
      course_id: courseId || null,
      status: targetStatus || null,
      subscription_status: subStatus || null
    };

    if (res.status) {
      return res.status(200).json(responsePayload);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(responsePayload));
    }
  } catch (error) {
    console.error('[Stripe Webhook Error]:', error);
    const errPayload = { error: error.message };
    if (res.status) {
      return res.status(500).json(errPayload);
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(errPayload));
    }
  }
};
