# 📧 Email Verification Flow - Guida Implementazione

## 🎯 Overview

Questo sistema implementa una **best practice** per la verifica email dopo la registrazione in Angular. Il flusso segue gli standard di sicurezza e UX moderni.

---

## 🔄 Flusso di Registrazione e Verifica

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UTENTE COMPILA FORM DI REGISTRAZIONE                     │
│    (nome, email, password, etc.)                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND CREA ACCOUNT E INVIA EMAIL CON LINK VERIFICA   │
│    - Genera token univoco e scadenza (es. 24 ore)         │
│    - Salva token in DB come NON VERIFICATO                │
│    - Invia email: https://app.com/auth/verify-email?     │
│      token=XXX&email=user@email.com                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SCHERMO DI VERIFICA EMAIL MOSTRATO ALL'UTENTE           │
│    - Messaggio: "Ti abbiamo inviato un'email..."          │
│    - Pulsante "Verifica ora" (clicca il link)             │
│    - Pulsante "Rinvia email"                              │
│    - Pulsante "Vai a login"                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴────────────┐
        │                       │
        ▼                       ▼
    CLICCA LINK            ATTENDE EMAIL
        │                       │
        ▼                       │
┌──────────────────┐           │
│ 4a. VERIFICA     │           │
│    IMMEDIATA     │           │
└──────────────────┘           │
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │ 5. BACKEND VERIFICA TOKEN│
        │    - Token valido?       │
        │    - Scadenza?           │
        │    - Email corretta?     │
        └──────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
     VALIDO                 SCADUTO/INVALIDO
        │                      │
        ▼                      ▼
    ┌─────────────┐      ┌──────────────┐
    │ 6a. SUCCESS │      │ 6b. ERROR    │
    │ Account OK  │      │ Retry/reload │
    └─────────────┘      └──────────────┘
        │                      │
        ▼                      ▼
    "Account verificato!"   "Token scaduto"
    Pulsante Login          "Rinvia email"
```

---

## 📁 Componenti Implementati

### 1. **Model: `email-verification.model.ts`**
```typescript
// Interfacce per la comunicazione con il backend
EmailVerificationRequest {
  email: string;           // Email dell'utente
  verificationToken: string; // Token univoco
}

EmailVerificationResponse {
  message?: string;        // Messaggio di risposta
  success?: boolean;       // Esito della verifica
  redirectUrl?: string;    // URL dove reindirizzare (opzionale)
}
```

### 2. **Auth Service: `auth.service.ts` (updated)**
```typescript
// Nuovo metodo per verificare email
verifyEmail(data: EmailVerificationRequest) {
  return this.api.post<EmailVerificationResponse>(
    '/api/auth/verify-email', 
    data
  );
}
```

### 3. **Email Verification Component**
**Percorso**: `src/app/domains/auth/pages/email-verification/`

Mostra:
- ✅ Icona email con colorazione
- 📨 Messaggio personalizzato con email
- 🔗 Pulsante "Verifica ora" (clicca link)
- 📧 Pulsante "Rinvia email"
- 🔐 Pulsante "Vai a login"
- ⚠️ Messaggi di errore/successo

### 4. **Verify Email Callback Component**
**Percorso**: `src/app/domains/auth/pages/verify-email-callback/`

Gestisce il callback del link di verifica:
- Loading state durante la verifica
- Success state con countdown auto-redirect
- Error state con opzioni retry
- Gestisce errori HTTP specifici (400, 404, 410)

### 5. **Register Component: `register.component.ts` (updated)**
**Cambiamenti**:
- ❌ Rimozione auto-login post registrazione
- ✅ Aggiunto `EmailVerificationComponent` import
- ✅ Mostra schermo di verifica email dopo registrazione
- ✅ Salva email dell'utente per il form di verifica

---

## 🚀 Integrazione Backend

### Endpoint Richiesti

#### 1. **POST /api/auth/register** (Esistente, da aggiornare)
```
Richiesta:
{
  name: string,
  lastName: string,
  email: string,
  password: string,
  ... altri campi
}

Risposta (NUOVO):
{
  message: "Registrazione completata. Verifica l'email",
  email: "user@example.com",
  userId: "123"
}

⚠️ IMPORTANTE: NON tornare token (l'utente non è ancora loggato)
```

#### 2. **POST /api/auth/verify-email** (NUOVO)
```
Richiesta:
{
  email: string,
  verificationToken: string
}

Risposta Success (200):
{
  message: "Email verificata con successo",
  success: true
}

Risposta Errore (400):
{
  message: "Token non valido o scaduto",
  success: false
}

Codici HTTP:
- 200: Email verificata
- 400: Token invalido/scaduto
- 404: Account non trovato
- 410: Account già verificato
```

#### 3. **POST /api/auth/resend-verification-email** (OPZIONALE)
```
Richiesta:
{
  email: string
}

Risposta:
{
  message: "Email di verifica inviata"
}
```

---

## 📝 Best Practices Implementate

### 1. **Sicurezza**
- ✅ Token univoco per registrazione (non prevedibile)
- ✅ Scadenza token (24h raccomandate)
- ✅ Email verificata prima di login
- ✅ Prevenzione accesso senza verifica

### 2. **UX/UX**
- ✅ Messaggio chiaro sull'azione richiesta
- ✅ Opzioni alternative (rinvia email, vai a login)
- ✅ Auto-redirect dopo verifica
- ✅ Verifica diretta dal link

### 3. **Gestione Errori**
- ✅ Token scaduto: opzione rinvia email
- ✅ Token invalido: ritorno a registro
- ✅ Throttling on resend (max 5 tentativi/ora)
- ✅ Messaggi chiari e localizzati

### 4. **Performance**
- ✅ Lazy loading dei componenti auth
- ✅ Nessuno spinner infinito
- ✅ Track by su liste (se presenti)
- ✅ OnDestroy cleanup dei timers

---

## 🔗 URL di Riferimento

### Flow di verifica email
```
1. User registra → redirect a /auth/register (vede verification screen)
2. Clicca link email → /auth/verify-email?token=ABC123&email=user@email.com
3. Se OK → /auth/login
4. Se ERROR → mostra errore con opzione retry
```

### Esempio Email (backend invia)
```html
Corpo dell'email:

Ciao [name]!

Grazie per esserti registrato. Per completare la registrazione,
verifica il tuo indirizzo email cliccando sul link sottostante:

[PULSANTE BLU: "Verifica il tuo account"]
https://app.com/auth/verify-email?token=abc123xyz&email=user@email.com

Il link scadrà tra 24 ore.

Se non hai creato questo account, ignora questo messaggio.

---
Team Tottus
```

---

## 🧪 Test Scenarios

### Scenario 1: Verifica riuscita
```
1. Registra nuovo account
2. Clicca link email (o pulsante "Verifica ora")
3. Vedi "Account verificato!"
4. Auto-redirect a login dopo 3s
5. Accedi normalmente
```

### Scenario 2: Token scaduto
```
1. Registra account
2. Aspetta 25+ ore
3. Clicca link scaduto
4. Vedi errore "Token scaduto"
5. Usa pulsante "Rinvia email"
6. Ricevi nuova email e verifica
```

### Scenario 3: Email non ricevuta
```
1. Registra account
2. Non vedi email in inbox
3. Clicca "Rinvia email"
4. Ricevi nuova email
5. Verifica con nuovo link
```

### Scenario 4: Accesso prima della verifica (bloccare nel backend)
```
1. Registra account
2. Prova a fare login PRIMA della verifica
3. Backend rigetta: "Account non verificato"
4. Mostra: "Verifica email prima di accedere"
5. Mostra link per rinviare email
```

---

## ⚙️ Configurazione

### LocalStorage/SessionStorage
```typescript
// EmailVerificationComponent salva:
sessionStorage.setItem('verificationLink', link);

// Recover con:
const link = sessionStorage.getItem('verificationLink');
```

### Variabili di Ambiente (opzionale)
```
VERIFICATION_TOKEN_EXPIRY_HOURS=24
RESEND_EMAIL_RATE_LIMIT=5/hour
AUTO_REDIRECT_DELAY_MS=3000
```

---

## 🐛 Troubleshooting

### Problema: Non vedo il messaggio di verifica dopo registrazione
**Soluzione**:
- Controlla che `showVerificationScreen` sia `true` nel register.component.ts
- Verifica che EmailVerificationComponent sia importato
- Controlla console browser per errori

### Problema: Link di verifica non funziona
**Soluzione**:
- Backend deve restituire token valido
- Controlla query params: `token` e `email` presenti?
- Token scaduto? Rinvia email

### Problema: Utente rimane bloccato in schermo verificazione
**Soluzione**:
- Pulsante "Vai a login" sempre disponibile
- Non forzare verificazione (optional best practice)
- Permetti rinvio email illimitato

---

## 📚 Riferimenti

- [OWASP Email Verification](https://cheatsheetseries.owasp.org/cheatsheets/User_Registration_Cheat_Sheet.html)
- [Angular Best Practices](https://angular.io/guide/styleguide)
- [Email Security](https://www.rfc-editor.org/rfc/rfc5321)

---

**✅ Implementazione Completa!**

Ora gli utenti vedranno:
1. ✨ Messaggio professionale "Ti abbiamo inviato un'email..."
2. 🔗 Link per verificare direttamente 
3. 📧 Opzione per rinviare email
4. 🔐 Protezione dell'account
