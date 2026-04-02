# 🧪 Local Development Testing Guide

## 📱 Como Testare il Flusso Email Verification in Locale

### Scenario 1: Registrazione con Link Visibile (Dev Mode)

#### Step 1: Avvia l'app
```bash
npm run start
# Naviga a http://localhost:4200
```

#### Step 2: Apri il tab Registration
```
Home → Register (o /auth/register)
```

#### Step 3: Riempi il form di registrazione
```
Nome:         Juan
Cognome:      García
Email:        test@example.com
Telefono:     +56 9 1234 5678
Tipo Doc:     DNI
Num Doc:      12345678
Età:          25
Genere:       Masculino
Città:        Santiago
Indirizzo:    Av. Test 1234
Pagamenti:    VISA
Password:     Password123!
Conf Pass:    Password123!
```

#### Step 4: Clicca "Crear cuenta"
- ⏳ Loading...
- ✅ Viene mostrato lo schermo "Verifica tu correo electrónico"

#### Step 5: Vedi il Link (Dev Mode)
```
┌─────────────────────────────────────────────┐
│ ⚙️ MODO DESARROLLO - Link de Verificación: │
│                                             │
│ http://localhost:4200/auth/verify-email?... │
│                                             │
│ 🔗 Hacer clic aquí para verificar (Dev)    │
└─────────────────────────────────────────────┘
```

#### Step 6: Clicca il Link
- ✨ Pagina redirect a `/auth/verify-email`
- ⏳ "Verificando tu cuenta..."
- ✅ After 3s, "¡Cuenta verificada correctamente!"
- Auto-redirect a `/auth/login`

#### Step 7: Login
```
Email:    test@example.com
Password: Password123!
```
- ✅ Login riuscito!
- 🏠 Redirect alla home

---

### Scenario 2: Resend Email (Dev Mode)

#### Step 1: Nel schermo di verifica, clicca "Reenviar correo"
```
┌───────────────────────────────────────────┐
│ Reenviar correo de verificación           │
└───────────────────────────────────────────┘
```

#### Step 2: Attendi risposta
- ✅ "Correo de verificación reenviado exitosamente"
- 🆕 Il link viene aggiornato nel sessionStorage
- Mostra nuovo link se backend lo fornisce

#### Step 3: Usa il nuovo link
- Clicca il nuovo link mostrato
- Procedi al login

---

### Scenario 3: Token Scaduto (Simula)

#### Option A: Backend Mock (Development)
```typescript
// Nel mock backend, genera token con expiry breve
const verificationToken = jwt.sign(
  { email: 'test@example.com' },
  'secret',
  { expiresIn: '5s' }  // Expira dopo 5 secondi
);
```

#### Option B: Modifica URL manualmente
1. Copia il link di verifica mostrato
2. Attendi 24+ ore (o se token expire è breve, attendi)
3. Clicca il link vecchio
4. Vedrai errore: "El token de verificación es inválido o ha expirado."
5. Pulsante "Reenviar correo" disponibile

#### Option C: Browser DevTools
1. Apri Console (F12)
2. Set token expirato:
```javascript
sessionStorage.setItem('verificationLink', 
  'http://localhost:4200/auth/verify-email?token=invalid&email=test@example.com');
// Ricaricare pagina
```

---

### Scenario 4: Email Non Ricevuta (Simulare)

#### Step 1: Nel schermo di verifica
```
┌────────────────────────────────────┐
│ 📧 ¿No ves el correo?             │
│ Revisa tu carpeta de spam...      │
│                                    │
│ Reenviar correo de verificación   │
└────────────────────────────────────┘
```

#### Step 2: Clicca "Reenviar correo"
- Backend genera nuovo token
- Risposta include nuovo link
- Frontend aggiorna sessionStorage
- Mostra messaggio "Correo reenviado exitosamente"

#### Step 3: Clicca nuovo link
- Procedi alla verifica

---

### Scenario 5: Link Modificato (Sicurezza)

#### Step 1: Nel browser, modifica il link
```
Original:
http://localhost:4200/auth/verify-email?token=ABC123&email=user@example.com

Modificato (wrong email):
http://localhost:4200/auth/verify-email?token=ABC123&email=hacker@example.com
```

#### Step 2: Clicca il link modificato
- ✅ Check: Backend controlla che email nel token == email nei params
- ❌ Token non valida questa combinazione
- Errore: "El token de verificación es inválido"
- ✅ Sicurezza funziona!

---

## 🛠️ Mock Backend for Local Testing

Se il backend non e ancora pronto, puoi mockare le risposte:

### Option 1: HTTP Client Mock Interceptor

**File**: `src/app/core/interceptors/mock-auth.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class MockAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Mock POST /api/auth/register
    if (req.method === 'POST' && req.url.includes('/api/auth/register')) {
      const { email } = req.body;
      
      // Genera token finto
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.mock`;
      
      // Genera link di verifica
      const verificationLink = `http://localhost:4200/auth/verify-email?token=${mockToken}&email=${encodeURIComponent(email)}`;
      
      const response = new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: {
          message: 'Registrazione completata. Verifica l\'email',
          email,
          userId: 'user-' + Date.now(),
          success: true,
          verificationToken: mockToken,
          verificationLink: verificationLink
        }
      });
      
      return of(response).pipe(delay(1000)); // Simula 1s delay
    }
    
    // Mock POST /api/auth/verify-email
    if (req.method === 'POST' && req.url.includes('/api/auth/verify-email')) {
      const { email, verificationToken } = req.body;
      
      // Mock: accetta qualsiasi token in dev mode
      if (verificationToken && verificationToken !== 'invalid') {
        const response = new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            message: 'Email verificata con successo',
            success: true
          }
        });
        return of(response).pipe(delay(1500)); // Simula 1.5s delay
      } else {
        const response = new HttpResponse({
          status: 400,
          statusText: 'Bad Request',
          body: {
            message: 'El token de verificación es inválido o ha expirado',
            success: false
          }
        });
        return of(response).pipe(delay(500));
      }
    }
    
    // Pass other requests through
    return next.handle(req);
  }
}
```

### Registra l'Interceptor

**File**: `src/app/app.config.ts`

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MockAuthInterceptor } from './core/interceptors/mock-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([...])
      // Aggiungi custom HTTP provider per mock
    )
  ]
};
```

---

## 🔍 Browser DevTools Debugging

### Ispeziona il Link di Verifica

#### Step 1: Apri DevTools (F12)
```
Console tab
```

#### Step 2: Leggi sessionStorage
```javascript
// Console
sessionStorage.getItem('verificationLink')

// Output:
// "http://localhost:4200/auth/verify-email?token=eyJhbGciOiJ...&email=test%40example.com"
```

#### Step 3: Itera manualmente sulla verifica
```javascript
// Simula il click del link
const link = sessionStorage.getItem('verificationLink');
window.location.href = link;
```

#### Step 4: Monitorizza network requests
```
Network tab → Filter: "verify-email"
```

Dovresti vedere:
- ✅ 1x POST `/api/auth/register` → 201
- ✅ 1x POST `/api/auth/verify-email` → 200 (se token ok)

---

## 📋 Checklist Testing

### Dev Mode Display
- [ ] Schermo "Verifica tu correo" mostra il link in dev mode
- [ ] Link è completamente visibile (non truncato)
- [ ] Pulsante "🔗 Hacer clic aquí para verificar (Dev)" funziona
- [ ] In produzione (prod domain) il link NON si mostra

### Registrazione
- [ ] Form validation funziona
- [ ] Token generato e salvato in sessionStorage
- [ ] Link di verifica è valido (include email corretta)
- [ ] Backend mock torna verificationLink

### Verifica Email
- [ ] Cliccare il link → `/auth/verify-email?token=...&email=...`
- [ ] Loading state mostra spinner per 1-2 secondi
- [ ] Success: mostra checkmark ✓
- [ ] Auto-redirect a login dopo 3 secondi
- [ ] Button "Ir a iniciar sesión" funziona manualmente

### Errori
- [ ] Token invalido → errore 400 con messaggio specifico
- [ ] Token scaduto → errore 400
- [ ] Account già verificato → errore 410
- [ ] Email non found → errore 404
- [ ] Tutti i messaggi di errore sono leggibili in spagnolo

### Resend Email
- [ ] Pulsante "Reenviar correo" visibile
- [ ] Click → backend genera nuovo token
- [ ] Novo link mostrato nel componente
- [ ] Non più di 5 resend per ora (rate limiting)
- [ ] Success message verde

### Login Post-Verification
- [ ] Account verificato può fare login
- [ ] Account non verificato è bloccato dal login
- [ ] Messaggio: "Account non verificato. Verifica l'email"

---

## 🚀 Fast Testing Loop

```bash
# Terminal 1: Avvia Angular Dev Server
npm run start
# http://localhost:4200

# Terminal 2: Monitorizza logs (opzionale)
ng test --watch

# Browser: http://localhost:4200/auth/register
# 1. Riempi form
# 2. Clicca "Crear cuenta"
# 3. Copia link da schermo dev
# 4. Clicca link
# 5. Vedi "¡Cuenta verificada!"
# 6. Clicca "Ir a iniciar sesión"
# 7. Clicca login
# ✅ Done!
```

---

## 📸 Expected UI Screenshots

### After Registration (Dev Mode)
```
┌─────────────────────────────────────┐
│ [Logo]                              │
│                                      │
│ Verifica tu correo electrónico      │
│                                      │
│ Te hemos enviado un correo a        │
│ test@example.com con instr...       │
│                                      │
│ 📧 ¿No ves el correo?               │
│ Revisa tu carpeta de spam           │
│                                      │
│ ────────────────────────────────    │
│                                      │
│ O haz clic en el botón:             │
│ [✓ Verificar ahora]                 │
│                                      │
│ ¿Ya verificaste tu cuenta?          │
│ [← Ir a iniciar sesión]             │
│                                      │
│ [Reenviar correo de verificación]   │
│                                      │
│ ⚙️ MODO DESARROLLO                  │
│ ┌─────────────────────────────┐    │
│ │ http://localhost:4200/auth/ │    │
│ │ verify-email?token=...      │    │
│ └─────────────────────────────┘    │
│ [🔗 Hacer clic aquí para verificar] │
└─────────────────────────────────────┘
```

---

## ✅ Success Criteria

Quando il flusso è completo:

1. ✅ Utente si registra
2. ✅ Vede schermo verifica email
3. ✅ Clicca link dal schermo (dev mode)
4. ✅ Vede verifica in corso
5. ✅ Vede "¡Cuenta verificada!"
6. ✅ Auto-redirect a login
7. ✅ Login riuscito

**Time: ~10 secondi totali** ⚡

---

**Happy Testing!** 🚀
