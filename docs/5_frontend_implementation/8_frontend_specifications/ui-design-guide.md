# SmileFactory Platform UI Design Guide

## Executive Summary

The SmileFactory Platform serves as Zimbabwe's premier innovation ecosystem, connecting innovators, investors, mentors, and organizations through a sophisticated digital interface. This comprehensive UI Design Guide establishes the visual foundation for frontend developers implementing the platform using Next.js 14+, React 18+, TypeScript, and Tailwind CSS.

Our design philosophy centers on accessibility, clarity, and cultural relevance to Zimbabwe's innovation landscape. The component-based design system ensures consistency across all user interfaces while supporting eight distinct profile types: Innovator, Investor, Mentor, Business, Organization, Student, Government, and Media. Every design decision prioritizes mobile-first responsive design, ensuring optimal user experience across all devices and connection speeds common in Zimbabwe's digital infrastructure.

The design system addresses current platform challenges including form state management, image upload interfaces, and dynamic post creation flows, providing clear specifications for resolving existing UI inconsistencies and implementing robust, scalable interface components.

## Design System Foundation

### Design Tokens

**Primary Color Palette** (extracted from logo and UI elements):
- **Brand Green**: `#7CB342` (Primary CTA buttons, active states)
- **Brand Green Dark**: `#689F38` (Hover states, emphasis)
- **Brand Green Light**: `#AED581` (Backgrounds, subtle highlights)
- **Brand Green Pale**: `#F1F8E9` (Light backgrounds, cards)

**Secondary Colors**:
- **Blue Accent**: `#2196F3` (Links, information states)
- **Blue Light**: `#E3F2FD` (Info backgrounds)
- **Orange Accent**: `#FF9800` (Warnings, marketplace features)
- **Orange Light**: `#FFF3E0` (Warning backgrounds)

**Semantic Colors**:
- **Success**: `#4CAF50` (Success states, confirmations)
- **Warning**: `#FF9800` (Caution, pending states)
- **Error**: `#F44336` (Error states, validation failures)
- **Info**: `#2196F3` (Information, neutral notifications)

**Neutral Palette**:
- **Gray 900**: `#212121` (Primary text, headings)
- **Gray 700**: `#616161` (Secondary text, labels)
- **Gray 500**: `#9E9E9E` (Placeholder text, disabled states)
- **Gray 300**: `#E0E0E0` (Borders, dividers)
- **Gray 100**: `#F5F5F5` (Light backgrounds, cards)
- **Gray 50**: `#FAFAFA` (Page backgrounds, subtle areas)
- **White**: `#FFFFFF` (Card backgrounds, primary surfaces)

### Typography Scale

**Font Family**: Inter (primary), system-ui (fallback)
- **Display Large**: `text-4xl` (36px) / `font-bold` / `leading-tight` (1.25)
- **Display Medium**: `text-3xl` (30px) / `font-bold` / `leading-tight`
- **Heading 1**: `text-2xl` (24px) / `font-semibold` / `leading-tight`
- **Heading 2**: `text-xl` (20px) / `font-semibold` / `leading-snug` (1.375)
- **Heading 3**: `text-lg` (18px) / `font-medium` / `leading-snug`
- **Body Large**: `text-base` (16px) / `font-normal` / `leading-relaxed` (1.625)
- **Body**: `text-sm` (14px) / `font-normal` / `leading-relaxed`
- **Caption**: `text-xs` (12px) / `font-normal` / `leading-normal` (1.5)

### Spacing System

**Base Unit**: 4px (0.25rem)
- **xs**: `space-1` (4px) - Icon padding, tight spacing
- **sm**: `space-2` (8px) - Button padding, form field spacing
- **md**: `space-4` (16px) - Card padding, section spacing
- **lg**: `space-6` (24px) - Component margins, layout spacing
- **xl**: `space-8` (32px) - Section dividers, major spacing
- **2xl**: `space-12` (48px) - Page sections, major layout gaps
- **3xl**: `space-16` (64px) - Hero sections, major page divisions

### Component Architecture

Components follow atomic design principles:
- **Atoms**: Buttons, inputs, icons, typography
- **Molecules**: Form fields, cards, navigation items
- **Organisms**: Headers, forms, content sections
- **Templates**: Page layouts, grid systems
- **Pages**: Complete interface implementations

### Responsive Strategy

**Breakpoints** (Tailwind CSS):
- **sm**: `640px` - Large mobile devices
- **md**: `768px` - Tablets
- **lg**: `1024px` - Small desktops
- **xl**: `1280px` - Large desktops
- **2xl**: `1536px` - Extra large screens

## Visual Identity Specifications

### SmileFactory Logo Usage

**Primary Logo**: Green version on light backgrounds
**Secondary Logo**: White version on dark backgrounds
**Minimum Size**: 120px width for digital use
**Clear Space**: Minimum 16px on all sides
**Logo Placement**: Top-left corner of navigation, centered in authentication flows

### Icon System

**Style**: Outline icons (Heroicons or similar)
**Sizes**: 
- **Small**: `w-4 h-4` (16px) - Inline text, small buttons
- **Medium**: `w-5 h-5` (20px) - Navigation, form fields
- **Large**: `w-6 h-6` (24px) - Primary actions, headers
**Stroke Width**: 1.5px for consistency
**Color**: Inherits from parent text color

## Authentication & Onboarding UI

### Login Screen Layout

Based on email + OTP flow design:

```html
<!-- Login Container -->
<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
    <!-- Logo -->
    <div class="text-center mb-8">
      <img src="/logo.svg" alt="SmileFactory" class="h-12 mx-auto">
    </div>
    
    <!-- Email Input -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Enter your email address
      </label>
      <input 
        type="email" 
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        placeholder="your.email@example.com"
      >
      <p class="text-xs text-gray-500 mt-2">We'll send the verification code to this email</p>
    </div>
    
    <!-- OTP Input Grid -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Enter your 6-digit verification code
      </label>
      <div class="flex space-x-2">
        <input class="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" maxlength="1">
        <!-- Repeat for 6 digits -->
      </div>
      <p class="text-xs text-gray-500 mt-2">💡 Tip: You can paste the entire code at once</p>
    </div>
    
    <!-- Submit Button -->
    <button class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
      Verify Email
    </button>
  </div>
</div>
```

### Form Field Design

**Input States**:
- **Default**: `border-gray-300 focus:ring-green-500 focus:border-green-500`
- **Error**: `border-red-300 focus:ring-red-500 focus:border-red-500`
- **Success**: `border-green-300 focus:ring-green-500 focus:border-green-500`
- **Disabled**: `bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`

**Error Messaging**:
```html
<div class="mt-1 text-sm text-red-600 flex items-center">
  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Error icon -->
  </svg>
  OTP expired. Please request a new code.
</div>
```

## Navigation & Layout Architecture

### Main Navigation

**Desktop Navigation**:
```html
<nav class="bg-white shadow-sm border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <img class="h-8 w-auto" src="/logo.svg" alt="SmileFactory">
      </div>
      
      <!-- Navigation Links -->
      <div class="hidden md:flex space-x-8">
        <a href="/home" class="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Home</a>
        <a href="/discover" class="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Discover</a>
        <a href="/connections" class="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Connections</a>
        <a href="/events" class="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Events</a>
        <a href="/marketplace" class="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Marketplace</a>
      </div>
      
      <!-- User Menu -->
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Notification icon -->
          </svg>
          <span class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        
        <div class="relative">
          <button class="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <img class="h-8 w-8 rounded-full" src="/avatar.jpg" alt="Profile">
            <span class="text-sm font-medium">EFF HGG</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Chevron down -->
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### Sidebar Navigation

**Left Sidebar** (for main app layout):
```html
<aside class="w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-16 h-full overflow-y-auto">
  <div class="p-4">
    <!-- User Profile Card -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex items-center space-x-3">
        <img class="h-12 w-12 rounded-full" src="/avatar.jpg" alt="Profile">
        <div>
          <h3 class="font-medium text-gray-900">EFF HGG</h3>
          <p class="text-sm text-gray-500">Entrepreneur</p>
        </div>
      </div>
      <button class="w-full mt-4 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
        + Create Post
      </button>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="space-y-1">
      <a href="/home" class="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Home icon -->
        </svg>
        <span>Home</span>
      </a>
      <!-- More navigation items -->
    </nav>
  </div>
</aside>
```

## Feed & Content Discovery Interface

### Feed Layout

**Main Feed Container**:
```html
<main class="max-w-2xl mx-auto py-6 px-4">
  <!-- Post Creation Prompt -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
    <div class="flex items-center space-x-3">
      <img class="h-10 w-10 rounded-full" src="/avatar.jpg" alt="Profile">
      <button class="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
        Share an update with your network...
      </button>
    </div>
  </div>
  
  <!-- Feed Posts -->
  <div class="space-y-6">
    <!-- Individual post cards -->
  </div>
</main>
```

### Post Card Design

**Standard Post Card**:
```html
<article class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <!-- Post Header -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <img class="h-10 w-10 rounded-full" src="/author-avatar.jpg" alt="Author">
        <div>
          <h3 class="font-medium text-gray-900">Blessed Paradza-Jambwa</h3>
          <p class="text-sm text-gray-500">Entrepreneur • 2h ago</p>
        </div>
      </div>
      <button class="p-2 text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <!-- More options icon -->
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Post Content -->
  <div class="p-4">
    <p class="text-gray-900 mb-4">Post content goes here...</p>
    
    <!-- Media (if present) -->
    <div class="mb-4">
      <img class="w-full rounded-lg" src="/post-image.jpg" alt="Post image">
    </div>
    
    <!-- Post Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="flex items-center space-x-6">
        <button class="flex items-center space-x-2 text-gray-500 hover:text-green-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Like icon -->
          </svg>
          <span class="text-sm">Like</span>
        </button>
        
        <button class="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Comment icon -->
          </svg>
          <span class="text-sm">Comment</span>
        </button>
        
        <button class="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Share icon -->
          </svg>
          <span class="text-sm">Share</span>
        </button>
      </div>
      
      <button class="text-gray-500 hover:text-yellow-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Bookmark icon -->
        </svg>
      </button>
    </div>
  </div>
</article>
```

## Post Creation & Content Management

### Dynamic Post Form

**Post Creation Modal** (addressing current form state clearing issues):
```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
    <!-- Modal Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900">Create post</h2>
      <div class="flex items-center space-x-4">
        <!-- Post Type Selector -->
        <select class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500">
          <option value="general">General</option>
          <option value="article">Article</option>
          <option value="event">Event</option>
          <option value="marketplace">Marketplace</option>
          <option value="opportunity">Opportunity</option>
        </select>

        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Close icon -->
          </svg>
        </button>
      </div>
    </div>

    <!-- Modal Body -->
    <div class="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
      <!-- Author Info -->
      <div class="flex items-center space-x-3 mb-4">
        <img class="h-10 w-10 rounded-full" src="/avatar.jpg" alt="Profile">
        <div>
          <h3 class="font-medium text-gray-900">EFF HGG</h3>
          <select class="text-sm text-gray-500 border-none p-0 focus:ring-0">
            <option>Anyone</option>
            <option>Connections only</option>
            <option>Private</option>
          </select>
        </div>
      </div>

      <!-- Content Area -->
      <div class="mb-4">
        <textarea
          class="w-full border-none resize-none focus:ring-0 text-gray-900 placeholder-gray-500"
          placeholder="Share an update with your network..."
          rows="4"
        ></textarea>
      </div>

      <!-- Media Upload Area -->
      <div class="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Upload icon -->
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            <button class="text-green-600 hover:text-green-700 font-medium">Click to upload</button>
            or drag and drop
          </p>
          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      <!-- Post Type Specific Fields -->
      <div id="post-type-fields" class="space-y-4">
        <!-- Dynamic fields based on post type -->
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="flex items-center justify-between p-4 border-t border-gray-200">
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Image icon -->
          </svg>
        </button>
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Hashtag icon -->
          </svg>
        </button>
      </div>

      <button class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed">
        Post
      </button>
    </div>
  </div>
</div>
```

### Post Type Specific Fields

**Event Post Fields**:
```html
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
    <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
      <input type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
      <input type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
    <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="Venue or Online">
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Registration Link</label>
    <input type="url" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="https://...">
  </div>
</div>
```

**Marketplace Post Fields**:
```html
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Product/Service Title</label>
    <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Price</label>
      <div class="relative">
        <span class="absolute left-3 top-2 text-gray-500">$</span>
        <input type="number" class="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-green-500">
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
        <option>Technology</option>
        <option>Services</option>
        <option>Products</option>
        <option>Consulting</option>
      </select>
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
    <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="Email or phone">
  </div>
</div>
```

## Profile & User Management

### Profile Card Design

**Profile Header Component**:
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <!-- Cover Image -->
  <div class="h-32 bg-gradient-to-r from-green-400 to-green-600"></div>

  <!-- Profile Info -->
  <div class="px-6 pb-6">
    <!-- Avatar -->
    <div class="flex items-end justify-between -mt-12 mb-4">
      <img class="h-24 w-24 rounded-full border-4 border-white shadow-lg" src="/avatar.jpg" alt="Profile">
      <div class="flex space-x-2">
        <button class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          Follow
        </button>
        <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Message
        </button>
      </div>
    </div>

    <!-- Profile Details -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-gray-900">Blessed Paradza-Jambwa</h1>
      <p class="text-green-600 font-medium">Entrepreneur</p>
      <p class="text-gray-600 mt-2">Building innovative solutions for Zimbabwe's digital transformation. Passionate about fintech and sustainable development.</p>
    </div>

    <!-- Profile Stats -->
    <div class="flex items-center space-x-6 text-sm text-gray-600">
      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Location icon -->
        </svg>
        <span>Harare, Zimbabwe</span>
      </div>
      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Calendar icon -->
        </svg>
        <span>Joined March 2024</span>
      </div>
    </div>

    <!-- Connection Stats -->
    <div class="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <div class="text-xl font-bold text-gray-900">1,234</div>
        <div class="text-sm text-gray-600">Connections</div>
      </div>
      <div class="text-center">
        <div class="text-xl font-bold text-gray-900">567</div>
        <div class="text-sm text-gray-600">Followers</div>
      </div>
      <div class="text-center">
        <div class="text-xl font-bold text-gray-900">89</div>
        <div class="text-sm text-gray-600">Posts</div>
      </div>
    </div>
  </div>
</div>
```

### Profile Type Indicators

**Profile Type Badges**:
```html
<!-- Entrepreneur Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Rocket icon -->
  </svg>
  Entrepreneur
</span>

<!-- Investor Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Dollar icon -->
  </svg>
  Investor
</span>

<!-- Mentor Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Academic cap icon -->
  </svg>
  Mentor
</span>

<!-- Organization Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Building icon -->
  </svg>
  Organization
</span>
```

## Messaging & Communication

### Message Interface

**Messaging Layout** (based on messaging mockup):
```html
<div class="flex h-screen bg-gray-50">
  <!-- Conversations List -->
  <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900">Messages</h2>
      <div class="mt-2">
        <input
          type="text"
          placeholder="Search conversations..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
        >
      </div>
    </div>

    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-1 p-2">
        <!-- Active Conversation -->
        <div class="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer">
          <div class="relative">
            <img class="h-10 w-10 rounded-full" src="/avatar1.jpg" alt="Contact">
            <div class="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900 truncate">Sarah Johnson</h3>
              <span class="text-xs text-gray-500">2m</span>
            </div>
            <p class="text-sm text-gray-600 truncate">Thanks for the collaboration opportunity...</p>
          </div>
          <div class="h-2 w-2 bg-green-500 rounded-full"></div>
        </div>

        <!-- Other Conversations -->
        <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <img class="h-10 w-10 rounded-full" src="/avatar2.jpg" alt="Contact">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900 truncate">Michael Chen</h3>
              <span class="text-xs text-gray-500">1h</span>
            </div>
            <p class="text-sm text-gray-600 truncate">Looking forward to the meeting tomorrow</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Chat Area -->
  <div class="flex-1 flex flex-col">
    <!-- Chat Header -->
    <div class="p-4 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img class="h-10 w-10 rounded-full" src="/avatar1.jpg" alt="Contact">
          <div>
            <h3 class="font-medium text-gray-900">Sarah Johnson</h3>
            <p class="text-sm text-green-600">Online</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Phone icon -->
            </svg>
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Video icon -->
            </svg>
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- More options icon -->
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Received Message -->
      <div class="flex items-start space-x-3">
        <img class="h-8 w-8 rounded-full" src="/avatar1.jpg" alt="Sender">
        <div class="max-w-xs lg:max-w-md">
          <div class="bg-gray-100 rounded-lg px-4 py-2">
            <p class="text-sm text-gray-900">Hi! I saw your post about the fintech startup. Would love to discuss potential collaboration opportunities.</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">2:30 PM</p>
        </div>
      </div>

      <!-- Sent Message -->
      <div class="flex items-start space-x-3 justify-end">
        <div class="max-w-xs lg:max-w-md">
          <div class="bg-green-600 rounded-lg px-4 py-2">
            <p class="text-sm text-white">That sounds great! I'd be happy to discuss. Are you available for a call this week?</p>
          </div>
          <p class="text-xs text-gray-500 mt-1 text-right">2:32 PM</p>
        </div>
        <img class="h-8 w-8 rounded-full" src="/my-avatar.jpg" alt="Me">
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200 bg-white">
      <div class="flex items-center space-x-3">
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Attachment icon -->
          </svg>
        </button>

        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="Type a message..."
            class="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
        </div>

        <button class="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Send icon -->
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
```

### Notification Design

**Notification Cards**:
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <!-- Notification Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center space-x-3">
      <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <!-- Heart icon for like notification -->
        </svg>
      </div>
      <div>
        <p class="text-sm text-gray-900">
          <span class="font-medium">Sarah Johnson</span> liked your post
        </p>
        <p class="text-xs text-gray-500">2 minutes ago</p>
      </div>
    </div>
    <button class="text-gray-400 hover:text-gray-600">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <!-- Close icon -->
      </svg>
    </button>
  </div>

  <!-- Notification Content Preview -->
  <div class="ml-13">
    <div class="bg-gray-50 rounded-lg p-3">
      <p class="text-sm text-gray-700">"Excited to announce our new fintech platform..."</p>
    </div>
  </div>
</div>
```

## Interactive Components Specifications

### Button System

**Primary Button**:
```html
<!-- Default State -->
<button class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
  Primary Action
</button>

<!-- Loading State -->
<button class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium opacity-75 cursor-not-allowed flex items-center space-x-2" disabled>
  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  <span>Loading...</span>
</button>

<!-- Disabled State -->
<button class="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-medium cursor-not-allowed" disabled>
  Disabled
</button>
```

**Secondary Button**:
```html
<button class="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
  Secondary Action
</button>
```

**Icon Button**:
```html
<button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icon -->
  </svg>
</button>
```

### Form Controls

**Input Field with Label**:
```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">
    Email Address
    <span class="text-red-500">*</span>
  </label>
  <input
    type="email"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
    placeholder="Enter your email"
    required
  >
  <p class="text-xs text-gray-500">We'll never share your email with anyone else.</p>
</div>
```

**Select Dropdown**:
```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">Profile Type</label>
  <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
    <option value="">Select your profile type</option>
    <option value="entrepreneur">Entrepreneur</option>
    <option value="investor">Investor</option>
    <option value="mentor">Mentor</option>
    <option value="business">Business</option>
    <option value="organization">Organization</option>
    <option value="student">Student</option>
    <option value="government">Government</option>
    <option value="media">Media</option>
  </select>
</div>
```

**Checkbox**:
```html
<div class="flex items-center space-x-3">
  <input
    type="checkbox"
    id="terms"
    class="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
  >
  <label for="terms" class="text-sm text-gray-700">
    I agree to the <a href="/terms" class="text-green-600 hover:text-green-700">Terms of Service</a>
  </label>
</div>
```

### Cards

**Standard Card**:
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p class="text-gray-600 mb-4">Card content goes here...</p>
  <button class="text-green-600 hover:text-green-700 font-medium text-sm">
    Learn More →
  </button>
</div>
```

**Feature Card**:
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <!-- Feature icon -->
    </svg>
  </div>
  <h3 class="text-lg font-semibold text-gray-900 mb-2">Feature Name</h3>
  <p class="text-gray-600">Feature description and benefits...</p>
</div>
```

### Modals & Overlays

**Standard Modal**:
```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
    <!-- Modal Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Modal Title</h3>
      <button class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Close icon -->
        </svg>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="p-6">
      <p class="text-gray-600">Modal content goes here...</p>
    </div>

    <!-- Modal Footer -->
    <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
      <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
        Cancel
      </button>
      <button class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Loading States

**Skeleton Screen**:
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div class="animate-pulse">
    <!-- Avatar Skeleton -->
    <div class="flex items-center space-x-3 mb-4">
      <div class="h-10 w-10 bg-gray-300 rounded-full"></div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-300 rounded w-24"></div>
        <div class="h-3 bg-gray-300 rounded w-16"></div>
      </div>
    </div>

    <!-- Content Skeleton -->
    <div class="space-y-3">
      <div class="h-4 bg-gray-300 rounded w-full"></div>
      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>

    <!-- Image Skeleton -->
    <div class="h-48 bg-gray-300 rounded-lg mt-4"></div>

    <!-- Actions Skeleton -->
    <div class="flex items-center space-x-4 mt-4">
      <div class="h-8 bg-gray-300 rounded w-16"></div>
      <div class="h-8 bg-gray-300 rounded w-20"></div>
      <div class="h-8 bg-gray-300 rounded w-16"></div>
    </div>
  </div>
</div>
```

**Loading Spinner**:
```html
<div class="flex items-center justify-center p-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
</div>
```

### Empty States

**No Content State**:
```html
<div class="text-center py-12">
  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Empty state icon -->
  </svg>
  <h3 class="mt-4 text-lg font-medium text-gray-900">No connections yet</h3>
  <p class="mt-2 text-gray-600">You don't have any connections yet. Start building your network!</p>
  <button class="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
    Discover People
  </button>
</div>
```

## Mobile Responsiveness Implementation

### Breakpoint Behavior

**Navigation Adaptation**:
```html
<!-- Desktop Navigation (hidden on mobile) -->
<nav class="hidden md:flex space-x-8">
  <!-- Navigation items -->
</nav>

<!-- Mobile Navigation (visible on mobile) -->
<div class="md:hidden">
  <button class="p-2 text-gray-400 hover:text-gray-600">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <!-- Hamburger menu icon -->
    </svg>
  </button>
</div>

<!-- Mobile Menu Overlay -->
<div class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
  <div class="bg-white w-64 h-full shadow-xl">
    <!-- Mobile navigation content -->
  </div>
</div>
```

**Responsive Grid Layout**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Grid items -->
</div>
```

**Mobile-First Typography**:
```html
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
  Responsive Heading
</h1>
```

### Touch Targets

**Minimum Touch Target Size**:
```html
<!-- Mobile-optimized button -->
<button class="min-h-[44px] min-w-[44px] p-3 bg-green-600 text-white rounded-lg">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icon -->
  </svg>
</button>
```

## Technical Implementation Guidelines

### Tailwind CSS Classes

**Common Component Patterns**:

**Card Component**:
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply p-6 border-b border-gray-200;
}

.card-body {
  @apply p-6;
}

.card-footer {
  @apply p-6 border-t border-gray-200;
}
```

**Button Variants**:
```css
.btn-primary {
  @apply bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors;
}

.btn-secondary {
  @apply border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}

.btn-icon {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}
```

### React Component Mapping

**Component Structure**:
```
/frontend/src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
├── forms/
│   ├── PostCreationForm.tsx
│   ├── LoginForm.tsx
│   └── ProfileForm.tsx
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── feed/
│   ├── PostCard.tsx
│   ├── FeedContainer.tsx
│   └── PostActions.tsx
└── profile/
    ├── ProfileCard.tsx
    ├── ProfileBadge.tsx
    └── ConnectionStats.tsx
```

### State Management

**Visual Feedback States**:
```typescript
interface ComponentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

// Loading state
if (loading) return <SkeletonLoader />;

// Error state
if (error) return <ErrorMessage message={error} />;

// Success state
if (success) return <SuccessMessage />;

// Default state
return <ComponentContent data={data} />;
```

### Accessibility

**ARIA Labels and Focus States**:
```html
<!-- Button with ARIA label -->
<button
  aria-label="Like this post"
  class="p-2 text-gray-400 hover:text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Heart icon -->
  </svg>
</button>

<!-- Form with proper labels -->
<div>
  <label for="email" class="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby="email-help"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
  >
  <p id="email-help" class="text-xs text-gray-500 mt-1">
    We'll use this to send you important updates
  </p>
</div>
```

**Color Contrast Requirements**:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

## Implementation Checklist

### Component Development
- [ ] Implement atomic design system components
- [ ] Create responsive layouts using Tailwind CSS grid and flexbox
- [ ] Add proper ARIA labels and keyboard navigation
- [ ] Implement loading, error, and empty states
- [ ] Test components across all breakpoints

### Form Handling
- [ ] Implement dynamic post type switching without state clearing
- [ ] Add proper form validation with clear error messages
- [ ] Create accessible form controls with proper labeling
- [ ] Implement file upload interface with progress indicators

### Performance
- [ ] Optimize images with proper sizing and lazy loading
- [ ] Implement skeleton screens for loading states
- [ ] Use proper semantic HTML elements
- [ ] Minimize custom CSS in favor of Tailwind utilities

### Testing
- [ ] Test all components on mobile devices
- [ ] Verify color contrast ratios meet accessibility standards
- [ ] Test keyboard navigation and screen reader compatibility
- [ ] Validate responsive behavior across all breakpoints

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained By**: SmileFactory Frontend Team
**Related Documentation**:
- [Component Architecture](component-architecture.md)
- [Form Specifications](form-specifications.md)
- [Current Issues & Bugs](../../../issues-and-bugs/README.md)
