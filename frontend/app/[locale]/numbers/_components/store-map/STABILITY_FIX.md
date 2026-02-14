# Cluster Stability Fix

## 🐛 Problem

When panning/moving the map (left, right, up, down), the pie chart clusters kept changing:

- Clusters would split and reform
- Pie chart ratios would change
- Very jarring user experience ❌

## 🔍 Root Cause

The issue was caused by **two problems**:

### 1. Using `visibleStores` instead of `filteredStores`

```typescript
// BEFORE (BAD):
{visibleStores.map((s, i) => ...)}
```

- `visibleStores` was recalculated every time the map bounds changed
- When you panned left, markers on the right would disappear from the dataset
- This caused clusters to recalculate with different markers
- Result: Clusters constantly changing

### 2. Default clustering behavior

- MarkerClusterGroup was removing markers outside visible bounds
- This caused cluster recalculation on every pan
- No animation smoothing between states

## ✅ Solution

### 1. Use Full Dataset (`filteredStores`)

```typescript
// AFTER (GOOD):
{filteredStores.map((s, i) => ...)}
```

- `filteredStores` only changes when filters change (cage/no-cage, enseigne)
- Panning the map doesn't change the dataset
- Clusters remain stable across the entire map

### 2. Configure Clustering for Stability

```typescript
<MarkerClusterGroup
  animate={true}                      // ← Smooth transitions
  animateAddingMarkers={false}        // ← No jank on initial load
  removeOutsideVisibleBounds={false}  // ← Keep all markers in calculation
  maxClusterRadius={120}              // ← Higher = more stable clusters
  ...
>
```

### 3. Increased Cluster Radius

Changed from `100` to `120`:

- Larger radius = fewer, larger clusters
- Fewer clusters = more stable groupings
- Less likely to split when panning

## 📊 Results

### Before Fix

```
Pan left  → Clusters recalculate → Pie charts change ❌
Pan right → Clusters recalculate → Pie charts change ❌
Pan up    → Clusters recalculate → Pie charts change ❌
```

### After Fix

```
Pan left  → Clusters stay stable → Same pie charts ✅
Pan right → Clusters stay stable → Same pie charts ✅
Pan up    → Clusters stay stable → Same pie charts ✅
```

### Only Changes When:

- ✅ **Zoom level changes** (expected - clusters split/merge)
- ✅ **Filters change** (expected - different data shown)
- ❌ **NOT when panning** (fixed!)

## 🎯 Technical Details

### Bounds Culling (Old Optimization)

The original code had this optimization:

```typescript
const visibleStores = useMemo(() => {
  const bounds = boundsRef.current;
  if (!bounds) return filteredStores;
  const padded = bounds.pad(0.1);
  return filteredStores.filter((s) => padded.contains(s.coords));
}, [filteredStores, boundsVersion]);
```

**Purpose:** Reduce DOM nodes by only rendering visible markers  
**Problem:** Caused cluster instability when panning  
**Solution:** Let MarkerClusterGroup handle this internally

### Why This Works

MarkerClusterGroup has its own optimizations:

- Uses spatial indexing (R-tree algorithm)
- Efficiently handles thousands of markers
- Only renders visible clusters (not all markers)
- Maintains cluster stability across view changes

With `removeOutsideVisibleBounds={false}`:

- All markers stay in the clustering calculation
- Clusters don't recalculate when panning
- Much better UX

## ⚙️ Configuration

If you still see some instability, you can increase stability further:

### Option 1: Increase Cluster Radius (More Stability)

```typescript
// clusterConfig.ts
export const MAX_CLUSTER_RADIUS = 150; // Very stable, fewer clusters
```

### Option 2: Disable Clustering at Lower Zoom

```typescript
// clusterConfig.ts
export const DISABLE_CLUSTERING_AT_ZOOM = 11; // Show individual markers sooner
```

### Option 3: Adjust Animation

```typescript
// StoreMap.tsx
<MarkerClusterGroup
  animate={false}  // Instant transitions (no animation)
  ...
>
```

## 🧪 Testing

To verify the fix works:

1. **Open map** in browser
2. **Pan left/right** slowly
3. **Observe clusters** - they should NOT change their composition
4. **Zoom in/out** - clusters should smoothly split/merge
5. **Apply filter** - clusters should recalculate (expected)

### Expected Behavior

- ✅ Panning = Clusters stay the same
- ✅ Zooming = Clusters smoothly animate
- ✅ Filtering = Clusters update correctly

## 📝 Summary

**Changed:**

- `visibleStores` → `filteredStores`
- Added stability options to MarkerClusterGroup
- Increased `MAX_CLUSTER_RADIUS` to 120

**Result:**

- ✅ Clusters no longer change when panning
- ✅ Smooth UX
- ✅ Pie charts remain stable
- ✅ Only recalculate when truly needed (zoom/filter changes)

**Files Modified:**

- `StoreMap.tsx` - Changed markers source and clustering options
- `clusterConfig.ts` - Increased radius to 120 for better stability
