# UI Components Library

A comprehensive collection of reusable UI components built with React, TypeScript, and Tailwind CSS, following modern design principles and best practices.

## 🎨 Design Philosophy

### Principles
- **Consistency**: Unified design language across all components
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized rendering with React.memo and proper prop handling
- **Flexibility**: Highly customizable through variants and className props
- **Type Safety**: Full TypeScript support with proper prop interfaces

### Design System
- **Color Palette**: Semantic colors for different states and variants
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px grid system for consistent layouts
- **Shadows**: Subtle elevation system for depth
- **Transitions**: Smooth animations for better user experience

## 🧩 Component Library

### Core Components

#### Button
Versatile button component with multiple variants, sizes, and states.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" loading={isLoading}>
  Submit
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes**: `sm`, `default`, `lg`, `icon`
**Features**: Loading states, icons, disabled states

#### Card
Flexible container component for content organization.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

**Variants**: `default`, `outlined`, `elevated`
**Padding**: `none`, `sm`, `md`, `lg`
**Sub-components**: Header, Title, Description, Content, Footer

#### Badge
Compact component for displaying status, labels, and categories.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="lg">
  Active
</Badge>
```

**Variants**: 
- Status: `active`, `inactive`, `suspended`, `pending`
- Risk: `low`, `medium`, `high`, `critical`
- Credibility: `bronze`, `silver`, `gold`, `platinum`, `diamond`
- General: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`

#### Progress
Linear and circular progress indicators with multiple variants.

```tsx
import { Progress, CircularProgress } from '@/components/ui';

<Progress value={75} variant="success" showLabel />
<CircularProgress value={60} size="lg" showLabel />
```

**Features**: 
- Auto-color coding based on percentage
- Multiple sizes and variants
- Label positioning options
- Smooth animations

## 🎯 Usage Patterns

### Component Composition
Components are designed to work together seamlessly:

```tsx
<Card variant="elevated" className="max-w-md">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Vault Status</CardTitle>
      <Badge variant="success">Active</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">LTV Ratio</label>
        <Progress value={65} variant="warning" showLabel />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

### Responsive Design
All components are mobile-first and responsive:

```tsx
<Card className="w-full md:w-96 lg:w-[500px]">
  <CardContent className="p-4 md:p-6 lg:p-8">
    {/* Content adapts to screen size */}
  </CardContent>
</Card>
```

### Customization
Extensive customization through className and variant props:

```tsx
<Button 
  variant="outline" 
  size="lg"
  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
>
  Custom Styled Button
</Button>
```

## 🚀 Performance Features

### Optimization Techniques
- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Optimizes event handlers
- **useMemo**: Caches expensive calculations
- **Lazy Loading**: Components load only when needed

### Bundle Optimization
- **Tree Shaking**: Unused components are excluded
- **Code Splitting**: Components can be loaded separately
- **Minification**: Optimized for production builds

## ♿ Accessibility Features

### Standards Compliance
- **WCAG 2.1 AA**: Full accessibility compliance
- **ARIA Labels**: Proper screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets accessibility guidelines

### Screen Reader Support
```tsx
<Button aria-label="Delete vault" aria-describedby="delete-description">
  Delete
</Button>
<div id="delete-description" className="sr-only">
  This action cannot be undone
</div>
```

## 🎨 Theming and Customization

### CSS Variables
Components use CSS custom properties for easy theming:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Dark Mode Support
Automatic dark mode detection and support:

```tsx
<Card className="bg-card text-card-foreground border-border">
  {/* Automatically adapts to light/dark theme */}
</Card>
```

## 🧪 Testing

### Component Testing
Each component includes comprehensive tests:

```tsx
describe('Button', () => {
  it('renders with correct variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
  
  it('handles loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('opacity-50');
  });
});
```

### Accessibility Testing
Automated accessibility testing with jest-axe:

```tsx
it('meets accessibility standards', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📱 Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills
- **CSS Grid**: Modern CSS Grid support
- **CSS Variables**: CSS custom properties
- **Flexbox**: Modern flexbox layout
- **Transforms**: CSS transforms and animations

## 🔧 Development

### Prerequisites
- Node.js 18+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

### Installation
```bash
npm install @/components/ui
# or
yarn add @/components/ui
```

### Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build components
npm run build

# Type checking
npm run type-check
```

## 🤝 Contributing

### Component Guidelines
1. **Follow Patterns**: Use existing component structure
2. **Type Safety**: Full TypeScript coverage
3. **Accessibility**: WCAG compliance required
4. **Testing**: 100% test coverage
5. **Documentation**: Comprehensive examples

### Code Style
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality enforcement
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standard commit messages

## 📚 Resources

### Documentation
- [Component API Reference](./api.md)
- [Design System Guide](./design-system.md)
- [Accessibility Guide](./accessibility.md)
- [Performance Guide](./performance.md)

### Examples
- [Basic Usage](./examples/basic.md)
- [Advanced Patterns](./examples/advanced.md)
- [Customization](./examples/customization.md)
- [Integration](./examples/integration.md)

### Support
- [GitHub Issues](https://github.com/your-org/ui-components/issues)
- [Discord Community](https://discord.gg/your-community)
- [Documentation](https://docs.your-org.com)
- [Email Support](mailto:support@your-org.com)
