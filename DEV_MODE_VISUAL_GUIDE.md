# 🎯 Email Verification Dev Mode - Visual Guide

## Componente Email Verification - Layout

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │         [Logo Tottus/Yard Sale]             │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │          ✉️ [Icona Email]              │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │                                              │  │
│  │      Verifica tu correo electrónico         │  │
│  │                                              │  │
│  │  Te hemos enviado un correo electrónico a  │  │
│  │  einstein3@email.com con instrucciones     │  │
│  │  para verificar tu cuenta.                 │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │ 📧 ¿No ves el correo?                  │ │  │
│  │  │ Revisa tu carpeta de spam o correo     │ │  │
│  │  │ no deseado.                            │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │                                              │  │
│  │  O haz clic en el botón de abajo para       │  │
│  │  verificar tu cuenta directamente:         │  │
│  │                                              │  │
│  │         [✓ VERIFICAR AHORA]                │  │
│  │                                              │  │
│  │  ─────────────────────────────────────────  │  │
│  │                                              │  │
│  │  ¿Ya verificaste tu cuenta?                │  │
│  │                                              │  │
│  │     [→ IR A INICIAR SESIÓN]                │  │
│  │                                              │  │
│  │  [Reenviar correo de verificación]         │  │
│  │                                              │  │
│  │  ════════════════════════════════════════  │  │ ← DIVIDER
│  │     ⚙️ MODO DESARROLLO - Link de           │  │
│  │        Verificación:                       │  │
│  │                                              │  │
│  │     ┌──────────────────────────────────┐   │  │
│  │     │ http://localhost:4200/auth/      │   │  │ ← SCROLLABLE
│  │     │ verify-email?token=eyJhbGciOi...  │   │  │  BOX
│  │     │ &email=einstein3%40email.com      │   │  │
│  │     └──────────────────────────────────┘   │  │
│  │                                              │  │
│  │   [🔗 HACER CLIC AQUÍ PARA VERIFICAR (DEV)]│  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Dev Mode - Colori e Styling

### 📍 Sezione "MODO DESARROLLO"

**Trigger Conditions:**
```typescript
@if (isDevelopmentMode() && verificationLink()) {
  // Mostra sezione dev mode
}
```

**Styling:**
```css
/* Background giallo per attirare attenzione */
background-color: #fef3c7;  /* yellow-50 */
border: 2px solid #fcd34d;  /* yellow-300 */
border-radius: 8px;
padding: 16px;
margin-top: 32px;

/* Titolo in grassetto */
font-weight: bold;
color: #854d0e;  /* yellow-800 */
font-size: 12px;

/* Link box con scrollbar */
background-color: white;
border-radius: 6px;
padding: 12px;
max-height: 80px;
overflow-y: auto;
font-family: monospace;
font-size: 12px;
color: #374151;
word-break: break-all;
margin: 12px 0;

/* Pulsante giallo */
background-color: #fcd34d;  /* yellow-400 */
color: #78350f;  /* yellow-900 */
padding: 8px 16px;
border-radius: 9999px;
font-weight: 600;
text-decoration: none;
display: inline-block;
width: 100%;
text-align: center;
transition: background-color 0.2s;

/* Hover state */
&:hover {
  background-color: #f59e0b;  /* yellow-500 */
}
```

---

## Comportamento Dev Mode Detection

### 1️⃣ Automatic Detection

**Logica nel Component:**
```typescript
ngOnInit() {
  // Detect dev mode
  const isDev = !this.isProd();
  this.isDevelopmentMode.set(isDev);
}

private isProd(): boolean {
  const host = window.location.hostname;
  return !host.includes('localhost') && 
         !host.includes('127.0.0.1') && 
         !host.includes('dev');
}
```

**Hostname Examples:**

| Hostname | isDev | Result |
|----------|-------|--------|
| `localhost` | true | ✅ Mostra link |
| `localhost:4200` | true | ✅ Mostra link |
| `127.0.0.1` | true | ✅ Mostra link |
| `myapp.dev` | true | ✅ Mostra link |
| `dev.tottus.com` | true | ✅ Mostra link |
| `tottus.com` | false | ❌ NO mostra link |
| `app.prod.com` | false | ❌ NO mostra link |
| `192.168.1.100` | false | ❌ NO mostra link |

---

## 🔗 Link di Verifica - Struttura

### Formato Completo

```
http://localhost:4200/auth/verify-email?token=ABC123&email=user@example.com
│        │          │      │             │      │
│        │          │      │             │      └─ Email (URL encoded)
│        │          │      │             └─ Token JWT
│        │          │      └─ Query params separator
│        │          └─ Route component
│        └─ Port (angular dev server)
└─ Protocol + hostname
```

### Parametri Query

| Param | Value | Example |
|-------|-------|---------|
| `token` | JWT univoco | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `email` | Email (URL encoded) | `user%40example.com` |

### URL Encoding

```javascript
// Raw email
'user@example.com'

// URL encoded
'user%40example.com'

// Frontend auto-encodes:
encodeURIComponent('user@example.com')
// → 'user%40example.com'
```

---

## Link Storage Flow

```
┌──────────────────────────────────────┐
│ 1. USER REGISTERS                    │
│    POST /api/auth/register           │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 2. BACKEND RESPONSE (DEV MODE)       │
│ {                                    │
│   verificationLink: "http://..."     │
│   verificationToken: "JWT..."        │
│ }                                    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 3. FRONTEND STORES IN SESSION        │
│                                      │
│ sessionStorage.setItem(              │
│   'verificationLink',                │
│   response.verificationLink          │
│ )                                    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 4. EMAIL VERIFICATION COMPONENT      │
│    READS FROM SESSION                │
│                                      │
│ const link =                         │
│   sessionStorage.getItem(            │
│     'verificationLink'               │
│   )                                  │
│ this.verificationLink.set(link)      │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 5. UI DISPLAYS LINK (DEV MODE)       │
│                                      │
│ @if (isDevelopmentMode() &&          │
│      verificationLink())              │
│   [Show yellow box with link]        │
└──────────────────────────────────────┘
```

---

## 🧪 Testing Journey

### Step 1: Fill Registration Form
```
Email: einstein3@email.com
Password: Password123!
... other fields ...
```

### Step 2: Submit Form
```
POST /api/auth/register
  ⏳ Loading...
```

### Step 3: See Verification Screen
```
✅ Successfully navigated to verification screen
✅ Email person@example.com shown correctly
```

### Step 4: Locate Dev Mode Section
```
Scroll down to bottom of page
Look for yellow box with ⚙️ icon
```

### Step 5: Copy Link (Alternative)
```
Option A: Click the link directly
  → Opens in current tab

Option B: Copy the link
  → Paste in browser manually

Option C: Right-click → Open in new tab
  → Inspect in separate tab
```

### Step 6: Verify Process
```
URL changes to: /auth/verify-email?token=...&email=...
⏳ "Verificando tu cuenta..."
✅ "¡Cuenta verificada correctamente!"
Counter: 3... 2... 1...
🔄 Auto-redirect to /auth/login
```

### Step 7: Login
```
Email: einstein3@email.com
Password: Password123!
[Sign In]
✅ Login successful!
```

---

## 🔒 Security Flow

### What Gets Stored Where

```
Backend (Server)
├─ Database
│  ├─ user.verified = false/true
│  ├─ user.verificationToken = JWT (hashed)
│  └─ user.verificationTokenExpiresAt = timestamp
│
├─ Email
│  └─ Verification link (user clicks via email)
│
└─ Response (only in DEV)
   ├─ verificationLink (frontend dev display)
   └─ verificationToken (for token verification)


Frontend Client
├─ sessionStorage
│  └─ 'verificationLink' = full URL
│
├─ Memory
│  ├─ emailToVerify = 'user@example.com'
│  └─ showVerificationScreen = true
│
└─ URL (when user clicks verify)
   ├─ /auth/verify-email?token=...&email=...
   └─ ActivatedRoute extracts params
```

### Info Flow Diagram

```
Production Mode (Secure):
    Backend (no link in response)
         ↓
    Email sent to user inbox
         ↓
    User reads email + clicks link
         ↓
    Verification complete


Development Mode (Convenient):
    Backend (includes link in response)
         ↓
    Frontend stores in sessionStorage
         ↓
    UI displays link in yellow box
         ↓
    Developer clicks link directly
         ↓
    Verification complete
```

---

## 🎨 Dev Mode Visual Indicators

### Makes it Obvious You're in Dev Mode

**Yellow Styling:**
- 🟡 Bright yellow background (`#fef3c7`)
- 🟡 Bold yellow border
- 🟡 Yellow-text header

**Emoji Indicators:**
- ⚙️ Gear emoji = settings/development
- 🔗 Link emoji = clickable link
- (Dev) suffix = clearly marked

**Non-Obtrusive:**
- Below all user-facing content
- Optional section (not required)
- Easy to ignore if not testing

---

## ❌ Hidden in Production

### Automatic Hiding

```typescript
// Check runs automatically
private isProd(): boolean {
  const host = window.location.hostname;
  const isProd = !host.includes('localhost') && 
                 !host.includes('127.0.0.1') && 
                 !host.includes('dev');
  return isProd;
}

// Result: isDevelopmentMode = signal(false)
// Condition: @if (isDevelopmentMode() && ...)
// Outcome: Dev section completely hidden
```

### Deployment Checklist

```bash
# Frontend
✅ Dev mode auto-detects prod domain
✅ Yellow box completely hidden in prod
✅ No console warnings
✅ sessionStorage not used in prod

# Backend
✅ verificationLink not in response in prod
✅ verificationToken not in response in prod
✅ Token stored securely in database
✅ Email sent with verification link
```

---

## 🚀 User Experience

### Developer/Tester
✅ See verification link immediately
✅ No need to check email
✅ Can test immediately
✅ Can click link multiple times

### End User (Production)
✅ No link visible (secure)
✅ Must check email inbox
✅ Must click link from email
✅ Adds verification step

---

## 📊 Summary

| Aspect | Dev Mode | Production |
|--------|----------|-----------|
| **Hostname** | localhost, dev | .com, .io, etc |
| **Link Visible** | ✅ Yes (yellow) | ❌ No |
| **Storage** | sessionStorage | None (email only) |
| **Backend Response** | Includes link | No link |
| **UX** | Instant verify | Check email |
| **Security** | Dev only | Full secure |

---

**Dev mode makes testing convenient without compromising production security!** 🔐
