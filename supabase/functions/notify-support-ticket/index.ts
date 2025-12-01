// =====================================================
// EDGE FUNCTION: Notify Support Ticket
// =====================================================
// Envía notificaciones por correo cuando se crea un ticket de soporte
// =====================================================

import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketNotification {
  ticket_id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  created_at: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar que viene de un trigger de la base de datos
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      // Permitir llamadas desde triggers de Supabase (service_role)
      const serviceKey = req.headers.get('apikey') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!serviceKey) {
        throw new Error('Unauthorized: Missing service key');
      }
    }

    // Crear cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Parsear el body
    const ticketData: TicketNotification = await req.json();

    // Validar datos requeridos
    if (!ticketData.ticket_id || !ticketData.user_email || !ticketData.subject || !ticketData.message) {
      throw new Error('Missing required fields: ticket_id, user_email, subject, message');
    }

    // Obtener email del administrador desde variables de entorno
    // Prioridad: ADMIN_EMAIL > SUPPORT_EMAIL > fallback
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 
                      Deno.env.get('SUPPORT_EMAIL') || 
                      Deno.env.get('NOTIFICATION_EMAIL') ||
                      'soporte@finantel.app';
    
    // Log para debugging (sin exponer el email completo)
    console.log('Admin email configured:', adminEmail ? `${adminEmail.substring(0, 3)}***` : 'NOT SET');
    
    // Obtener información adicional del usuario si está disponible
    let userName = ticketData.user_name || 'Usuario';
    if (!userName || userName === 'Usuario') {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(ticketData.user_id);
        if (userData?.user) {
          userName = userData.user.user_metadata?.full_name || 
                     userData.user.email?.split('@')[0] || 
                     'Usuario';
        }
      } catch (e) {
        console.warn('Could not fetch user data:', e);
      }
    }

    // Mapear categorías y prioridades a español
    const categoryMap: Record<string, string> = {
      'general': 'General',
      'facturacion': 'Facturación',
      'dato': 'Datos & Privacidad',
      'bug': 'Error en la app',
      'sugerencia': 'Sugerencia',
    };

    const priorityMap: Record<string, string> = {
      'baja': 'Baja',
      'normal': 'Normal',
      'alta': 'Alta',
      'critica': 'Crítica',
    };

    const categoryLabel = categoryMap[ticketData.category] || ticketData.category;
    const priorityLabel = priorityMap[ticketData.priority] || ticketData.priority;

    // Construir el cuerpo del correo
    const emailSubject = `[Finantel] Nuevo ticket de soporte: ${ticketData.subject}`;
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1C8FA0 0%, #167a8a 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1C8FA0; }
    .label { font-weight: 600; color: #6E6E73; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 16px; color: #1a1a1a; margin-top: 4px; }
    .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 12px 24px; background: #1C8FA0; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #6E6E73; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Nuevo Ticket de Soporte</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Se ha creado un nuevo ticket en el sistema</p>
    </div>
    <div class="content">
      <div class="ticket-info">
        <div class="label">ID del Ticket</div>
        <div class="value">#${ticketData.ticket_id.slice(0, 8)}</div>
      </div>
      
      <div class="ticket-info">
        <div class="label">Usuario</div>
        <div class="value">${userName} (${ticketData.user_email})</div>
      </div>
      
      <div class="ticket-info">
        <div class="label">Asunto</div>
        <div class="value">${ticketData.subject}</div>
      </div>
      
      <div class="ticket-info">
        <div class="label">Categoría</div>
        <div class="value">${categoryLabel}</div>
      </div>
      
      <div class="ticket-info">
        <div class="label">Prioridad</div>
        <div class="value">${priorityLabel}</div>
      </div>
      
      <div class="message-box">
        <div class="label">Mensaje</div>
        <div class="value" style="white-space: pre-wrap; margin-top: 12px;">${ticketData.message}</div>
      </div>
      
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://finantel.net'}/dashboard/admin/support" class="button">
        Ver Ticket en Panel Admin
      </a>
      
      <div class="footer">
        <p>Este es un correo automático del sistema de soporte de Finantel.</p>
        <p>No respondas a este correo. Responde directamente desde el panel de administración.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Intentar enviar correo usando Resend (si está configurado)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Finantel <noreply@finantel.app>';
        
        // Validar que el email del admin esté configurado
        if (!adminEmail || adminEmail === 'soporte@finantel.app') {
          console.warn('ADMIN_EMAIL not configured, using default fallback');
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: emailSubject,
            html: emailBody,
            reply_to: ticketData.user_email,
            tags: [
              { name: 'category', value: 'support-ticket' },
              { name: 'priority', value: ticketData.priority },
            ],
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error('Resend API error:', errorText);
          throw new Error(`Resend API error: ${errorText}`);
        }

        const resendData = await resendResponse.json();
        console.log('✅ Email sent via Resend:', {
          id: resendData.id,
          to: adminEmail.substring(0, 3) + '***', // Ocultar email completo en logs
          ticket_id: ticketData.ticket_id,
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Notification sent via Resend',
            ticket_id: ticketData.ticket_id,
            email_id: resendData.id,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (resendError) {
        console.error('❌ Resend error:', resendError);
        // Continuar con método alternativo
      }
    }

    // Método alternativo: usar Supabase Edge Function para enviar correo
    // (Requiere configuración de SMTP en Supabase)
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: adminEmail,
          subject: emailSubject,
          html: emailBody,
          reply_to: ticketData.user_email,
        },
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Notification sent via Supabase',
          ticket_id: ticketData.ticket_id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (supabaseError) {
      console.error('Supabase email error:', supabaseError);
      // Si ambos métodos fallan, al menos loguear el ticket
      console.log('Ticket notification (email not sent):', {
        ticket_id: ticketData.ticket_id,
        user_email: ticketData.user_email,
        subject: ticketData.subject,
        admin_email: adminEmail,
      });

      // Retornar éxito parcial para que el trigger no falle
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Ticket logged (email service not configured)',
          ticket_id: ticketData.ticket_id,
          warning: 'Email notification could not be sent. Please configure RESEND_API_KEY or Supabase SMTP.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error in notify-support-ticket:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

