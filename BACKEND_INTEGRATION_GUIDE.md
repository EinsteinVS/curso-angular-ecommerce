# 🔧 Backend Integration Guide - Email Verification + Dev Mode

## 📋 Cosa Deve Tornare il Backend

### 1. **POST /api/auth/register** (Aggiornato per Dev Mode)

#### Request (same as before)
```json
{
  "name": "Juan",
  "lastName": "García",
  "email": "user@example.com",
  "password": "securePassword123",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "edad": "25",
  "genero": "M",
  "phoneNumber": "+56 9 0000 0000",
  "geo1": "Santiago",
  "addresses": "Av. Providencia 1234",
  "payments": "VISA"
}
```

#### Response (PRODUCTION)
```json
{
  "message": "Registrazione completata. Verifica l'email",
  "email": "user@example.com",
  "userId": "user-123",
  "success": true
}
```

#### Response (DEVELOPMENT - Con Link)
```json
{
  "message": "Registrazione completata. Verifica l'email",
  "email": "user@example.com",
  "userId": "user-123",
  "success": true,
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationLink": "http://localhost:4200/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&email=user%40example.com"
}
```

**Spiegazione campi (Dev Mode)**:
- `verificationToken`: Token univoco per la verifica (opzionale se fornisci il link completo)
- `verificationLink`: URL completo per clickare direttamente (consigliato per dev)
  - Include: `token` + `email` come query params
  - URL base: `http://localhost:4200` (dev) o `https://tottus.com` (prod)

---

### 2. **POST /api/auth/verify-email** (NUOVO - Callback Link)

#### Request
```json
{
  "email": "user@example.com",
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response - Success (200)
```json
{
  "message": "Email verificata con successo",
  "success": true
}
```

#### Response - Error (400)
```json
{
  "message": "Token di verifica non valido o scaduto",
  "success": false,
  "code": "INVALID_TOKEN"
}
```

#### Response - Error Already Verified (410)
```json
{
  "message": "La cuenta è già stata verificata",
  "success": false,
  "code": "ALREADY_VERIFIED"
}
```

---

### 3. **POST /api/auth/resend-verification-email** (OPZIONALE)

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Response
```json
{
  "message": "Email di verifica inviata di nuovo",
  "success": true,
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationLink": "http://localhost:4200/auth/verify-email?token=...&email=user%40example.com"
}
```

---

## 🔄 Flusso Completo (Backend)

```
┌─────────────────────────────────────────────┐
│ 1. UTENTE INVIA POST /api/auth/register     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ 2. BACKEND CREA ACCOUNT                      │
│    - Hash password con bcrypt                │
│    - Salva in DB con verified=false          │
│    - Genera token JWT univoco                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ 3. BACKEND GENERA LINK VERIFICA              │
│    - Formato: /auth/verify-email?           │
│      token=JWT&email=user%40example.com     │
│    - URL completo (localhost o prod)        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ 4. BACKEND INVIA EMAIL CON LINK              │
│    - Subject: "Verifica tu cuenta - Tottus" │
│    - Body include pulsante + link            │
│    - Salva link in DB per dev-mode (opt)    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ 5. BACKEND TORNA RISPOSTA HTTP 200          │
│    - Include verificationLink (dev-mode)    │
│    - NO token di autenticazione              │
│    - Messaggio: "Verifica l'email"          │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    (DEV MODE)    (PROD MODE)
        │             │
        ▼             ▼
  Link salvato    User attende
  in sessionStorage email reale
        │
        ▼
   User clicca
   link nel UI
        │
        ▼
   POST /api/auth/verify-email
        │
        ▼
   Backend valida token
        │
        ├─ Scaduto? → 400
        ├─ Invalido? → 400
        ├─ Già verificato? → 410
        └─ OK? → 200 SUCCESS
```

---

## 💾 Database Schema (Pseudo-Code)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  lastName VARCHAR(100),
  passwordHash VARCHAR(255),
  
  -- NEW: Email Verification
  verified BOOLEAN DEFAULT FALSE,
  verificationToken VARCHAR(500) UNIQUE,
  verificationTokenExpiresAt TIMESTAMP,
  
  -- Metadata
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Logica Backend

```python
# Pseudo-Python

def register(request_data):
    email = request_data['email']
    
    # Controlla se email esiste
    if user_exists(email):
        return error_400("Email già registrata")
    
    # Crea utente
    verification_token = generate_jwt_token({
        'email': email,
        'type': 'email_verification',
        'exp': now + 24_hours
    })
    
    user = create_user({
        ...request_data,
        verified=False,
        verificationToken=verification_token,
        verificationTokenExpiresAt=now + 24_hours
    })
    
    # Invia email
    verification_link = f"{BASE_URL}/auth/verify-email?token={verification_token}&email={email}"
    send_email(
        to=email,
        subject="Verifica tu cuenta - Tottus",
        body=f"Haz clic aquí para verificar: {verification_link}"
    )
    
    # DEVELOPMENT MODE: Torna il link
    response = {
        "message": "Registración completa. Verifica el email",
        "email": email,
        "userId": user.id,
        "success": True
    }
    
    if IS_DEVELOPMENT:
        response['verificationLink'] = verification_link
        response['verificationToken'] = verification_token
    
    return success_201(response)


def verify_email(request_data):
    token = request_data['verificationToken']
    email = request_data['email']
    
    # Valida token JWT
    try:
        payload = verify_jwt(token)
    except ExpiredSignatureError:
        return error_400("Token scaduto")
    except InvalidTokenError:
        return error_400("Token invalido")
    
    # Controlla email matches
    if payload['email'] != email:
        return error_400("Email non corrisponde")
    
    # Controlla se user esiste
    user = get_user_by_email(email)
    if not user:
        return error_404("Account non trovato")
    
    # Controlla se già verificato
    if user.verified:
        return error_410("Account già verificato")
    
    # Marca come verificato
    user.verified = True
    user.verificationToken = None
    user.verificationTokenExpiresAt = None
    user.save()
    
    return success_200({
        "message": "Email verificata con successo",
        "success": True
    })
```

---

## 🧪 Test Scenarios

### Test 1: Dev Mode - Link Visible
```bash
# POST /api/auth/register
# Response include verificationLink
# Frontend mostra link in componente
# User clicca link → /auth/verify-email?token=...&email=...
# ✅ Funziona!
```

### Test 2: Production Mode - No Link
```bash
# Backend non torna verificationLink
# Frontend NON mostra sezione dev
# User attende email reale
# ✅ Sicuro in produzione
```

### Test 3: Token Scaduto
```bash
# Token generato 25 ore fa (expiry=24h)
# User clicca link scaduto
# Backend: 400 INVALID_TOKEN
# Frontend mostra errore
# User usa "Rinvia email"
# ✅ Gestito correttamente
```

### Test 4: Invalid Email Mismatch
```bash
# User modifica URL email parameter
# Backend valida: email != payload.email
# Backend: 400 INVALID_TOKEN
# ✅ Sicurezza ok
```

---

## 🔐 Checklist Sicurezza Backend

- ✅ Token JWT con scadenza (24 ore)
- ✅ Email verificata nel DB (`verified` flag)
- ✅ Login blocca se `verified=false`
- ✅ Rate limiting su resend email (max 5/ora)
- ✅ HTTPS solo in produzione
- ✅ Token non prevedibili (crypto random)
- ✅ Validare email format
- ✅ Hash password con bcrypt/argon2
- ✅ No token nei log
- ✅ CORS configurato correttamente

---

## 📧 Email Template (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .button { 
      background: #10b981; 
      color: white; 
      padding: 12px 24px; 
      border-radius: 9999px;
      text-decoration: none;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bienvenido a Tottus</h1>
    <p>Gracias por registrarte. Para completar tu registro, haz clic en el botón de abajo:</p>
    
    <a href="https://tottus.com/auth/verify-email?token=ABC123&email=user%40example.com" class="button">
      Verificar cuenta
    </a>
    
    <p>O copia este link en tu navegador:</p>
    <p>https://tottus.com/auth/verify-email?token=ABC123&email=user%40example.com</p>
    
    <p><small>Este link expira en 24 horas.</small></p>
    <p><small>Si no solicitaste este correo, ignóralo.</small></p>
  </div>
</body>
</html>
```

---

## 🚀 Implementazione Backend Veloce (Node.js/Express Example)

```typescript
// routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, name, lastName, password, ... } = req.body;
  
  try {
    // Validazioni
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email già registrata' });
    }
    
    // Genera token
    const verificationToken = jwt.sign(
      { email, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Crea user
    const user = await User.create({
      email,
      name,
      lastName,
      passwordHash: await bcrypt.hash(password, 10),
      verified: false,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    // Invia email
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    await sendVerificationEmail(email, verificationLink);
    
    // Response
    const response = {
      message: 'Registrazione completata. Verifica l\'email',
      email,
      userId: user.id,
      success: true
    };
    
    // Dev mode: include link
    if (process.env.NODE_ENV === 'development') {
      response.verificationLink = verificationLink;
      response.verificationToken = verificationToken;
    }
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Errore di registrazione' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  const { email, verificationToken } = req.body;
  
  try {
    // Valida JWT
    const payload = jwt.verify(verificationToken, process.env.JWT_SECRET);
    
    if (payload.email !== email) {
      return res.status(400).json({ message: 'Email non corrisponde' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account non trovato' });
    }
    
    if (user.verified) {
      return res.status(410).json({ message: 'Account già verificato' });
    }
    
    user.verified = true;
    user.verificationToken = null;
    await user.save();
    
    res.json({ message: 'Email verificata con successo', success: true });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: 'Token scaduto' });
    }
    res.status(400).json({ message: 'Token invalido' });
  }
});
```

---

## ✅ Checklist Implementazione

- [ ] Entità `users` ha flag `verified`
- [ ] Endpoint POST /api/auth/register implementato
- [ ] Email di verifica inviata con link
- [ ] Link include `token` e `email` come query params
- [ ] Dev mode: `verificationLink` nella response
- [ ] Endpoint POST /api/auth/verify-email implementato
- [ ] Valida JWT token
- [ ] Gestisce token scaduto (400)
- [ ] Gestisce già verificato (410)
- [ ] Login blocca account non verificati
- [ ] Endpoint resend email (opzionale) implementato
- [ ] Rate limiting su resend email
- [ ] Database: migration aggiunta per campi verifica
- [ ] Email template HTML creato
- [ ] HTTPS in produzione
- [ ] Credenziali email (SendGrid, Mailgun, etc.)

---

**Pronto per l'integrazione!** 🚀
