/**
 * InvestmentMap Component
 * 
 * Displays a world map with markers showing investment distribution by country
 * Uses Google Maps to visualize investment locations and amounts
 */

import { useRef, useEffect, useState } from 'react';
import { MapView } from '@/components/Map';
import { Loader2 } from 'lucide-react';

interface CountryStat {
  country: string;
  count: number;
  totalAmount: number;
  coordinates?: { lat: number; lng: number };
}

interface InvestmentMapProps {
  countryStats: CountryStat[];
  onCountryClick?: (country: string) => void;
}

// Country coordinates mapping (major investment destinations)
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '英国': { lat: 51.5074, lng: -0.1278 },
  '巴西': { lat: -15.7975, lng: -47.8919 },
  '香港': { lat: 22.3193, lng: 114.1694 },
  '尼日利亚': { lat: 9.0820, lng: 8.6753 },
  '新加坡': { lat: 1.3521, lng: 103.8198 },
  '哈萨克斯坦': { lat: 51.1694, lng: 71.4491 },
  '荷兰': { lat: 52.3702, lng: 4.8952 },
  '越南': { lat: 21.0285, lng: 105.8542 },
  '泰国': { lat: 13.7563, lng: 100.5018 },
  '沙特阿拉伯': { lat: 24.7136, lng: 46.6753 },
  '俄罗斯': { lat: 55.7558, lng: 37.6173 },
  '印度尼西亚': { lat: -6.2088, lng: 106.8456 },
  '乌兹别克斯坦': { lat: 41.2995, lng: 69.2401 },
  '澳大利亚': { lat: -35.2809, lng: 149.1300 },
  '伊拉克': { lat: 33.3128, lng: 44.3615 },
  '韩国': { lat: 37.5665, lng: 126.9780 },
  '开曼群岛': { lat: 19.3133, lng: -81.2546 },
  '德国': { lat: 52.5200, lng: 13.4050 },
  '马里': { lat: 12.6392, lng: -8.0029 },
  '法国': { lat: 48.8566, lng: 2.3522 },
  '埃及': { lat: 30.0444, lng: 31.2357 },
  '突尼斯': { lat: 36.8065, lng: 10.1815 },
  '阿联酋': { lat: 25.2048, lng: 55.2708 },
  '摩洛哥': { lat: 33.9716, lng: -6.8498 },
  '卢森堡': { lat: 49.6116, lng: 6.1319 },
  '智利': { lat: -33.4489, lng: -70.6693 },
  '美国': { lat: 38.9072, lng: -77.0369 },
  '马来西亚': { lat: 3.1390, lng: 101.6869 },
  '丹麦': { lat: 55.6761, lng: 12.5683 },
  '加拿大': { lat: 45.4215, lng: -75.6972 },
  '阿根廷': { lat: -34.6037, lng: -58.3816 },
  '刚果民主共和国': { lat: -4.3217, lng: 15.3125 },
  '刚果（金）': { lat: -4.3217, lng: 15.3125 },
  '秘鲁': { lat: -12.0464, lng: -77.0428 },
  '墨西哥': { lat: 19.4326, lng: -99.1332 },
  '西班牙': { lat: 40.4168, lng: -3.7038 },
  '柬埔寨': { lat: 11.5564, lng: 104.9282 },
  '比利时': { lat: 50.8503, lng: 4.3517 },
  '尼泊尔': { lat: 27.7172, lng: 85.3240 },
  '哥伦比亚': { lat: 4.7110, lng: -74.0721 },
  '坦桑尼亚': { lat: -6.7924, lng: 39.2083 },
  '日本': { lat: 35.6762, lng: 139.6503 },
  '新西兰': { lat: -41.2865, lng: 174.7762 },
  '老挝': { lat: 17.9757, lng: 102.6331 },
  '孟加拉国': { lat: 23.8103, lng: 90.4125 },
  '意大利': { lat: 41.9028, lng: 12.4964 },
  '保加利亚': { lat: 42.6977, lng: 23.3219 },
  '捷克': { lat: 50.0755, lng: 14.4378 },
  '英属维尔京群岛': { lat: 18.4207, lng: -64.6399 },
  '罗马尼亚': { lat: 44.4268, lng: 26.1025 },
  '南非共和国': { lat: -25.7479, lng: 28.2293 },
  '巴基斯坦': { lat: 33.6844, lng: 73.0479 },
  '希腊': { lat: 37.9838, lng: 23.7275 },
  '塞舌尔': { lat: -4.6796, lng: 55.4920 },
  '爱尔兰': { lat: 53.3498, lng: -6.2603 },
  '萨摩亚': { lat: -13.7590, lng: -172.1046 },
  '印度': { lat: 28.6139, lng: 77.2090 },
  '土耳其': { lat: 41.0082, lng: 28.9784 },
  '波兰': { lat: 52.2297, lng: 21.0122 },
  '匈牙利': { lat: 47.4979, lng: 19.0402 },
  '塞尔维亚': { lat: 44.7866, lng: 20.4489 },
  '葡萄牙': { lat: 38.7223, lng: -9.1393 },
};

export function InvestmentMap({ countryStats, onCountryClick }: InvestmentMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Add coordinates to country stats
  const enrichedStats = countryStats.map(stat => ({
    ...stat,
    coordinates: COUNTRY_COORDINATES[stat.country],
  })).filter(stat => stat.coordinates); // Only include countries with known coordinates

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    // Calculate marker sizes based on investment amount
    const maxAmount = Math.max(...enrichedStats.map(s => s.totalAmount));
    const minSize = 20;
    const maxSize = 60;

    // Create markers for each country
    enrichedStats.forEach((stat) => {
      if (!stat.coordinates) return;

      // Calculate marker size based on investment amount
      const sizeRatio = stat.totalAmount / maxAmount;
      const size = minSize + (maxSize - minSize) * sizeRatio;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'investment-marker';
      markerElement.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: oklch(0.623 0.214 259.815 / 0.8);
        border: 3px solid oklch(0.623 0.214 259.815);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.background = 'oklch(0.623 0.214 259.815)';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.background = 'oklch(0.623 0.214 259.815 / 0.8)';
      });

      // Create marker
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: stat.coordinates,
        content: markerElement,
        title: `${stat.country}: ${stat.count} deals`,
      });

      // Add click handler
      marker.addListener('click', () => {
        if (onCountryClick) {
          onCountryClick(stat.country);
        }
      });

      markersRef.current.push(marker);
    });
  }, [enrichedStats, isMapReady, onCountryClick]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapReady(true);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <MapView
        initialCenter={{ lat: 20, lng: 0 }}
        initialZoom={2}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
