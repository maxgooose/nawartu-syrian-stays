// Amenities mapping for consistent display across the application
export const AMENITIES = [
  { id: 'wifi', label: 'واي فاي', value: 'wifi' },
  { id: 'parking', label: 'موقف سيارات', value: 'parking' },
  { id: 'pool', label: 'مسبح', value: 'pool' },
  { id: 'gym', label: 'صالة رياضية', value: 'gym' },
  { id: 'kitchen', label: 'مطبخ مجهز', value: 'kitchen' },
  { id: 'ac', label: 'تكييف', value: 'air_conditioning' },
  { id: 'balcony', label: 'شرفة', value: 'balcony' },
  { id: 'garden', label: 'حديقة', value: 'garden' },
  { id: 'elevator', label: 'مصعد', value: 'elevator' },
  { id: 'electric_fans', label: 'مراوح كهربائية', value: 'electric_fans' },
  { id: 'electric_generators', label: 'مولدات كهربائية', value: 'electric_generators' },
  { id: 'electric_batteries', label: 'بطارية كهرباء', value: 'electric_batteries' },
];

// Amenity labels mapping for proper display
export const amenityLabels: Record<string, { ar: string; en: string }> = {
  wifi: { ar: 'واي فاي', en: 'WiFi' },
  parking: { ar: 'موقف سيارات', en: 'Parking' },
  air_conditioning: { ar: 'تكييف', en: 'Air Conditioning' },
  kitchen: { ar: 'مطبخ مجهز', en: 'Kitchen' },
  elevator: { ar: 'مصعد', en: 'Elevator' },
  tv: { ar: 'تلفاز', en: 'TV' },
  heating: { ar: 'تدفئة', en: 'Heating' },
  pool: { ar: 'مسبح', en: 'Pool' },
  pets_allowed: { ar: 'حيوانات أليفة مسموحة', en: 'Pets Allowed' },
  balcony: { ar: 'شرفة', en: 'Balcony' },
  garden: { ar: 'حديقة', en: 'Garden' },
  terrace: { ar: 'تراس', en: 'Terrace' },
  dishwasher: { ar: 'غسالة صحون', en: 'Dishwasher' },
  washing_machine: { ar: 'غسالة ملابس', en: 'Washing Machine' },
  refrigerator: { ar: 'ثلاجة', en: 'Refrigerator' },
  microwave: { ar: 'مايكروويف', en: 'Microwave' },
  coffee_maker: { ar: 'صانع قهوة', en: 'Coffee Maker' },
  gym: { ar: 'صالة رياضية', en: 'Gym' },
  spa: { ar: 'سبا', en: 'Spa' },
  restaurant: { ar: 'مطعم', en: 'Restaurant' },
  room_service: { ar: 'خدمة الغرف', en: 'Room Service' },
  concierge: { ar: 'كونسيرج', en: 'Concierge' },
  valet_parking: { ar: 'موقف سيارات مع خدمة', en: 'Valet Parking' },
  business_center: { ar: 'مركز أعمال', en: 'Business Center' },
  conference_rooms: { ar: 'غرف مؤتمرات', en: 'Conference Rooms' },
  free_breakfast: { ar: 'إفطار مجاني', en: 'Free Breakfast' },
  airport_shuttle: { ar: 'مكوك مطار', en: 'Airport Shuttle' },
  car_rental: { ar: 'تأجير سيارات', en: 'Car Rental' },
  tour_desk: { ar: 'مكتب جولات', en: 'Tour Desk' },
  laundry_service: { ar: 'خدمة غسيل', en: 'Laundry Service' },
  dry_cleaning: { ar: 'تنظيف جاف', en: 'Dry Cleaning' },
  currency_exchange: { ar: 'صرف عملات', en: 'Currency Exchange' },
  atm: { ar: 'صراف آلي', en: 'ATM' },
  safe_deposit_box: { ar: 'خزنة آمنة', en: 'Safe Deposit Box' },
  luggage_storage: { ar: 'تخزين أمتعة', en: 'Luggage Storage' },
  twenty_four_hour_reception: { ar: 'استقبال 24 ساعة', en: '24-Hour Reception' },
  multilingual_staff: { ar: 'موظفون متعددو اللغات', en: 'Multilingual Staff' },
  non_smoking_rooms: { ar: 'غرف غير مدخنة', en: 'Non-Smoking Rooms' },
  family_rooms: { ar: 'غرف عائلية', en: 'Family Rooms' },
  accessible_rooms: { ar: 'غرف متاحة للمعاقين', en: 'Accessible Rooms' },
  soundproof_rooms: { ar: 'غرف عازلة للصوت', en: 'Soundproof Rooms' },
  air_purifier: { ar: 'منقي هواء', en: 'Air Purifier' },
  first_aid_kit: { ar: 'حقيبة إسعافات أولية', en: 'First Aid Kit' },
  fire_extinguisher: { ar: 'مطفأة حريق', en: 'Fire Extinguisher' },
  smoke_detector: { ar: 'كاشف دخان', en: 'Smoke Detector' },
  carbon_monoxide_detector: { ar: 'كاشف أول أكسيد الكربون', en: 'Carbon Monoxide Detector' },
  electric_fans: { ar: 'مراوح كهربائية', en: 'Electric Fans' },
  electric_generators: { ar: 'مولدات كهربائية', en: 'Electric Generators' },
  electric_batteries: { ar: 'بطارية كهرباء', en: 'Electric Batteries' }
};

// Helper function to get amenity label
export const getAmenityLabel = (amenity: string, language: 'ar' | 'en'): string => {
  const amenityLabel = amenityLabels[amenity];
  return amenityLabel ? (language === 'ar' ? amenityLabel.ar : amenityLabel.en) : amenity;
};
