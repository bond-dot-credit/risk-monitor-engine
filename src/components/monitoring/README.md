# Monitoring Components

This directory contains production-ready monitoring components for the Risk Monitor Engine.

## Components

### PerformanceMonitor

A comprehensive performance monitoring component that tracks:

- **Memory Usage**: JavaScript heap memory consumption with visual progress bars
- **Page Load Timing**: Navigation timing API metrics including First Paint and First Contentful Paint
- **Resource Loading**: Total resources, size, and load time statistics
- **Real-time Updates**: Configurable update intervals with visibility-based pausing

#### Features

- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Only updates when visible to save resources
- **Customizable**: Show/hide different metric sections
- **Real-time**: Live updates with configurable intervals
- **Visual Indicators**: Color-coded progress bars for memory usage

#### Usage

```tsx
import { PerformanceMonitor } from '@/components/monitoring';

// Basic usage
<PerformanceMonitor />

// Customized usage
<PerformanceMonitor
  showMemory={true}
  showTiming={false}
  showResources={true}
  updateInterval={10000}
  onMetricsUpdate={(metrics) => console.log('Metrics updated:', metrics)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `showMemory` | `boolean` | `true` | Show memory usage section |
| `showTiming` | `boolean` | `true` | Show page load timing section |
| `showResources` | `boolean` | `true` | Show resource loading section |
| `updateInterval` | `number` | `5000` | Update interval in milliseconds |
| `onMetricsUpdate` | `function` | `undefined` | Callback when metrics update |

## Performance Considerations

- **Visibility API**: Automatically pauses updates when tab is not visible
- **Debounced Updates**: Configurable update intervals to prevent excessive DOM updates
- **Memory Efficient**: Minimal state management and cleanup on unmount
- **Browser APIs**: Uses native Performance API for accurate measurements

## Browser Support

- **Modern Browsers**: Full support for Performance API
- **Fallbacks**: Graceful degradation for older browsers
- **Memory API**: Chrome-specific memory metrics with fallbacks

## Integration

These components integrate with:

- **Error Boundary**: For error handling and fallback UI
- **Logging System**: For performance metric logging
- **Configuration**: For environment-specific settings
- **Real-time Updates**: For live dashboard updates

## Future Enhancements

- **Custom Metrics**: User-defined performance indicators
- **Historical Data**: Performance trend analysis
- **Alerts**: Threshold-based performance warnings
- **Export**: Performance data export functionality
- **Integration**: Third-party monitoring service integration
