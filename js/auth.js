// ============================================================
//  auth.js — Autenticação
// ============================================================

const Auth = {
  register: (name, email, pass, role) => {
    const users = DB.getUsers();
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser = { name, email, pass, role };
    users.push(newUser);
    DB._set('kognus_users', users);
    DB._set('kognus_session', newUser);
    return { success: true, user: newUser };
  },

  login: (email, pass) => {
    const users = DB.getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) return { success: false, message: 'E-mail ou senha inválidos.' };
    DB._set('kognus_session', user);
    return { success: true, user };
  },

  logout: () => {
    localStorage.removeItem('kognus_session');
  },

  getSession: () => DB.getSession()
};
