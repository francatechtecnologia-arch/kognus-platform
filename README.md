# 🚀 KOGNUS 2.0 — Plataforma de Cursos Online & Creator Studio SaaS

Aplicação web completa, moderna e autocontida para gestão de cursos online, Creator Studio para instrutores, emissão de certificados com código de autenticidade, modelo de assinatura SaaS (R$ 89,90/mês com 0% comissão) e painel SuperAdmin com política de segurança de 30 dias para expiração de senhas.

---

## ⚡ Como Executar Localmente

Você tem 3 maneiras simples de executar a plataforma:

### Opção 1: Pelo Prompt / Terminal (Recomendado)
```bash
# Iniciar o servidor local (abre o navegador automaticamente)
npm start
# ou
node server.js
```

### Opção 2: Com 1 Clique no Windows (Arquivo `.bat`)
Dê um duplo clique no arquivo:
👉 **`iniciar.bat`**

O servidor será iniciado na porta `3000` e seu navegador padrão será aberto automaticamente em `http://localhost:3000`.

### Opção 3: Executar a Bateria de Testes Funcionais
```bash
npm test
# ou duplo clique em testar.bat
```

---

## 🔑 Credenciais Pré-configuradas para Testes

| Perfil | E-mail | Senha | Acesso / Funcionalidades |
| :--- | :--- | :--- | :--- |
| **SuperAdmin SaaS** | `admin@kognus.com` | `admin123` | Painel SaaS (MRR, Clientes, Inadimplência, Métricas), Política de 30 dias de expiração de senha |
| **Instrutor (Beleza)** | `instrutor@kognus.com` | `123456` | Creator Studio, Personalização de Escola, Gestão de Cursos, Certificados, Gateway Próprio & Webhook |
| **Instrutor (Dev)** | `ana@kognus.com` | `123456` | Creator Studio, Escola de Programação |
| **Aluno** | `aluno@kognus.com` | `123456` | Sala de Aula, Player de Vídeo/PDF, Progresso, Emissão de Certificados 100% |

---

## 🛠️ Recursos Implementados

1. **Bug Crítico de Navegação Corrigido**:
   - Transição imediata de `#screen-login` para `#screen-admin-dash` após login de admin.
   - Forçamento da remoção/adição da classe `.hidden` para isolamento total de telas.

2. **Gestão de Perfil (Aluno, Instrutor e Admin)**:
   - Upload de foto de perfil via `FileReader` convertido para Base64 persistido no `localStorage`.
   - Exibição de foto personalizada na navbar e nos cabeçalhos dos dashboards.
   - Alteração de senha com validação obrigatória da senha atual e confirmação.

3. **Política de Segurança do Admin (30 Dias)**:
   - Registro de timestamp `password_updated_at`.
   - Bloqueio imediato do painel SaaS caso a senha tenha mais de 30 dias (ou timestamp ausente).
   - Modal não transponível de troca obrigatória de senha.
   - Botão para testar na hora: *"Simular Senha Expirada (+31 dias)"*.

4. **SaaS Puro & Regras de Negócio**:
   - Mensalidade fixa de R$ 89,90 e 0% de comissão sobre vendas.
   - Congelamento e reativação automática de cursos por status de pagamento.
   - Gateway próprio (Kiwify, Hotmart, Eduzz) com simulador de Webhook.
   - Emissão de certificados personalizáveis com código `AUTH-KOGNUS-XXXX`.
