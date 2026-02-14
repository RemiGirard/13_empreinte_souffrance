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
 * Creates SVG pie chart for cluster visualization
 * Shows the ratio of stores with cage eggs (red) vs cage-free (green)
 */
function createPieChartSVG(size: number, cageCount: number, noCageCount: number): string {
  const total = cageCount + noCageCount;
  if (total === 0) return '';

  const radius = size / 2 - 4; // Leave room for border
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 3;

  // If all one type, return a simple circle
  if (cageCount === 0) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
          fill="${COLORS.noCage}" 
          stroke="${COLORS.noCageStroke}" 
          stroke-width="${strokeWidth}"/>
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
    </svg>
  `;
}

/**
 * Creates a custom cluster icon with pie chart visualization
 *
 * Features:
 * - Pie chart shows ratio of cage vs non-cage stores
 * - Count displayed in center
 * - Size scales with number of markers
 * - Red slice = stores with cage eggs
 * - Green slice = cage-free stores
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

  // Generate SVG pie chart
  const pieChartSVG = createPieChartSVG(size, cageCount, noCageCount);

  // Create the HTML with pie chart background and count overlay
  const html = `
    <div class="custom-cluster-icon" style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
      cursor: pointer;
    ">
      <!-- Pie chart SVG as background -->
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
