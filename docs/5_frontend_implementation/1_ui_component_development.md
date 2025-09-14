# 1. UI Component Development

## 🎨 **UI Component Development Overview**

This document outlines the comprehensive frontend component development strategy for the ZbInnovation platform, including React component architecture, Material-UI implementation, component library setup, and responsive design principles.

## 🏗️ **Component Architecture Strategy**

### **Component Hierarchy Structure**
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Layout/
│   ├── forms/            # Form-specific components
│   │   ├── ProfileForm/
│   │   ├── PostForm/
│   │   └── ConnectionForm/
│   ├── features/         # Feature-specific components
│   │   ├── Profile/
│   │   ├── Dashboard/
│   │   ├── Community/
│   │   └── AI/
│   └── pages/            # Page-level components
│       ├── Landing/
│       ├── Dashboard/
│       └── Community/
```

### **Base Component Pattern**
```typescript
// src/components/common/BaseComponent.tsx
import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface BaseComponentProps extends BoxProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  testId?: string;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&.loading': {
    opacity: 0.6,
    pointerEvents: 'none',
  },
}));

export const BaseComponent: React.FC<BaseComponentProps> = ({
  children,
  loading = false,
  error = null,
  testId,
  ...boxProps
}) => {
  return (
    <StyledContainer
      className={loading ? 'loading' : ''}
      data-testid={testId}
      {...boxProps}
    >
      {error && (
        <Box color="error.main" mb={2}>
          {error}
        </Box>
      )}
      {children}
    </StyledContainer>
  );
};
```

## 🎯 **Material-UI Component Library**

### **Theme Configuration**
```typescript
// src/theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

// ⚠️ IMPORTANT: This theme configuration should be updated to match the UI Design Guide
// Refer to: docs/5_frontend_implementation/8_frontend_specifications/ui-design-guide.md

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#7CB342',      // Brand Green from UI Design Guide
      light: '#AED581',     // Brand Green Light from UI Design Guide
      dark: '#689F38',      // Brand Green Dark from UI Design Guide
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196F3',      // Blue Accent from UI Design Guide
      light: '#E3F2FD',     // Blue Light from UI Design Guide
      dark: '#1976D2',      // Darker blue variant
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFA',   // Gray 50 from UI Design Guide
      paper: '#FFFFFF',     // White from UI Design Guide
    },
    text: {
      primary: '#212121',   // Gray 900 from UI Design Guide
      secondary: '#616161', // Gray 700 from UI Design Guide
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, "Helvetica", "Arial", sans-serif', // Updated to match UI Design Guide
    h1: {
      fontSize: '2.25rem',  // 36px - Display Large from UI Design Guide
      fontWeight: 700,      // font-bold from UI Design Guide
      lineHeight: 1.25,     // leading-tight from UI Design Guide
    },
    h2: {
      fontSize: '1.875rem', // 30px - Display Medium from UI Design Guide
      fontWeight: 700,      // font-bold from UI Design Guide
      lineHeight: 1.25,     // leading-tight from UI Design Guide
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

// Standardized Profile Card Theme
export const profileCardTheme = {
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '24px',
  },
  avatar: {
    background: '#4CAF50', // Green for ALL profiles
    color: '#FFFFFF',
    size: 80,
  },
  completion: {
    background: '#4CAF50', // Green for ALL profiles
    color: '#FFFFFF',
  },
  button: {
    color: '#4CAF50', // Green for ALL profiles
    borderColor: '#4CAF50',
  },
  profileTypeColors: {
    innovator: '#4CAF50',
    business_investor: '#2196F3',
    mentor: '#9C27B0',
    professional: '#009688',
    industry_expert: '#3F51B5',
    academic_student: '#2196F3',
    academic_institution: '#673AB7',
    organisation: '#1976D2',
  },
};
```

### **Custom Button Components**
```typescript
// src/components/common/Button/Button.tsx
import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton)<{ customVariant: string }>(
  ({ theme, customVariant }) => ({
    ...(customVariant === 'primary' && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
    ...(customVariant === 'secondary' && {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    }),
    ...(customVariant === 'outline' && {
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
    }),
  })
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      customVariant={variant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : undefined}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
```

### **Form Input Components**
```typescript
// src/components/common/Input/TextInput.tsx
import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  FormHelperText,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, required, ...props }, ref) => {
    return (
      <Box>
        <StyledTextField
          ref={ref}
          label={label}
          variant="outlined"
          fullWidth
          error={!!error}
          required={required}
          {...props}
        />
        {(error || helperText) && (
          <FormHelperText error={!!error}>
            {error || helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

TextInput.displayName = 'TextInput';
```

## 📱 **Responsive Design Implementation**

### **Responsive Layout Component**
```typescript
// src/components/common/Layout/ResponsiveLayout.tsx
import React from 'react';
import {
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  maxWidth = 'lg',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      {header && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: sidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
            ml: { md: sidebar ? `${drawerWidth}px` : 0 },
          }}
        >
          <Toolbar>
            {sidebar && isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {header}
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {sidebar && (
        <>
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {sidebar}
          </Drawer>

          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {sidebar}
          </Drawer>
        </>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: sidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
          mt: header ? 8 : 0,
        }}
      >
        <Container maxWidth={maxWidth} sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
```

### **Responsive Grid System**
```typescript
// src/components/common/Layout/ResponsiveGrid.tsx
import React from 'react';
import { Grid, GridProps } from '@mui/material';

interface ResponsiveGridProps extends GridProps {
  children: React.ReactNode;
  spacing?: number;
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 3,
  breakpoints = { xs: 12, sm: 6, md: 4, lg: 3 },
  ...props
}) => {
  return (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => (
        <Grid
          item
          xs={breakpoints.xs}
          sm={breakpoints.sm}
          md={breakpoints.md}
          lg={breakpoints.lg}
          xl={breakpoints.xl}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};
```

## 🔧 **Component Library Setup**

### **Component Index and Exports**
```typescript
// src/components/index.ts
// Common Components
export { Button } from './common/Button/Button';
export { TextInput } from './common/Input/TextInput';
export { Modal } from './common/Modal/Modal';
export { ResponsiveLayout } from './common/Layout/ResponsiveLayout';
export { ResponsiveGrid } from './common/Layout/ResponsiveGrid';
export { LoadingSpinner } from './common/Loading/LoadingSpinner';
export { ErrorBoundary } from './common/Error/ErrorBoundary';

// Form Components
export { ProfileForm } from './forms/ProfileForm/ProfileForm';
export { PostForm } from './forms/PostForm/PostForm';
export { SearchForm } from './forms/SearchForm/SearchForm';

// Feature Components
export { ProfileCard } from './features/Profile/ProfileCard';
export { PostCard } from './features/Community/PostCard';
export { DashboardWidget } from './features/Dashboard/DashboardWidget';
export { AIAssistant } from './features/AI/AIAssistant';

// Page Components
export { LandingPage } from './pages/Landing/LandingPage';
export { DashboardPage } from './pages/Dashboard/DashboardPage';
export { CommunityPage } from './pages/Community/CommunityPage';
```

### **Storybook Configuration**
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

### **Component Story Example**
```typescript
// src/components/common/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'text'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};
```

## 🎨 **Advanced Component Patterns**

### **Compound Component Pattern**
```typescript
// src/components/common/Modal/Modal.tsx
import React, { createContext, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalContextType {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Content: typeof ModalContent;
  Actions: typeof ModalActions;
} = ({ open, onClose, children, maxWidth = 'sm' }) => {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
        {children}
      </Dialog>
    </ModalContext.Provider>
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(ModalContext);
  
  return (
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">{children}</Typography>
      <IconButton onClick={context?.onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};

const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogContent>{children}</DialogContent>;
};

const ModalActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogActions>{children}</DialogActions>;
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Actions = ModalActions;

export { Modal };

// Usage:
// <Modal open={open} onClose={handleClose}>
//   <Modal.Header>Title</Modal.Header>
//   <Modal.Content>Content</Modal.Content>
//   <Modal.Actions>Actions</Modal.Actions>
// </Modal>
```

### **Render Props Pattern**
```typescript
// src/components/common/DataFetcher/DataFetcher.tsx
import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Alert } from '@mui/material';

interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

export function DataFetcher<T>({
  url,
  children,
  loadingComponent,
  errorComponent,
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (loading) {
    return loadingComponent || (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return errorComponent ? (
      errorComponent(error)
    ) : (
      <Alert severity="error">{error}</Alert>
    );
  }

  return <>{children(data, loading, error)}</>;
}

// Usage:
// <DataFetcher<User> url="/api/users/me">
//   {(user, loading, error) => (
//     user ? <UserProfile user={user} /> : <div>No user data</div>
//   )}
// </DataFetcher>
```

---

## 📚 **Reference Documents**

**Frontend Specifications**: See `/frontend-specifications/` for detailed UI requirements
**State Management**: See `/5_frontend_implementation/4_state_management_implementation.md`
**Form Handling**: See `/5_frontend_implementation/3_form_handling_and_validation.md`
**Testing**: See `/5_frontend_implementation/5_frontend_testing_and_validation.md`

*This UI component development framework provides a robust, scalable foundation for all ZbInnovation platform frontend components.*
