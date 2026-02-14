import { divIcon, Point, type Marker } from 'leaflet';
import type { Store } from './types';
import { COLORS } from './types';

/**
 * Interface for MarkerCluster (from leaflet.markercluster)
 * We define it here to avoid import issues
 */
interface MarkerCluster {
  getAllChildMarkers(): Marker[];
  getChildCount(): number;
}

/**
 * Simplified cage egg icon (red egg with bars)
 */
const CAGE_EGG_ICON = `
<svg viewBox="60 56 103 129" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M109.555 64.4268C130.032 64.4268 153.961 97.5763 153.961 132.526C153.961 167.476 127.502 176.307 109.555 176.307C93.4277 176.307 66.9688 161.714 66.9688 132.526C66.9688 108.931 85.2711 64.4268 109.555 64.4268Z" fill="#FF584B"/>
  <rect x="70" y="90" width="80" height="6" fill="#333" opacity="0.3"/>
  <rect x="70" y="105" width="80" height="6" fill="#333" opacity="0.3"/>
  <rect x="70" y="120" width="80" height="6" fill="#333" opacity="0.3"/>
  <rect x="70" y="135" width="80" height="6" fill="#333" opacity="0.3"/>
  <rect x="70" y="150" width="80" height="6" fill="#333" opacity="0.3"/>
</svg>
`;

/**
 * Simplified free egg icon (green egg with chicken)
 */
const FREE_EGG_ICON = `
<svg viewBox="60 56 103 129" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M110.662 63.7346C131.3 63.7346 155.417 97.2934 155.417 132.675C155.417 168.056 128.75 176.997 110.662 176.997C94.4076 176.997 67.7402 162.223 67.7402 132.675C67.7402 108.788 86.1867 63.7346 110.662 63.7346Z" fill="#22C55E"/>
  <circle cx="95" cy="110" r="3" fill="#333"/>
  <path d="M85 125 Q95 120, 105 125" stroke="#333" stroke-width="2" fill="none"/>
</svg>
`;

/**
 * Creates SVG pie chart for cluster visualization with embedded egg icons
 * Shows the ratio of stores with cage eggs (red) vs cage-free (green)
 */
function createPieChartSVG(size: number, cageCount: number, noCageCount: number): string {
  const total = cageCount + noCageCount;
  if (total === 0) return '';

  const radius = size / 2 - 4; // Leave room for border
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 3;
  const iconSize = size * 0.2; // Icon size is 20% of cluster size

  // If all one type, return a simple circle with icon
  if (cageCount === 0) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
          fill="${COLORS.noCage}" 
          stroke="${COLORS.noCageStroke}" 
          stroke-width="${strokeWidth}"/>
        
        <!-- Free egg icon in bottom right -->
        <g transform="translate(${size - iconSize - 2}, ${size - iconSize - 2}) scale(${iconSize / 120})">
          ${FREE_EGG_ICON}
        </g>
      </svg>
    `;
  }

  if (noCageCount === 0) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
          fill="${COLORS.cage}" 
          stroke="${COLORS.cageStroke}" 
          stroke-width="${strokeWidth}"/>
        
        <!-- Cage egg icon in bottom right -->
        <g transform="translate(${size - iconSize - 2}, ${size - iconSize - 2}) scale(${iconSize / 120})">
          ${CAGE_EGG_ICON}
        </g>
      </svg>
    `;
  }

  // Calculate pie chart - cage eggs as a slice
  const cagePercentage = cageCount / total;
  const cageAngle = cagePercentage * 360;

  // Start from top (12 o'clock) and go clockwise
  const startAngle = -90;
  const endAngle = startAngle + cageAngle;

  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate arc endpoints
  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArcFlag = cageAngle > 180 ? 1 : 0;

  // Determine border color based on which is dominant
  const borderColor = cageCount > noCageCount ? COLORS.cageStroke : COLORS.noCageStroke;

  // Position icons on opposite sides of the pie chart
  // Cage icon in the red section, free icon in the green section
  const cageIconAngle = startAngle + cageAngle / 2; // Middle of cage section
  const freeIconAngle = endAngle + (360 - cageAngle) / 2; // Middle of free section

  const iconRadius = radius * 0.7; // Place icons 70% from center
  const cageIconX = centerX + iconRadius * Math.cos((cageIconAngle * Math.PI) / 180) - iconSize / 2;
  const cageIconY = centerY + iconRadius * Math.sin((cageIconAngle * Math.PI) / 180) - iconSize / 2;
  const freeIconX = centerX + iconRadius * Math.cos((freeIconAngle * Math.PI) / 180) - iconSize / 2;
  const freeIconY = centerY + iconRadius * Math.sin((freeIconAngle * Math.PI) / 180) - iconSize / 2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle (green/cage-free portion) -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
        fill="${COLORS.noCage}" 
        stroke="none"/>
      
      <!-- Pie slice (red/cage portion) -->
      <path d="M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z"
        fill="${COLORS.cage}" 
        stroke="none"/>
      
      <!-- Border circle -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
        fill="none" 
        stroke="${borderColor}" 
        stroke-width="${strokeWidth}"/>
      
      <!-- Egg icons positioned in their respective sections -->
      ${
        cageAngle > 45
          ? `
      <!-- Cage egg icon in red section (only if section is big enough) -->
      <g transform="translate(${cageIconX}, ${cageIconY}) scale(${iconSize / 120})" opacity="0.8">
        ${CAGE_EGG_ICON}
      </g>
      `
          : ''
      }
      ${
        360 - cageAngle > 45
          ? `
      <!-- Free egg icon in green section (only if section is big enough) -->
      <g transform="translate(${freeIconX}, ${freeIconY}) scale(${iconSize / 120})" opacity="0.8">
        ${FREE_EGG_ICON}
      </g>
      `
          : ''
      }
    </svg>
  `;
}

/**
 * Creates a custom cluster icon with pie chart visualization and egg icons
 *
 * Features:
 * - Pie chart shows ratio of cage vs non-cage stores
 * - Small egg icons embedded in the pie chart sections
 * - Count displayed in center
 * - Size scales with number of markers
 * - Red slice = stores with cage eggs (with cage egg icon)
 * - Green slice = cage-free stores (with free egg icon)
 */
export function createClusterCustomIcon(cluster: MarkerCluster) {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  // Count stores by type
  let cageCount = 0;
  let noCageCount = 0;

  markers.forEach((marker: Marker) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = (marker.options as any)?.store as Store | undefined;
    if (store?.hasCageEggs === true) {
      cageCount++;
    } else {
      noCageCount++;
    }
  });

  // Calculate size based on cluster count
  let size: number;
  let fontSize: number;

  if (count < 10) {
    size = 50;
    fontSize = 14;
  } else if (count < 50) {
    size = 60;
    fontSize = 16;
  } else if (count < 100) {
    size = 70;
    fontSize = 18;
  } else {
    size = 80;
    fontSize = 20;
  }

  // Generate SVG pie chart with egg icons
  const pieChartSVG = createPieChartSVG(size, cageCount, noCageCount);

  // Create the HTML with pie chart background and count overlay
  const html = `
    <div class="custom-cluster-icon" style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
      cursor: pointer;
    ">
      <!-- Pie chart SVG with embedded egg icons -->
      <div style="
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      ">
        ${pieChartSVG}
      </div>
      
      <!-- Count overlay -->
      <div style="
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize}px;
        text-shadow: 
          0 0 3px rgba(0,0,0,0.8),
          0 0 5px rgba(0,0,0,0.6),
          1px 1px 2px rgba(0,0,0,0.9);
        pointer-events: none;
      ">
        ${count}
      </div>
    </div>
  `;

  return divIcon({
    html,
    className: 'custom-cluster-wrapper',
    iconSize: new Point(size, size),
    iconAnchor: new Point(size / 2, size / 2),
  });
}
