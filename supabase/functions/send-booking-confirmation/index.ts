import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  guestEmail: string;
  guestName: string;
  listingName: string;
  listingLocation: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalAmount: number;
  paymentMethod: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      guestEmail, 
      guestName, 
      listingName, 
      listingLocation, 
      checkInDate, 
      checkOutDate, 
      totalNights, 
      totalAmount, 
      paymentMethod,
      bookingId 
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation email to:", guestEmail);

    const emailResponse = await resend.emails.send({
      from: "Nawartu <info@nawartu.com>",
      to: [guestEmail],
      subject: "تأكيد استلام طلب الحجز - نوارتو",
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">نوارتو</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">منصة الضيافة الأولى</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">مرحباً ${guestName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              شكراً لك على اختيارك منصة نوارتو لحجز إقامتك. لقد تم استلام طلب حجزك بنجاح ونحن نقوم بمعالجته حالياً.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">تفاصيل الحجز:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>العقار:</strong> ${listingName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>الموقع:</strong> ${listingLocation}</p>
              <p style="margin: 5px 0; color: #666;"><strong>تاريخ الوصول:</strong> ${new Date(checkInDate).toLocaleDateString('ar-SA')}</p>
              <p style="margin: 5px 0; color: #666;"><strong>تاريخ المغادرة:</strong> ${new Date(checkOutDate).toLocaleDateString('ar-SA')}</p>
              <p style="margin: 5px 0; color: #666;"><strong>عدد الليالي:</strong> ${totalNights} ليلة</p>
              <p style="margin: 5px 0; color: #666;"><strong>المبلغ الإجمالي:</strong> $${totalAmount}</p>
              <p style="margin: 5px 0; color: #666;"><strong>طريقة الدفع:</strong> ${paymentMethod === 'cash' ? 'نقداً' : 'بطاقة ائتمان'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>رقم الحجز:</strong> ${bookingId}</p>
            </div>
            
            ${paymentMethod === 'cash' ? `
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-right: 4px solid #ffc107; margin: 20px 0;">
                <h3 style="color: #856404; margin-bottom: 10px; font-size: 16px;">معلومات الحجز النقدي:</h3>
                <ul style="color: #856404; line-height: 1.6; margin: 0; padding-right: 20px;">
                  <li>سيتم حجز الأيام الثلاثة الأولى فقط</li>
                  <li>سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الحجز</li>
                  <li>يجب دفع المبلغ نقداً عند الوصول</li>
                </ul>
              </div>
            ` : `
              <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border-right: 4px solid #17a2b8; margin: 20px 0;">
                <h3 style="color: #0c5460; margin-bottom: 10px; font-size: 16px;">معلومات الدفع بالبطاقة الائتمانية:</h3>
                <ul style="color: #0c5460; line-height: 1.6; margin: 0; padding-right: 20px;">
                  <li>تم حجز جميع الأيام المحددة</li>
                  <li>سيتم تأكيد الدفع خلال دقائق</li>
                  <li>سيتواصل معك فريقنا لتأكيد التفاصيل النهائية</li>
                </ul>
              </div>
            `}
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; border-right: 4px solid #2196f3; margin: 20px 0;">
              <h3 style="color: #1565c0; margin-bottom: 10px; font-size: 16px;">الخطوات التالية:</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-right: 20px;">
                <li>سيراجع فريقنا المختص طلب حجزك خلال 24 ساعة عمل</li>
                <li>ستصلك رسالة تأكيد نهائية عبر البريد الإلكتروني أو الهاتف من أحد أعضاء فريقنا</li>
                <li>يمكنك مراجعة حالة حجزك في لوحة التحكم الخاصة بك</li>
              </ul>
            </div>
            
            <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px; border-right: 4px solid #9c27b0; margin: 20px 0;">
              <h3 style="color: #4a148c; margin-bottom: 10px; font-size: 16px;">معلومات مهمة:</h3>
              <p style="color: #4a148c; line-height: 1.6; margin: 0;">
                <strong>يرجى العلم:</strong> هذه الرسالة هي تأكيد استلام طلب الحجز فقط. 
                ستصلك رسالة تأكيد ثانية من أحد أعضاء فريقنا بعد مراجعة الطلب وتأكيد التوفر. 
                هذه العملية تضمن جودة الخدمة وتأكيد جميع التفاصيل.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.app') || 'https://your-app-url.com'}/guest-dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                مراجعة حجوزاتي
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              إذا كانت لديك أي أسئلة حول حجزك، لا تتردد في التواصل معنا عبر البريد الإلكتروني أو الهاتف. 
              نحن متشوقون لاستضافتك وتقديم تجربة إقامة مميزة!
            </p>
            
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 20px;">
              مع أطيب التحيات،<br>
              فريق نوارتو
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} نوارتو - منصة الضيافة الأولى
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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