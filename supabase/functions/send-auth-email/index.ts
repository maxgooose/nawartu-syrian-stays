import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_AUTH_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url }
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        user_metadata?: {
          full_name?: string;
          preferred_language?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    const isArabic = user.user_metadata?.preferred_language === 'ar';
    const userName = user.user_metadata?.full_name || user.email.split('@')[0];
    
    // Determine email content based on action type
    let subject: string;
    let htmlContent: string;
    
    if (email_action_type === 'signup') {
      subject = isArabic ? 'مرحباً بك في نورتوا - تأكيد الحساب' : 'Welcome to Nawartu - Confirm Your Account';
      
      const confirmUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: ${isArabic ? 'Tajawal, Arial' : 'Arial'}, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #8B4513, #D2691E); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 32px; font-weight: bold;">N</span>
            </div>
            <h1 style="color: #8B4513; margin: 0; font-size: 28px;">
              ${isArabic ? 'مرحباً بك في نورتوا' : 'Welcome to Nawartu'}
            </h1>
            <p style="color: #666; margin: 10px 0 0; font-size: 16px;">
              ${isArabic ? 'منصة الإقامة السورية' : 'Syrian Hospitality Platform'}
            </p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #8B4513; margin-top: 0;">
              ${isArabic ? `أهلاً ${userName}!` : `Hello ${userName}!`}
            </h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
              ${isArabic 
                ? 'شكراً لك على انضمامك إلى نورتوا، منصة الإقامة السورية الأصيلة. لإكمال عملية التسجيل، يرجى تأكيد عنوان بريدك الإلكتروني.'
                : 'Thank you for joining Nawartu, the authentic Syrian hospitality platform. To complete your registration, please confirm your email address.'
              }
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);">
                ${isArabic ? 'تأكيد البريد الإلكتروني' : 'Confirm Email Address'}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              ${isArabic 
                ? 'أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:'
                : 'Or copy and paste this link into your browser:'
              }
            </p>
            <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; word-break: break-all; font-size: 12px; color: #666;">
              ${confirmUrl}
            </div>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
            <p>
              ${isArabic 
                ? 'إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.'
                : 'If you didn\'t create this account, you can safely ignore this email.'
              }
            </p>
            <p style="margin-top: 20px;">
              ${isArabic ? 'مع أطيب التحيات،' : 'Best regards,'}<br>
              <strong>${isArabic ? 'فريق نورتوا' : 'The Nawartu Team'}</strong>
            </p>
          </div>
        </body>
        </html>
      `;
    } else if (email_action_type === 'recovery') {
      subject = isArabic ? 'إعادة تعيين كلمة المرور - نورتوا' : 'Reset Your Password - Nawartu';
      
      const resetUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: ${isArabic ? 'Tajawal, Arial' : 'Arial'}, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #8B4513, #D2691E); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 32px; font-weight: bold;">N</span>
            </div>
            <h1 style="color: #8B4513; margin: 0; font-size: 28px;">
              ${isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}
            </h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #8B4513; margin-top: 0;">
              ${isArabic ? `مرحباً ${userName}` : `Hello ${userName}`}
            </h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
              ${isArabic 
                ? 'تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في نورتوا. انقر على الزر أدناه لإنشاء كلمة مرور جديدة.'
                : 'We received a request to reset the password for your Nawartu account. Click the button below to create a new password.'
              }
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);">
                ${isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              ${isArabic 
                ? 'هذا الرابط صالح لمدة 24 ساعة فقط لأسباب أمنية.'
                : 'This link is valid for 24 hours only for security reasons.'
              }
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
            <p>
              ${isArabic 
                ? 'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.'
                : 'If you didn\'t request a password reset, you can safely ignore this email.'
              }
            </p>
            <p style="margin-top: 20px;">
              ${isArabic ? 'مع أطيب التحيات،' : 'Best regards,'}<br>
              <strong>${isArabic ? 'فريق نورتوا' : 'The Nawartu Team'}</strong>
            </p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Default for other email types
      subject = isArabic ? 'رسالة من نورتوا' : 'Message from Nawartu';
      htmlContent = `
        <h1>${isArabic ? 'مرحباً من نورتوا' : 'Hello from Nawartu'}</h1>
        <p>${isArabic ? 'تم إرسال هذا البريد الإلكتروني من نورتوا.' : 'This email was sent from Nawartu.'}</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Nawartu <info@nawartu.com>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Custom auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);