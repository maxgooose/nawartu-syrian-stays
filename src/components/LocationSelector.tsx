import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import GoogleMap from './GoogleMap';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationSelectorProps {
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  initialLocation?: string;
  initialLat?: number;
  initialLng?: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  initialLocation = '',
  initialLat = 33.5138,
  initialLng = 36.2765
}) => {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState(initialLocation);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const searchService = useRef<google.maps.places.PlacesService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        setError('');
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        if (!data?.apiKey) throw new Error('Google Maps API key not found');
        setApiKey(data.apiKey);
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError(language === 'ar' ? 'فشل في تحميل خدمة الخرائط' : 'Failed to load maps service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [language]);

  useEffect(() => {
    if (!apiKey) return;

    const initPlacesService = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        const map = new google.maps.Map(document.createElement('div'));
        searchService.current = new google.maps.places.PlacesService(map);
        setAutocompleteService(new google.maps.places.AutocompleteService());
        setError('');
      } catch (err) {
        console.error('Failed to initialize Google Maps:', err);
        setError(language === 'ar' ? 'فشل في تهيئة الخرائط' : 'Failed to initialize maps');
      }
    };

    initPlacesService();
  }, [apiKey, language]);

  // Real-time autocomplete as user types
  const handleInputChange = (value: string) => {
    setSearchInput(value);
    
    if (!autocompleteService || !value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const request = {
      input: value,
      componentRestrictions: { country: 'sy' }, // Restrict to Syria
      locationBias: {
        center: { lat: 34.8021, lng: 38.9968 }, // Geographic center of Syria
        radius: 200000, // 200km radius to cover all of Syria
      },
      types: ['establishment', 'geocode', 'locality', 'sublocality'], // Include cities and neighborhoods
    };

    autocompleteService.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        // Convert predictions to PlaceResult format for consistency
        const results = predictions.map(prediction => ({
          place_id: prediction.place_id,
          name: prediction.structured_formatting.main_text,
          formatted_address: prediction.description,
          geometry: undefined, // Will be filled when selected
        }));
        setSearchResults(results as google.maps.places.PlaceResult[]);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    });
  };

  const handleSearch = () => {
    if (!searchService.current || !searchInput.trim()) return;

    const request = {
      query: searchInput,
      locationBias: {
        center: { lat: 33.5138, lng: 36.2765 }, // Damascus
        radius: 50000, // 50km radius
      },
    };

    searchService.current.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results.slice(0, 5)); // Show top 5 results
        setShowResults(true);
      }
    });
  };

  // Function to validate if coordinates are within Syria
  const isLocationInSyria = (lat: number, lng: number): boolean => {
    // Syria's approximate bounding box coordinates
    const SYRIA_BOUNDS = {
      north: 37.32,   // Northern border with Turkey
      south: 32.31,   // Southern border with Jordan
      east: 42.38,    // Eastern border with Iraq
      west: 35.73     // Western border with Mediterranean/Lebanon
    };
    
    return lat >= SYRIA_BOUNDS.south && 
           lat <= SYRIA_BOUNDS.north && 
           lng >= SYRIA_BOUNDS.west && 
           lng <= SYRIA_BOUNDS.east;
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    // If it's from autocomplete, we need to get full details first
    if (place.place_id && !place.geometry && searchService.current) {
      const request = { placeId: place.place_id, fields: ['geometry', 'name', 'formatted_address', 'address_components'] };
      
      searchService.current.getDetails(request, (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails?.geometry?.location) {
          const lat = placeDetails.geometry.location.lat();
          const lng = placeDetails.geometry.location.lng();
          const name = placeDetails.name || placeDetails.formatted_address || '';
          
          // Validate location is in Syria
          if (!isLocationInSyria(lat, lng)) {
            setError(language === 'ar' 
              ? 'يجب أن يكون الموقع داخل سوريا' 
              : 'Location must be within Syria'
            );
            return;
          }
          
          setSelectedLat(lat);
          setSelectedLng(lng);
          setSearchInput(name);
          setShowResults(false);
          setError(''); // Clear any previous errors
          onLocationSelect(name, lat, lng);
        }
      });
    } else if (place.geometry?.location) {
      // Direct selection from search results
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.name || place.formatted_address || '';
      
      // Validate location is in Syria
      if (!isLocationInSyria(lat, lng)) {
        setError(language === 'ar' 
          ? 'يجب أن يكون الموقع داخل سوريا' 
          : 'Location must be within Syria'
        );
        return;
      }
      
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSearchInput(name);
      setShowResults(false);
      setError(''); // Clear any previous errors
      onLocationSelect(name, lat, lng);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    // Validate location is in Syria first
    if (!isLocationInSyria(lat, lng)) {
      setError(language === 'ar' 
        ? 'يجب أن يكون الموقع داخل سوريا' 
        : 'Location must be within Syria'
      );
      return;
    }

    setSelectedLat(lat);
    setSelectedLng(lng);
    setError(''); // Clear any previous errors
    
    // Reverse geocoding to get address
    if (!apiKey) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0].formatted_address;
        setSearchInput(address);
        onLocationSelect(address, lat, lng);
      } else {
        // Fallback if reverse geocoding fails
        const fallbackAddress = language === 'ar' 
          ? `موقع في سوريا (${lat.toFixed(4)}, ${lng.toFixed(4)})` 
          : `Location in Syria (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setSearchInput(fallbackAddress);
        onLocationSelect(fallbackAddress, lat, lng);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location">
          {language === 'ar' ? 'الموقع' : 'Location'}
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="location"
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن الموقع في سوريا...' : 'Search for location in Syria...'}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading || !!error}
          />
          <Button 
            onClick={handleSearch} 
            size="icon" 
            variant="outline"
            disabled={isLoading || !!error}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
        {isLoading && (
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
          {searchResults.map((place, index) => (
            <button
              key={index}
              className="w-full text-left p-3 hover:bg-muted flex items-center gap-2 border-b last:border-b-0"
              onClick={() => handlePlaceSelect(place)}
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-muted-foreground">
                  {place.formatted_address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div>
        <Label>
          {language === 'ar' ? 'أو اختر من الخريطة' : 'Or select from map'}
        </Label>
        <div className="mt-1">
          <GoogleMap
            lat={selectedLat}
            lng={selectedLng}
            zoom={13}
            height="300px"
            markers={[{ lat: selectedLat, lng: selectedLng, title: searchInput }]}
            onLocationSelect={handleMapClick}
            clickable={true}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'ar' ? 'اضغط على الخريطة لتحديد الموقع' : 'Click on the map to select location'}
        </p>
      </div>
    </div>
  );
};

export default LocationSelector;