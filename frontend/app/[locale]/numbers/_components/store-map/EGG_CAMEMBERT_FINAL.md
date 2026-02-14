# Egg-Shaped Camembert Clusters - Final Design

## 🎨 The Elegant Solution

**Concept:** Superpose both egg logos and mask the top one to create an egg-shaped camembert!

### Simple 3-Layer Approach

1. **Bottom Layer:** Free egg logo (green, full)
2. **Top Layer:** Cage egg logo (red, masked with pie slice)
3. **Overlay:** Count number with strong shadow

**Result:** Egg-shaped camembert where both logos are visible in their correct proportions!

---

## 🥚 Visual Examples

### 100% Cage Eggs

```
     [25]
  Full cage egg    ← Red egg with bars
  logo visible        Natural egg shape
```

### 100% Cage-Free

```
     [25]
  Full free egg    ← Green egg with chicken
  logo visible        Natural egg shape
```

### 60% Cage, 40% Free (Mixed)

```
     [50]
  ┌─────────────┐
  │ 🥚60%       │  ← Cage egg logo visible in top 60%
  │    [50]     │     (masked with pie slice)
  │      🐔40%  │  ← Free egg logo shows through in bottom 40%
  └─────────────┘
```

The cage egg logo is **masked** to only show in a pie-slice proportion.
The free egg logo **shows through** where the cage egg is masked out.

---

## 💡 How It Works

### Code Structure

```typescript
// Background: Full free egg logo (always visible)
<g transform="...">
  ${FREE_EGG_ICON}
</g>

// Foreground: Cage egg logo with mask
<g mask="url(#cage-mask)">
  <g transform="...">
    ${CAGE_EGG_ICON}
  </g>
</g>
```

### The Mask

```svg
<mask id="cage-mask">
  <!-- Pie slice path (white = visible) -->
  <path d="M centerX,centerY L x1,y1 A radius,radius ... Z" fill="white"/>
</mask>
```

- **White in mask** = Cage egg logo visible
- **Black in mask** = Free egg logo shows through

### Proportions

```
cagePercentage = cageCount / total
cageAngle = cagePercentage * 360°

Example:
- 15 cage, 10 free → 60% → 216° pie slice
- 10 cage, 15 free → 40% → 144° pie slice
- 5 cage, 5 free → 50% → 180° pie slice
```

---

## ✨ Advantages

### 1. **Natural Egg Shape**

- Not forced into a circle
- Keeps the organic egg silhouette
- Recognizable brand shape

### 2. **Both Logos Visible**

- Cage egg detail visible in its portion
- Free egg detail visible in its portion
- Full artwork quality maintained

### 3. **Simple Implementation**

- Just 2 logo placements + 1 mask
- No complex clipping calculations
- Easy to understand and maintain

### 4. **Perfect Proportions**

- Mask angle directly = data ratio
- Visual proportion = actual data
- No interpretation needed

---

## 🎯 User Experience

**What users see:**

1. Egg-shaped cluster icon
2. Two logos superposed
3. Pie-slice mask showing proportion
4. Count number overlaid

**What they understand:**

- "This is an egg cluster" (shape recognition)
- "Mix of cage and free" (two logos visible)
- "Mostly cage" or "Mostly free" (proportion visible)
- "50 stores in this area" (count visible)

---

## 🔧 Technical Details

### Size Scaling

```typescript
const logoScale = size / 129; // 129 = original logo height
```

- 50px cluster → 50/129 ≈ 0.39 scale
- 60px cluster → 60/129 ≈ 0.47 scale
- 70px cluster → 70/129 ≈ 0.54 scale
- 80px cluster → 80/129 ≈ 0.62 scale

### Centering

```typescript
const logoWidth = 103 * logoScale;
const logoHeight = 129 * logoScale;
const offsetX = (size - logoWidth) / 2;
const offsetY = (size - logoHeight) / 2;
```

Ensures egg logo is centered in the cluster icon.

### Mask Path

```typescript
// Pie slice from top (12 o'clock) going clockwise
const startAngle = -90;
const endAngle = startAngle + cageAngle;

// Convert to path coordinates
const x1 = centerX + radius * Math.cos(startRad);
const y1 = centerY + radius * Math.sin(startRad);
// ...

// Create pie slice path
`M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
```

---

## 🎨 Customization

### Change Mask Start Position

Currently starts at top (12 o'clock):

```typescript
const startAngle = -90; // Top
```

Start from right (3 o'clock):

```typescript
const startAngle = 0;
```

Start from bottom (6 o'clock):

```typescript
const startAngle = 90;
```

### Change Logo Scale

Currently fits logo to cluster size:

```typescript
const logoScale = size / 129;
```

Make logos bigger (overflow):

```typescript
const logoScale = (size * 1.1) / 129; // 10% bigger
```

Make logos smaller (more padding):

```typescript
const logoScale = (size * 0.9) / 129; // 10% smaller
```

### Swap Logo Layers

To put cage egg on bottom and free egg on top:

```typescript
// Bottom: Cage egg (full)
<g transform="...">
  ${CAGE_EGG_ICON}
</g>

// Top: Free egg (masked)
<g mask="url(#free-mask)">
  <g transform="...">
    ${FREE_EGG_ICON}
  </g>
</g>
```

Then adjust mask to show free egg percentage instead.

---

## 📊 Performance

- **Layers:** Only 2 (both logos always rendered)
- **Mask:** Hardware accelerated
- **Overhead:** Minimal (~same as single SVG)
- **Scalability:** Perfect (vector graphics)

---

## 🎉 Summary

**The Perfect Solution:**

- ✅ Egg-shaped (natural brand shape)
- ✅ Both logos visible (full detail)
- ✅ Accurate proportions (masked slice)
- ✅ Simple code (2 logos + 1 mask)
- ✅ Elegant result (professional appearance)

**How it works:**

1. Place free egg logo (full)
2. Place cage egg logo over it
3. Mask cage egg with pie slice
4. Result: Egg camembert!

**Perfect branding, perfect data visualization!** 🥚✨
