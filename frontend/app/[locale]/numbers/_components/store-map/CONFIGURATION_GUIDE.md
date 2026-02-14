# Map Clustering Configuration Guide

## 🎯 Quick Configuration

### To Adjust Clustering Behavior

**Open this file:** `clusterConfig.ts`

```typescript
/**
 * CLUSTERING CONFIGURATION
 */

// 🔧 CHANGE THIS to control how much clustering happens
export const MAX_CLUSTER_RADIUS = 100;
```

### Configuration Options

#### `MAX_CLUSTER_RADIUS`

**What it does:** Controls how aggressively markers are grouped into clusters

**Values:**

- `40-60` = **MORE clusters**, smaller groups (you'll see clusters of 2-4)
- `80-100` = **BALANCED** (recommended - avoids tiny clusters)
- `120-150` = **FEWER clusters**, larger groups (very aggressive clustering)

**Current setting:** `100` (balanced)

**Examples:**

```typescript
// See small clusters of 2-4 markers
export const MAX_CLUSTER_RADIUS = 50;

// Balanced - avoids tiny clusters (RECOMMENDED)
export const MAX_CLUSTER_RADIUS = 100;

// Very aggressive - only large clusters
export const MAX_CLUSTER_RADIUS = 150;
```

---

#### `DISABLE_CLUSTERING_AT_ZOOM`

**What it does:** Sets the zoom level where clustering stops completely

**Values:**

- `10-11` = Disable clustering earlier (show individual markers sooner)
- `12` = **BALANCED** (recommended)
- `13-15` = Keep clustering even when zoomed in closer
- `null` = Never disable clustering (always show clusters when markers are close)

**Current setting:** `12` (balanced)

**Examples:**

```typescript
// Stop clustering earlier when zooming in
export const DISABLE_CLUSTERING_AT_ZOOM = 11;

// Keep clustering longer (RECOMMENDED)
export const DISABLE_CLUSTERING_AT_ZOOM = 12;

// Never stop clustering
export const DISABLE_CLUSTERING_AT_ZOOM = null;
```

---

## 🎨 Pie Chart Visualization

### How It Works

Clusters now display as **pie charts** (camembert graphs) showing the ratio of:

- 🔴 **Red slice** = Stores with cage eggs
- 🟢 **Green slice** = Cage-free stores

### Examples

```
┌─────────────────────────┐
│  [50]  ← 100% cage      │  Full red circle
│   🔴                    │
│                         │
│  [50]  ← 100% cage-free │  Full green circle
│   🟢                    │
│                         │
│  [50]  ← 50/50 mix      │  Half red, half green
│   🔴🟢                  │
│                         │
│  [50]  ← 75% cage       │  3/4 red, 1/4 green
│   🔴🔴🔴🟢              │
└─────────────────────────┘
```

The **number in the center** shows the total count of stores in that cluster.

---

## 📊 Visual Results

### Before Changes (Original)

- Clusters of 2, 3, 4 markers visible ❌
- Solid red or green circles
- `maxClusterRadius = 50`

### After Changes (Current)

- Minimum ~5 markers per cluster ✅
- Pie chart visualization showing ratio
- `maxClusterRadius = 100`

---

## 🔧 Advanced Customization

### Change Cluster Sizes

**Edit:** `clusterIcon.ts` (around line 125)

```typescript
// Current sizing
if (count < 10) {
  size = 50; // 👈 Change icon size
  fontSize = 14; // 👈 Change number size
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
```

### Change Pie Chart Colors

**Edit:** `types.ts`

```typescript
export const COLORS: MapColors = {
  cage: '#ff584b', // 👈 Red for cage eggs
  cageStroke: '#d43d30', // 👈 Dark red border
  noCage: '#22C55E', // 👈 Green for cage-free
  noCageStroke: '#1a9e48', // 👈 Dark green border
};
```

### Disable Pie Charts (Revert to Solid Colors)

If you want to go back to simple solid-color circles:

1. Keep a backup of current `clusterIcon.ts`
2. Restore the old version from git history, or
3. Modify `createPieChartSVG()` to always return a single color

---

## 🎯 Recommended Settings

### For Your Use Case (Avoiding 2-4 Marker Clusters)

```typescript
// clusterConfig.ts
export const MAX_CLUSTER_RADIUS = 100; // Good balance
export const DISABLE_CLUSTERING_AT_ZOOM = 12;
```

### If You Want Even Fewer Small Clusters

```typescript
// clusterConfig.ts
export const MAX_CLUSTER_RADIUS = 120; // More aggressive
export const DISABLE_CLUSTERING_AT_ZOOM = 12;
```

### If You Want More Granular Clustering

```typescript
// clusterConfig.ts
export const MAX_CLUSTER_RADIUS = 70; // Less aggressive
export const DISABLE_CLUSTERING_AT_ZOOM = 11;
```

---

## 🧪 Testing Your Changes

1. **Edit** `clusterConfig.ts`
2. **Save** the file
3. **Reload** the page (dev server auto-reloads)
4. **Zoom in/out** to see the effect
5. **Adjust** values until you like the result

---

## 📸 Visual Reference

### Cluster Appearance by Size

| Marker Count | Icon Size | Appearance            |
| ------------ | --------- | --------------------- |
| 5-9          | 50px      | Small pie chart       |
| 10-49        | 60px      | Medium pie chart      |
| 50-99        | 70px      | Large pie chart       |
| 100+         | 80px      | Extra large pie chart |

### Pie Chart Ratios

| Cage Count | Total | Visual                |
| ---------- | ----- | --------------------- |
| 0          | 10    | 🟢 Full green circle  |
| 3          | 10    | 🔴🟢 ~30% red slice   |
| 5          | 10    | 🔴🟢 50/50 split      |
| 7          | 10    | 🔴🔴🟢 ~70% red slice |
| 10         | 10    | 🔴 Full red circle    |

---

## 📚 Files Reference

**Configuration:**

- `clusterConfig.ts` ← **MAIN CONFIG FILE** (change this!)

**Implementation:**

- `clusterIcon.ts` ← Pie chart rendering logic
- `StoreMap.tsx` ← Uses config values
- `styles.css` ← Visual styling
- `types.ts` ← Color definitions

---

## ❓ Common Questions

**Q: I still see some small clusters. Why?**  
A: Increase `MAX_CLUSTER_RADIUS` to 120-150. Leaflet's algorithm sometimes creates small edge-case clusters.

**Q: Can I disable clustering completely?**  
A: Yes, set `MAX_CLUSTER_RADIUS = 0` or remove the `<MarkerClusterGroup>` wrapper in `StoreMap.tsx`

**Q: The pie charts look pixelated. How to fix?**  
A: They're SVG, so they should be crisp. Check your browser zoom level (should be 100%)

**Q: Can I change the pie chart style (e.g., donut chart)?**  
A: Yes! Edit the `createPieChartSVG()` function in `clusterIcon.ts`. Add an inner circle with white fill for a donut effect.

**Q: Numbers are hard to read on mixed colors. Can I improve this?**  
A: The text has multiple shadow layers for contrast. You can increase the shadow in `clusterIcon.ts` line ~165.

---

## 🎉 Summary

**One file to rule them all:** `clusterConfig.ts`

**Change one number:**

```typescript
export const MAX_CLUSTER_RADIUS = 100; // 👈 Higher = less clustering
```

**That's it!** Your changes will apply immediately in dev mode.
