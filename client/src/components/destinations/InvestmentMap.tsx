/**
 * InvestmentMap Component
 * 
 * Displays a world map with investment distribution visualization
 * Uses a static world map image with overlay data visualization
 */

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/api';

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

// Country pixel coordinates mapping on the world map image (approximate positions)
// These are relative positions on the 1400x800 world map image
const COUNTRY_PIXEL_COORDINATES: Record<string, { x: number; y: number }> = {
  '英国': { x: 520, y: 200 },
  '巴西': { x: 350, y: 450 },
  '香港': { x: 1050, y: 350 },
  '尼日利亚': { x: 550, y: 380 },
  '新加坡': { x: 1080, y: 420 },
  '哈萨克斯坦': { x: 850, y: 220 },
  '荷兰': { x: 530, y: 180 },
  '越南': { x: 1020, y: 360 },
  '泰国': { x: 1000, y: 380 },
  '沙特阿拉伯': { x: 700, y: 320 },
  '俄罗斯': { x: 800, y: 150 },
  '印度尼西亚': { x: 1050, y: 420 },
  '乌兹别克斯坦': { x: 800, y: 260 },
  '澳大利亚': { x: 1150, y: 550 },
  '伊拉克': { x: 720, y: 280 },
  '韩国': { x: 1080, y: 280 },
  '开曼群岛': { x: 280, y: 350 },
  '德国': { x: 550, y: 190 },
  '马里': { x: 480, y: 360 },
  '法国': { x: 540, y: 200 },
  '埃及': { x: 600, y: 320 },
  '突尼斯': { x: 560, y: 300 },
  '阿联酋': { x: 740, y: 330 },
  '摩洛哥': { x: 450, y: 280 },
  '卢森堡': { x: 540, y: 190 },
  '智利': { x: 320, y: 550 },
  '美国': { x: 200, y: 250 },
  '马来西亚': { x: 1030, y: 400 },
  '丹麦': { x: 540, y: 160 },
  '加拿大': { x: 150, y: 180 },
  '阿根廷': { x: 350, y: 550 },
  '刚果民主共和国': { x: 600, y: 420 },
  '刚果（金）': { x: 600, y: 420 },
  '秘鲁': { x: 300, y: 450 },
  '墨西哥': { x: 180, y: 320 },
  '西班牙': { x: 500, y: 220 },
  '柬埔寨': { x: 1000, y: 380 },
  '比利时': { x: 540, y: 190 },
  '尼泊尔': { x: 920, y: 300 },
  '哥伦比亚': { x: 280, y: 400 },
  '坦桑尼亚': { x: 620, y: 450 },
  '日本': { x: 1150, y: 280 },
  '新西兰': { x: 1250, y: 600 },
  '老挝': { x: 1000, y: 360 },
  '孟加拉国': { x: 950, y: 330 },
  '意大利': { x: 560, y: 240 },
  '保加利亚': { x: 600, y: 220 },
  '捷克': { x: 570, y: 200 },
  '英属维尔京群岛': { x: 310, y: 340 },
  '罗马尼亚': { x: 600, y: 210 },
  '南非共和国': { x: 600, y: 520 },
  '巴基斯坦': { x: 850, y: 310 },
  '希腊': { x: 600, y: 250 },
  '塞舌尔': { x: 700, y: 480 },
  '爱尔兰': { x: 480, y: 180 },
  '萨摩亚': { x: 1300, y: 480 },
  '印度': { x: 900, y: 360 },
  '土耳其': { x: 650, y: 240 },
  '波兰': { x: 580, y: 180 },
  '匈牙利': { x: 590, y: 200 },
  '塞尔维亚': { x: 590, y: 220 },
  '葡萄牙': { x: 450, y: 240 },
};

export function InvestmentMap({ countryStats, onCountryClick }: InvestmentMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter countries with known coordinates
  const enrichedStats = useMemo(() => {
    return countryStats
      .map(stat => ({
        ...stat,
        pixelCoords: COUNTRY_PIXEL_COORDINATES[stat.country],
      }))
      .filter(stat => stat.pixelCoords);
  }, [countryStats]);

  // Calculate marker sizes based on investment amount
  const maxAmount = useMemo(() => {
    return Math.max(...enrichedStats.map(s => s.totalAmount), 1);
  }, [enrichedStats]);

  const minSize = 20;
  const maxSize = 60;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border bg-muted">
      {/* World Map Image */}
      <img
        src="/world-map.jpg"
        alt="World Map"
        className="w-full h-full object-cover"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Investment Markers Overlay */}
      {imageLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          {enrichedStats.map((stat) => {
            if (!stat.pixelCoords) return null;

            const sizeRatio = stat.totalAmount / maxAmount;
            const size = minSize + (maxSize - minSize) * sizeRatio;
            const isHovered = hoveredCountry === stat.country;

            return (
              <div
                key={stat.country}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{
                  left: `${(stat.pixelCoords.x / 1400) * 100}%`,
                  top: `${(stat.pixelCoords.y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredCountry(stat.country)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => onCountryClick?.(stat.country)}
              >
                {/* Marker Circle */}
                <div
                  className={`absolute transition-all duration-200 rounded-full border-2 border-primary ${
                    isHovered ? 'scale-125' : 'scale-100'
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${-size / 2}px`,
                    top: `${-size / 2}px`,
                    backgroundColor: isHovered
                      ? 'oklch(0.623 0.214 259.815)'
                      : 'oklch(0.623 0.214 259.815 / 0.8)',
                    boxShadow: isHovered
                      ? '0 4px 12px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-popover text-popover-foreground px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap border border-border shadow-lg z-20">
                    <div className="font-semibold">{stat.country}</div>
                    <div className="text-xs">{stat.count} deals</div>
                    <div className="text-xs">{formatCurrency(stat.totalAmount, true)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
