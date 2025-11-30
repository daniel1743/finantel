# 🚀 Guía para Desplegar Funciones Edge Faltantes

## 📋 Funciones que Faltan Subir a Supabase

### 🔴 Prioridad ALTA (Subir primero)

1. **monthly-closure**
   ```bash
   npx supabase functions deploy monthly-closure
   ```

2. **mercadopago-webhook**
   ```bash
   npx supabase functions deploy mercadopago-webhook
   ```

3. **create-payment-preference**
   ```bash
   npx supabase functions deploy create-payment-preference
   ```

### 🟡 Prioridad MEDIA (Subir después)

4. **generate-alert**
   ```bash
   npx supabase functions deploy generate-alert
   ```

5. **leak-hunter**
   ```bash
   npx supabase functions deploy leak-hunter
   ```

6. **calculate-financial-mood**
   ```bash
   npx supabase functions deploy calculate-financial-mood
   ```

### 🟢 Prioridad BAJA (Opcionales)

7. **cancel-subscription**
   ```bash
   npx supabase functions deploy cancel-subscription
   ```

8. **create-checkout-session**
   ```bash
   npx supabase functions deploy create-checkout-session
   ```

9. **find-user-by-email**
   ```bash
   npx supabase functions deploy find-user-by-email
   ```

10. **health**
    ```bash
    npx supabase functions deploy health
    ```

11. **voice-to-transaction-chatgpt**
    ```bash
    npx supabase functions deploy voice-to-transaction-chatgpt
    ```

---

## 📝 Lista Simple (Solo Nombres)

Copia y pega estos nombres uno por uno:

```
monthly-closure
mercadopago-webhook
create-payment-preference
generate-alert
leak-hunter
calculate-financial-mood
cancel-subscription
create-checkout-session
find-user-by-email
health
voice-to-transaction-chatgpt
```

---

## 🎯 Comando Único (Si prefieres copiar/pegar rápido)

```bash
npx supabase functions deploy monthly-closure && \
npx supabase functions deploy mercadopago-webhook && \
npx supabase functions deploy create-payment-preference && \
npx supabase functions deploy generate-alert && \
npx supabase functions deploy leak-hunter && \
npx supabase functions deploy calculate-financial-mood && \
npx supabase functions deploy cancel-subscription && \
npx supabase functions deploy create-checkout-session && \
npx supabase functions deploy find-user-by-email && \
npx supabase functions deploy health && \
npx supabase functions deploy voice-to-transaction-chatgpt
```

---

## ✅ Checklist

Marca cada función cuando la despliegues:

- [ ] monthly-closure
- [ ] mercadopago-webhook
- [ ] create-payment-preference
- [ ] generate-alert
- [ ] leak-hunter
- [ ] calculate-financial-mood
- [ ] cancel-subscription
- [ ] create-checkout-session
- [ ] find-user-by-email
- [ ] health
- [ ] voice-to-transaction-chatgpt

---

## 📊 Resumen

- **Total funciones faltantes:** 11
- **Críticas:** 3
- **Importantes:** 3
- **Opcionales:** 5

---

## 💡 Notas

- Asegúrate de estar en el directorio del proyecto antes de ejecutar los comandos
- Si usas `supabase` directamente (sin npx), reemplaza `npx supabase` por `supabase`
- Verifica que cada función se despliegue correctamente antes de continuar con la siguiente
- Las funciones críticas (monthly-closure, mercadopago-webhook, create-payment-preference) son las más importantes

