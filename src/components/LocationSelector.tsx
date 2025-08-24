import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import GoogleMap from './GoogleMap';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

interface LocationSelectorProps {
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  initialLocation?: string;
  initialLat?: number;
  initialLng?: number;
  language?: 'ar' | 'en';
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  initialLocation = '',
  initialLat = 33.5138,
  initialLng = 36.2765,
  language = 'ar'
}) => {
  const [searchInput, setSearchInput] = useState(initialLocation);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const searchService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        setApiKey(data.apiKey);
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const initPlacesService = async () => {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();
      
      const map = new google.maps.Map(document.createElement('div'));
      searchService.current = new google.maps.places.PlacesService(map);
    };

    initPlacesService();
  }, [apiKey]);

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

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.name || place.formatted_address || '';
      
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSearchInput(name);
      setShowResults(false);
      onLocationSelect(name, lat, lng);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    
    // Reverse geocoding to get address
    if (!apiKey) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0].formatted_address;
        setSearchInput(address);
        onLocationSelect(address, lat, lng);
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
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن الموقع...' : 'Search for location...'}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
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