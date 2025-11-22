# Icon Requirements for easyMoney PWA

If you'd like to replace the auto-generated icons with custom designs, here's what you need:

## Icon Specifications

### Standard Icons (8 files)
These icons are used across different contexts and devices:

1. **icon-72.png** - 72x72 pixels
2. **icon-96.png** - 96x96 pixels
3. **icon-128.png** - 128x128 pixels
4. **icon-144.png** - 144x144 pixels
5. **icon-152.png** - 152x152 pixels
6. **icon-192.png** - 192x192 pixels (most commonly used)
7. **icon-384.png** - 384x384 pixels
8. **icon-512.png** - 512x512 pixels (high resolution displays)

### Maskable Icons (2 files)
These are special icons for Android adaptive icons with safe zone padding:

9. **icon-maskable-192.png** - 192x192 pixels
10. **icon-maskable-512.png** - 512x512 pixels

## Design Guidelines

### Standard Icons
- **Format**: PNG with transparency
- **Content**: Your logo/icon should fill most of the canvas
- **Background**: Can be transparent or solid color
- **Theme**: Finance/budget related (dollar signs, coins, charts, etc.)

### Maskable Icons
- **Format**: PNG (no transparency recommended)
- **Safe Zone**: Keep important content within the center 80% of the canvas
- **Background**: Should be solid color (the outer 20% may be cropped on some devices)
- **Purpose**: Android will apply various shapes (circle, rounded square, etc.) to these icons

## Where to Place Icons

Drop all 10 PNG files into this directory:
```
/home/smandrews/easyMoney/web/public/icons/
```

Replace the existing files with the same names.

## Current Icons

The current icons are auto-generated with:
- Green background (#10b981)
- White dollar sign symbol
- Simple, functional design

These work perfectly fine for testing and development, but you may want professional icons for production.

## Quick Tips

1. **Start with one large icon** (e.g., 1024x1024) and scale down
2. **Use online tools** like:
   - [Maskable.app](https://maskable.app/) - Preview maskable icons
   - [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Auto-generate all sizes
3. **Test on device** after replacing to ensure they look good
4. **No rebuild needed** - Just replace the files and refresh

## Example Icon Themes

For a budget app, consider:
- 💰 Dollar sign or currency symbols
- 📊 Bar chart or pie chart
- 💳 Wallet or credit card
- 🏦 Piggy bank
- 📈 Growth/trending up arrow
- ✅ Checkmark with money theme

Choose colors that match your brand or the app's theme (currently using green for money/finance).
