import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBooking: () => void;
  bookingDetails: {
    listingName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    paymentMethod: 'cash' | 'stripe';
  };
}

export const BookingConfirmationDialog: React.FC<BookingConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onViewBooking,
  bookingDetails
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6">
          <DialogHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {language === 'ar' ? 'تم تأكيد حجزك!' : 'Booking Confirmed!'}
              </DialogTitle>
            </motion.div>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 space-y-6"
          >
            {/* Booking Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{bookingDetails.listingName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bookingDetails.nights} {language === 'ar' ? 'ليلة' : 'nights'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(bookingDetails.checkIn).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(bookingDetails.checkOut).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Confirmation Alert */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    {language === 'ar' ? 'مكالمة تأكيد قادمة' : 'Confirmation Call Coming'}
                  </h4>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {language === 'ar' 
                      ? 'سيتصل بك فريق نورتوا خلال وقت قصير جداً لتأكيد تفاصيل حجزك وترتيب كافة احتياجاتك للإقامة المثالية'
                      : 'The Nawartu team will call you very shortly to confirm your booking details and arrange everything for your perfect stay'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Payment Method Note */}
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bookingDetails.paymentMethod === 'cash' ? (
                  language === 'ar' ? 
                    'طريقة الدفع: نقداً عند الوصول' : 
                    'Payment Method: Cash on Arrival'
                ) : (
                  language === 'ar' ? 
                    'تم الدفع بنجاح عبر البطاقة الائتمانية' : 
                    'Payment Successfully Processed via Credit Card'
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={onViewBooking}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
              >
                {language === 'ar' ? 'عرض تفاصيل الحجز' : 'View Booking Details'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>

            {/* Footer Message */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 
                  'شكراً لاختيارك نورتوا لإقامتك' :
                  'Thank you for choosing Nawartu for your stay'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};