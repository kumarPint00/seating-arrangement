# Event Seating Frontend

An interactive, high-performance React + TypeScript seating map application with accessibility features and mobile optimization.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The application will start on `http://localhost:3002`

## ✨ Features

### Interactive Seating Map
- **SVG-based rendering** for crisp visuals at any zoom level
- **~15,000 seats** rendered smoothly at 60fps
- **Real-time seat selection** with visual feedback
- **Dynamic pricing** with color-coded sections (Premium, Standard, Economy)

### User Experience
- **Maximum 8 seat selection** with clear visual indicators
- **Live pricing summary** with tax calculation
- **Persistent selections** via localStorage (survives page reload)
- **Responsive design** optimized for desktop and mobile

### Accessibility (WCAG 2.1 AA Compliant)
- **Keyboard navigation** - Full app usable with Tab/Enter/Space
- **Screen reader support** - Comprehensive ARIA labels and descriptions
- **Focus management** - Clear focus outlines and logical tab order
- **Semantic HTML** - Proper roles and landmarks

### Mobile Optimizations
- **Pinch-to-zoom** and pan gestures for detailed seat view
- **Touch-friendly** seat selection with appropriate touch targets
- **Responsive layout** that adapts to different screen sizes
- **Performance optimized** for mobile devices

## 🎯 Core Functionality

### Seat Selection
```typescript
// Maximum 8 seats with real-time validation
const handleSeatClick = (seat: Seat) => {
  if (selectedSeats.length >= 8) {
    alert('Maximum 8 seats can be selected');
    return;
  }
  // Add to selection...
};
```

### Pricing Tiers
- **Premium**: $150 (Front sections, VIP boxes)
- **Standard**: $85 (Middle sections) 
- **Economy**: $45 (Back sections)
- **Tax**: 8% automatically calculated

### Venue Layout
- **Main Arena**: 1200x800 viewport
- **3 Price Sections**: Color-coded for easy identification
- **VIP Boxes**: Special premium seating on sides
- **Stage Area**: Visual reference point

## 🏗 Architecture

### Enhanced Component Structure
```
src/
├── components/
│   ├── SeatingMap.tsx          # Main map container
│   ├── Seat.tsx                # Individual seat component  
│   ├── SelectionSummary.tsx    # Pricing and selection display
│   └── ZoomControls.tsx        # Mobile zoom interface
├── store/
│   └── seatingStore.ts         # Zustand state management
├── hooks/
│   └── usePanZoom.ts          # Mobile pan/zoom logic
├── utils/
│   └── seatingGenerator.ts    # Seat layout generation
└── types/
    └── index.ts               # TypeScript definitions
```

### State Management Strategy
- **Zustand Store**: Lightweight, performant state management
- **localStorage Sync**: Automatic persistence with subscribeWithSelector middleware
- **TypeScript Strict Mode**: Maximum type safety with enhanced checks
- **Computed Values**: Reactive pricing and selection summaries

### Performance Optimizations
- **SVG circles** for seats (most efficient for large quantities)
- **Memoized components** prevent unnecessary re-renders
- **Efficient event handling** with event delegation
- **Optimized transforms** for smooth zoom/pan

## 📱 Mobile Features

### Pan & Zoom
The `usePanZoom` hook provides:
- **Pinch-to-zoom**: 0.5x to 3x zoom range
- **Pan gesture**: Smooth scrolling around the venue
- **Mouse wheel**: Desktop zoom support
- **Reset controls**: Quick return to default view

### Touch Interactions
- **Touch targets**: Minimum 44px for accessibility
- **Visual feedback**: Immediate response to touch
- **Gesture recognition**: Distinguishes between tap, pan, and zoom

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab order**: Logical flow through seats and controls
- **Enter/Space**: Activate seat selection
- **Escape**: Clear selection or exit zoom mode

### Screen Reader Support
Every seat includes comprehensive labeling:
```typescript
aria-label={`Seat ${seat.row}${seat.number} in ${seat.section}, $${seat.price}, ${seat.status}`}
```

## Available Scripts

### `npm start` or `npm run dev`
Runs the app in development mode on http://localhost:3002

### `npm run build`
Builds the app for production to the `build` folder with optimizations

### `npm test`
Launches the test runner in interactive watch mode

## 🚀 Production Deployment

### Build Optimization
```bash
npm run build
```

### Deployment Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Automated builds with branch previews  
- **GitHub Pages**: Free hosting for public repos

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
REACT_APP_API_URL=http://localhost:3001
```

## 📈 Future Enhancements

### Planned Features
- [ ] **WebSocket integration** for real-time seat updates
- [ ] **Heat map visualization** showing demand by price tier
- [ ] **Adjacent seat finder** - automatically suggest nearby seats
- [ ] **Dark mode** toggle with system preference detection

### Technical Improvements
- [ ] **E2E testing** with Playwright/Cypress
- [ ] **Storybook** component documentation
- [ ] **Performance monitoring** with Core Web Vitals

## 🤔 Key Design Decisions

### SVG vs Canvas
**Chosen**: SVG for perfect scalability and accessibility

### State Management  
**Chosen**: Zustand with localStorage sync for persistent, performant state

### Mobile Strategy
**Chosen**: Responsive web app with progressive enhancement

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, TypeScript, and modern web standards**

### TypeScript Configuration
Strict mode enabled with enhanced type checking:
- `exactOptionalPropertyTypes` - Prevents undefined assignments to optional properties
- `noImplicitReturns` - Ensures all code paths return values  
- `noUncheckedIndexedAccess` - Safe array/object access operations
- `noImplicitOverride` - Explicit method override declarations

## 📋 Code Quality
- **ESLint**: TypeScript recommended rules + React hooks + accessibility
- **Prettier**: Consistent code formatting
- **Strict TypeScript**: Maximum type safety configuration
