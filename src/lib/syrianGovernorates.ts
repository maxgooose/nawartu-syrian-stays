export interface SyrianGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  region: 'central' | 'north' | 'west' | 'east' | 'south';
  population?: number;
  majorCities: string[];
}

export const SYRIAN_GOVERNORATES: SyrianGovernorate[] = [
  {
    id: 'damascus',
    nameAr: 'دمشق',
    nameEn: 'Damascus',
    latitude: 33.5138,
    longitude: 36.2765,
    region: 'central',
    population: 2079000,
    majorCities: ['دمشق', 'دمشق القديمة', 'المالكي', 'أبو رمانة', 'الزاهرة']
  },
  {
    id: 'aleppo',
    nameAr: 'حلب',
    nameEn: 'Aleppo',
    latitude: 36.2021,
    longitude: 37.1343,
    region: 'north',
    population: 1850000,
    majorCities: ['حلب', 'عين العرب', 'عفرين', 'الباب', 'منبج']
  },
  {
    id: 'homs',
    nameAr: 'حمص',
    nameEn: 'Homs',
    latitude: 34.7394,
    longitude: 36.7163,
    region: 'central',
    population: 775000,
    majorCities: ['حمص', 'تدمر', 'القصير', 'تلكلخ', 'الرستن']
  },
  {
    id: 'hamah',
    nameAr: 'حماة',
    nameEn: 'Hama',
    latitude: 35.1519,
    longitude: 36.7500,
    region: 'central',
    population: 467000,
    majorCities: ['حماة', 'مصياف', 'محردة', 'سلمية', 'اللطامنة']
  },
  {
    id: 'latakia',
    nameAr: 'اللاذقية',
    nameEn: 'Latakia',
    latitude: 35.5376,
    longitude: 35.7800,
    region: 'west',
    population: 400000,
    majorCities: ['اللاذقية', 'جبلة', 'الحفة', 'القرداحة', 'القدموس']
  },
  {
    id: 'tartus',
    nameAr: 'طرطوس',
    nameEn: 'Tartus',
    latitude: 34.8899,
    longitude: 35.8847,
    region: 'west',
    population: 115000,
    majorCities: ['طرطوس', 'بانياس', 'الشيخ بدر', 'صافيتا', 'دركوش']
  },
  {
    id: 'idlib',
    nameAr: 'إدلب',
    nameEn: 'Idlib',
    latitude: 35.9306,
    longitude: 36.6339,
    region: 'north',
    population: 1650000,
    majorCities: ['إدلب', 'معرة النعمان', 'أريحا', 'جسر الشغور', 'حارم']
  },
  {
    id: 'raqqa',
    nameAr: 'الرقة',
    nameEn: 'Raqqa',
    latitude: 35.9500,
    longitude: 39.0167,
    region: 'east',
    population: 944000,
    majorCities: ['الرقة', 'تل أبيض', 'عين عيسى', 'الثورة', 'المسكنة']
  },
  {
    id: 'deir-ez-zor',
    nameAr: 'دير الزور',
    nameEn: 'Deir ez-Zor',
    latitude: 35.3333,
    longitude: 40.1500,
    region: 'east',
    population: 1200000,
    majorCities: ['دير الزور', 'البوكمال', 'الميادين', 'القورية', 'أبو كمال']
  },
  {
    id: 'hasakah',
    nameAr: 'الحسكة',
    nameEn: 'Hasakah',
    latitude: 36.5000,
    longitude: 40.7500,
    region: 'east',
    population: 1500000,
    majorCities: ['الحسكة', 'القامشلي', 'رأس العين', 'مالكية', 'شدادة']
  },
  {
    id: 'quneitra',
    nameAr: 'القنيطرة',
    nameEn: 'Quneitra',
    latitude: 33.1253,
    longitude: 35.8236,
    region: 'south',
    population: 87000,
    majorCities: ['القنيطرة', 'خان أرنبة', 'عين قنية', 'الرفيد', 'عين التينة']
  },
  {
    id: 'daraa',
    nameAr: 'درعا',
    nameEn: 'Daraa',
    latitude: 32.6189,
    longitude: 36.1021,
    region: 'south',
    population: 998000,
    majorCities: ['درعا', 'نوى', 'إزرع', 'طفس', 'الشيخ مسكين']
  },
  {
    id: 'as-suwayda',
    nameAr: 'السويداء',
    nameEn: 'As-Suwayda',
    latitude: 32.7000,
    longitude: 36.5667,
    region: 'south',
    population: 770000,
    majorCities: ['السويداء', 'صلخد', 'شهبا', 'بصرى الشام', 'أم الرمان']
  }
];

export const getGovernorateById = (id: string): SyrianGovernorate | undefined => {
  return SYRIAN_GOVERNORATES.find(gov => gov.id === id);
};

export const getGovernorateByName = (name: string, language: 'ar' | 'en' = 'ar'): SyrianGovernorate | undefined => {
  const searchName = name.trim().toLowerCase();
  return SYRIAN_GOVERNORATES.find(gov => 
    gov.nameAr.toLowerCase().includes(searchName) || 
    gov.nameEn.toLowerCase().includes(searchName)
  );
};

export const getGovernoratesByRegion = (region: SyrianGovernorate['region']): SyrianGovernorate[] => {
  return SYRIAN_GOVERNORATES.filter(gov => gov.region === region);
};

export const getNearestGovernorate = (lat: number, lng: number): SyrianGovernorate => {
  let nearest = SYRIAN_GOVERNORATES[0];
  let minDistance = Infinity;

  SYRIAN_GOVERNORATES.forEach(gov => {
    const distance = Math.sqrt(
      Math.pow(lat - gov.latitude, 2) + Math.pow(lng - gov.longitude, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = gov;
    }
  });

  return nearest;
};

export const getGovernorateDisplayName = (governorate: SyrianGovernorate, language: 'ar' | 'en'): string => {
  return language === 'ar' ? governorate.nameAr : governorate.nameEn;
};

export const getGovernorateSuggestions = (query: string, language: 'ar' | 'en' = 'ar'): SyrianGovernorate[] => {
  if (!query.trim()) return SYRIAN_GOVERNORATES;
  
  const searchQuery = query.trim().toLowerCase();
  return SYRIAN_GOVERNORATES.filter(gov => 
    gov.nameAr.toLowerCase().includes(searchQuery) || 
    gov.nameEn.toLowerCase().includes(searchQuery) ||
    gov.majorCities.some(city => 
      city.toLowerCase().includes(searchQuery)
    )
  );
};
