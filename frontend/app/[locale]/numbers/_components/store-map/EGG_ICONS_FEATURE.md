# Egg Icons in Cluster Display

## ✨ Feature Overview

Clusters now display **small egg icons** embedded within the pie chart to make it even more visual and intuitive:

- 🔴 **Cage egg icon** (red egg with bars) in the red section
- 🟢 **Free egg icon** (green egg with chicken) in the green section

## 🎨 Visual Design

### Full Red Cluster (100% cage eggs)

```
┌─────────────┐
│     🥚      │  ← Cage egg icon with bars
│   [25] 🔴  │     (in bottom right corner)
│             │
└─────────────┘
```

### Full Green Cluster (100% cage-free)

```
┌─────────────┐
│     🐔      │  ← Free egg icon with chicken
│   [25] 🟢  │     (in bottom right corner)
│             │
└─────────────┘
```

### Mixed Cluster (Pie Chart)

```
┌─────────────┐
│  🥚         │  ← Cage egg icon in red section
│    [50]     │
│        🐔   │  ← Free egg icon in green section
│  🔴🟢      │     (pie chart background)
└─────────────┘
```

## 🔧 How It Works

### Icon Placement Logic

1. **100% Single Type:**
   - Icon appears in **bottom right corner**
   - Makes it clear which type dominates
   - Example: All cage eggs = red circle with cage egg icon

2. **Mixed Clusters (Pie Chart):**
   - **Cage egg icon** positioned in the middle of the red section
   - **Free egg icon** positioned in the middle of the green section
   - Icons only show if their section is > 45° (big enough to be visible)

3. **Icon Sizing:**
   - Icons are **20% of cluster size**
   - Scale automatically with cluster size
   - Positioned at **70% radius** from center

### Smart Visibility

Icons are only shown when there's enough space:

```typescript
// Cage icon only if red section > 45°
if (cageAngle > 45) {
  // Show cage egg icon
}

// Free icon only if green section > 45°
if (360 - cageAngle > 45) {
  // Show free egg icon
}
```

**Why?** Small pie slices can't fit an icon without cluttering the display.

## 📊 Examples by Ratio

| Cage % | Free % | Visual Result                                               |
| ------ | ------ | ----------------------------------------------------------- |
| 100%   | 0%     | Full red circle with cage egg icon in corner                |
| 0%     | 100%   | Full green circle with free egg icon in corner              |
| 75%    | 25%    | Large red slice (cage icon) + small green slice (free icon) |
| 50%    | 50%    | Half-half pie with both icons clearly visible               |
| 25%    | 75%    | Small red slice (cage icon) + large green slice (free icon) |
| 10%    | 90%    | Tiny red slice (no icon) + large green (free icon shown)    |

**Note:** Very small sections (<45°) don't show icons to avoid clutter.

## 🎯 User Benefits

### Better Visual Recognition

- **Icons instantly communicate** what the cluster represents
- No need to mentally interpret pie chart colors
- Familiar egg/chicken imagery from the rest of the site

### Consistent Branding

- Uses the same cage/free egg icons as individual markers
- Maintains visual consistency across zoom levels
- Professional, polished appearance

### Quick Scanning

- Users can spot cage egg clusters at a glance
- Icons provide redundant encoding (color + shape)
- Better accessibility for color-blind users

## 🔧 Customization

### Change Icon Size

Edit `clusterIcon.ts` line ~55:

```typescript
const iconSize = size * 0.2; // Currently 20% of cluster size

// Make icons bigger:
const iconSize = size * 0.25; // 25% of cluster size

// Make icons smaller:
const iconSize = size * 0.15; // 15% of cluster size
```

### Change Icon Position (Single-Type Clusters)

Edit `clusterIcon.ts` in the single-type circle sections:

```typescript
// Currently bottom-right:
<g transform="translate(${size - iconSize - 2}, ${size - iconSize - 2})">

// Bottom-left:
<g transform="translate(2, ${size - iconSize - 2})">

// Top-right:
<g transform="translate(${size - iconSize - 2}, 2)">

// Center:
<g transform="translate(${size/2 - iconSize/2}, ${size/2 - iconSize/2})">
```

### Change Icon Opacity

Edit `clusterIcon.ts` in the pie chart section:

```typescript
// Currently 80% opacity:
<g transform="..." opacity="0.8">

// More subtle (60%):
<g transform="..." opacity="0.6">

// Fully opaque:
<g transform="..." opacity="1">
```

### Change Minimum Angle for Icons

Edit `clusterIcon.ts` around line ~145:

```typescript
// Currently 45°:
if (cageAngle > 45) {

// More permissive (show even in small sections):
if (cageAngle > 30) {

// More restrictive (only very large sections):
if (cageAngle > 60) {
```

## 🎨 Icon Source

### Cage Egg Icon (Simplified)

- Base: Red egg shape
- Added: Horizontal bars (representing cage bars)
- Color: `#FF584B` (matches `COLORS.cage`)

### Free Egg Icon (Simplified)

- Base: Green egg shape
- Added: Simple face (representing happy chicken)
- Color: `#22C55E` (matches `COLORS.noCage`)

**Note:** These are simplified inline SVGs for performance. The full detailed versions are used for individual markers.

## 📈 Performance

### Impact

- **Negligible** - Icons are inline SVG strings
- No additional HTTP requests
- Rendered once per cluster
- Total added code: ~30 lines of SVG

### Optimization

- Icons are embedded directly in the cluster SVG
- No external image loading
- Scales perfectly at any size (vector graphics)

## 🧪 Testing

### Visual Checks

1. **100% Cage clusters** → Red circle with cage egg icon ✓
2. **100% Free clusters** → Green circle with free egg icon ✓
3. **50/50 mixed** → Both icons visible in their sections ✓
4. **Small slice** → Icon hidden when slice < 45° ✓
5. **Hover effect** → Icons scale smoothly with cluster ✓

### Browser Compatibility

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 💡 Future Enhancements

Potential improvements:

1. **Animated Icons**
   - Subtle pulse or bounce on hover
   - Draws attention to clusters

2. **Different Icon Styles**
   - Use detailed versions for large clusters
   - Simplified versions for small clusters

3. **Icon Count**
   - Show multiple icons for very large clusters
   - Example: 3 cage eggs + 2 free eggs

4. **Tooltip on Hover**
   - "15 with cage eggs, 10 cage-free"
   - Show exact breakdown

## 📝 Summary

**What Changed:**

- Added small egg icons to cluster displays
- Cage egg icon (red with bars) for cage eggs
- Free egg icon (green with chicken) for cage-free
- Smart positioning based on pie chart sections

**Benefits:**

- ✅ More visual and intuitive
- ✅ Instantly recognizable
- ✅ Consistent with individual markers
- ✅ Better for quick scanning

**Performance:**

- ✅ No impact (inline SVG)
- ✅ Scales perfectly
- ✅ No external resources

**Customizable:**

- Icon size (currently 20% of cluster)
- Icon position
- Visibility threshold (currently 45°)
- Opacity (currently 80%)

Enjoy the enhanced visual feedback! 🎉
