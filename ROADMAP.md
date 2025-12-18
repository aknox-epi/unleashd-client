# Unleashd Client Roadmap

This document outlines potential features and enhancements for the Unleashd pet adoption app.

## Current Status

### ✅ Completed Features

#### 🔍 Pet Search & Discovery

**Search Functionality:**

- Pet search using RescueGroups API
- Infinite scroll pagination (20 items per page)
- Pull-to-refresh for updated results
- Auto-search for dogs on mount
- Loading states and error handling
- Empty states (initial, no results, error)

**Filtering:**

- Species filter (Dog, Cat, Bird, Rabbit, Small Animal, Horse, Reptile, Barnyard)
- Species selector dropdown with icon indicators
- Gender filter (Male, Female, All) - ✅ Added in v0.1.0
- Age filter (Baby, Young, Adult, Senior, All) - ✅ Added in v0.1.0
- Size filter (Small, Medium, Large, X-Large, All) - ✅ Added in v0.1.0
- Organization filter (dropdown with 100+ organizations) - ✅ Added in v0.8.0
- Collapsible filter accordion with active filter count indicator - ✅ Added in v0.1.0
- Prevents accordion collapse and maintains focus during filter changes - ✅ Fixed in v0.4.1
- "Clear All Filters" button - ✅ Added in v0.1.0

**Display Components:**

- AnimalCard component with responsive layout
- Image fallbacks with species-specific icons (64px icons for animals without photos)
- Theme-aware styling (light/dark mode support)

**UX Enhancements:**

- Loading skeleton animations (5 skeleton cards during initial load)
- Enhanced empty states with visual icons (Search, SearchX, AlertCircle)
- Haptic feedback on interactions (search, refresh, card taps, species selector)
- Scroll-to-top FAB button (appears after 300px scroll with fade animation)
- Theme-aware RefreshControl styling (dynamic colors for light/dark mode)
- Entrance animations for animal cards (300ms fade-in + slide-up on mount) - ✅ Added in v0.4.1
- Smooth loading transitions using React Native Animated API

#### 📱 Pet Details & Gallery

**Detail Screen:**

- Dedicated pet detail screen with full navigation
- Comprehensive pet information display
- Description with proper text formatting (whitespace-normal)
- Characteristics (age, sex, breed, size, color)
- Adoption fee with smart formatting (auto-adds $ prefix)
- Theme-aware background styling (bg-background-0)
- Image validation to prevent empty boxes

**Navigation:**

- Native back button support for iOS/Android (Stack navigator)
- Gesture-based navigation (iOS swipe-back support)
- Haptic feedback on back button interactions
- Cross-platform navigation consistency (mobile + web)
- Proper navigation hierarchy (root Stack → tabs → detail screens)

**Photo Gallery:**

- Horizontal scrolling photo gallery with FlatList
- Pagination indicator dots showing current position
- Photo counter overlay (e.g., "1 of 5")
- Navigation buttons for web users (mouse-friendly)
- Fullscreen image modal with gesture support
- Accessibility improvements (aria-hidden focus management) - ✅ Fixed in v0.4.1
- Multiple images with smart URL fallback handling
- Single image direct rendering (avoids gesture conflicts)
- Filter out images without valid URLs

**Visual Elements:**

- Species-specific badge colors
- Smooth animations and transitions
- Proper spacing and layout

**Organization Information:**

- Shelter/rescue organization details
- Name, description, and location
- Contact information (phone, email, website)
- Social media links (Facebook, Twitter)
- Clickable contact links (tel:, mailto:, https:)
- Clickable organization name links to org detail page - ✅ Added in v0.8.0
- View Organization Details button - ✅ Added in v0.8.0
- Uses publicSearch action for improved API compatibility - ✅ Fixed in v0.4.1

**Adoption Information:**

- Adoption requirements display
- Fence requirements
- Application process details
- Organization-specific policies
- Fallback to standard requirements when org-specific not available

**Contact Functionality:**

- Contact action sheet with multiple options
- Call, email, website, view listing, directions
- Directions via Maps integration
  - Apple Maps for iOS
  - Google Maps for web/Android
  - Requires valid street address for activation - ✅ Added in v0.4.1
- Platform-specific URL handling
- Comprehensive error handling for all contact methods

#### ⚙️ Settings & Configuration

**Theme System:**

- Light/dark mode toggle with Switch component
- System preference detection on first launch
- AsyncStorage persistence for user preference
- Theme context for app-wide state management
- Seamless theme switching across all screens

**What's New / Changelog:**

- Animated sparkle notification badge on Settings tab
- Enabled by default with opt-out toggle for changelog notifications
- Version tracking and comparison (isNewerVersion)
- Automated changelog embedding system (runs automatically during releases via postchangelog hook)
- Dynamic version reading from package.json
- Changelog parsing from CHANGELOG.md
- Collapsible filter section with Accordion
- Timeline filtering (latest, 7/30 days, 3 months, all time)
- Type filtering with checkboxes (Features, Fixes, Docs, Build, etc.)
- Drawer with comprehensive changelog display
- Persistent user preferences via AsyncStorage
- Badge marks version as seen on drawer close (prevents double-press bug)
- Badge properly disappears when drawer closes, not just on navigation - ✅ Fixed in v0.4.1
- Unique React keys for changelog rendering (no duplicate key warnings)
- 100% test coverage for What's New feature (30 WhatsNewContext tests)

#### 🔧 Development Infrastructure

**API Integration:**

- RescueGroups API integration with React Context
- API health status monitoring
- Service status tracking (CONFIGURED, NOT_CONFIGURED, ERROR)
- Environment-aware error handling (dev vs production messages)
- Health check with 60-second caching
- Error/warning display system
- Warning toast notifications in production
- Dismissable error banners in development
- Environment variable validation (build-time and runtime)

**Testing & Quality:**

- Comprehensive test coverage (339 tests passing)
- 99%+ coverage for API integrations
- 95%+ coverage for critical services
- Clean test output with suppressed cosmetic warnings
- Environment-aware logger suppresses noise in test environment - ✅ Added in v0.4.1
- Reorganized test commands (test, test:watch, test:coverage)
- Comprehensive TESTING.md documentation guide
- Pre-commit hooks (lint, format, test staged files)
- Pre-push hooks (full test suite with coverage)
- Jest configured with Expo preset
- React Test Renderer for component testing
- Mock implementations for external dependencies
- Coverage reports generated in coverage/ directory
- Documented Bun test runner incompatibility with React Native
- Suppressed React act() warnings for cleaner test output - ✅ Added in v0.4.1

**Development Workflow:**

- Modified GitHub Flow (main ← dev ← feature branches)
- Release branch workflow (release → dev → main)
- Merge commit strategy to preserve full commit history
- Automated changelog generation with commit-and-tag-version
- Semantic versioning (feat → minor, fix → patch, BREAKING → major)
- Husky + lint-staged for Git hooks
- ESLint + Prettier for code quality
- Commitlint for conventional commits validation
- Branch protection and PR requirements

**Documentation:**

- Comprehensive README.md with setup guides
- CONTRIBUTING.md with detailed workflow
- AGENTS.md for AI agent guidelines
- TESTING.md with comprehensive testing guide
- Clear separation of concerns between docs
- Cross-linking for easy navigation
- API integration documentation with examples
- Testing guidelines and coverage standards
- Release process documentation (10-step workflow)
- Merge strategy documentation (merge commits to preserve history)

**CI/CD:**

- GitHub Actions workflow on PRs and pushes
- Automated testing on all branches
- Build verification (web export)
- Environment validation checks
- Commitlint validation
- ESLint and Prettier checks
- Branch protection rules for dev and main

#### 🗂️ Project Structure

- Tab-based navigation (Explore, Favorites, Settings, Status)
- File-based routing with Expo Router
- GlueStack UI + NativeWind (Tailwind CSS) styling
- TypeScript strict mode enabled
- Path aliases (@/\* for imports)
- Cross-platform support (iOS, Android, Web)
- Monorepo structure with proper .gitignore
- Organized component directory (ui components)
- Service layer architecture (rescuegroups services)
- Context providers for global state
- Custom hooks for data fetching

#### ⭐ Favorites & Saved Pets

**Core Functionality:**

- Favorite/save pets from card and detail screens
- Favorite/save organizations from detail screens
- Heart button with haptic feedback on interactions
- Visual indicators for favorited items (filled red heart)
- Persist favorites locally with AsyncStorage
- Dedicated Favorites tab in navigation
- Remove from favorites functionality
- Favorites count badge on tab icon

**Favorites Tab:**

- Tabbed interface for pets and organizations
- Tab switcher with badge counts for each type
- Grid display of favorited pets
- Compact list display of favorited organizations
- Pull-to-refresh functionality
- Empty state with helpful message for each tab
- Sort by most recently favorited
- Tap to view pet/organization details
- Favorites counter in header

**Implementation:**

- FavoritesContext with React Context API supporting both pets and organizations
- O(1) favorite lookup performance (Set-based)
- Versioned storage schema for future migrations
- 100% test coverage (20 comprehensive tests)
- Optimistic updates for instant UI feedback

#### 🏢 Organization Features

**Organization Details Screen:**

- Dedicated organization details screen at `/org/[id]` - ✅ Added in v0.8.0
- Comprehensive organization information display
- Organization name, type, and description
- Location and contact information (phone, email, website)
- Social media links (Facebook, Twitter)
- Clickable contact actions (call, email, website, directions)
- Contact action sheet with multiple options
- Organization logo placeholder with building icon
- Theme-aware styling for light/dark mode

**Organization Pets List:**

- Dedicated screen at `/org/pets/[id]` for viewing all pets from an organization
- Infinite scroll pagination (20 pets per page)
- Pull-to-refresh functionality
- Pet count display in header
- Empty state when no pets available
- Navigate to pet details from list

**Organization Card Component:**

- Reusable OrganizationCard component for consistent display
- Compact variant for favorites list
- Shows organization name, type, location, and description
- Favorite button with heart icon
- Theme-aware styling
- 100% test coverage for component

**Organization Favorites:**

- Save/favorite organizations from detail screens
- Organization favorites tab in Favorites screen
- Tab switcher between pets and organizations
- Remove from favorites functionality
- Organization count badge
- Persist to AsyncStorage

**Organization Filtering:**

- Filter explore page by organization dropdown
- View all pets from a specific organization
- Navigate from pet details to organization page
- Navigate from organization details to full pets list

**Implementation:**

- OrganizationCard component with full test coverage
- getAnimalsByOrgId service method with pagination support
- Extended FavoritesContext to support organizations
- Updated Organization type with normalized URL field names
- Nested route structure for organization screens
- Integration with existing pet detail flow

## Planned Features

### 🔍 Pet Search & Discovery Enhancements

#### Advanced Filtering

- ✅ ~~Filter by age range (puppy/kitten, young, adult, senior)~~ - Completed in v0.1.0
- ✅ ~~Filter by size (small, medium, large, extra large)~~ - Completed in v0.1.0
- ✅ ~~Filter by gender (male, female, unknown)~~ - Completed in v0.1.0
- Filter by location/distance (zip code + radius)
- Filter by special needs
- Filter by good with kids/dogs/cats
- ✅ ~~Multi-filter support (combine multiple filters)~~ - Completed in v0.1.0
- Save filter preferences locally

#### Sorting & Organization

- ✅ Sort by newest listings - **Completed**
- ✅ Sort by oldest listings - **Completed**
- ✅ Sort alphabetically by name (A-Z, Z-A) - **Completed**
- ✅ Sort by distance from location (closest/furthest) - **Completed**
- ✅ Remember sort preference in AsyncStorage - **Completed**
- ✅ Fixed sort preference state race conditions (auto-search respects saved preferences) - **Fixed in v0.4.1**
- ✅ Fixed sort selection not applying immediately (resolved stale state issues) - **Fixed in v0.4.1**
- Recently viewed pets
- Sort by age

### 📱 Pet Details Enhancements

#### Interactive Features

- Pinch-to-zoom for images
- Add notes/comments for saved pets
- Mark pet as "contacted" or "applied"

#### Recent Improvements (v0.4.1)

- ✅ Get Directions validates street address before enabling
- ✅ Fullscreen image modal accessibility improvements (aria-hidden focus)
- ✅ Organization data fetched via publicSearch for better compatibility

### 🏢 Organization Features (Future Enhancements)

#### Organization Search & Discovery

- Dedicated organization search/browse screen
- Search organizations by name or location
- Filter organizations by type (rescue, shelter, etc.)
- Organization listings independent of pet search

#### Enhanced Organization Features

- Organization logos/branding images
- Operating hours display
- Distance calculation from user location
- Reviews/ratings system for organizations
- Adoption statistics (total pets adopted, success stories)
- Organization verification badges

### ⚙️ Settings Enhancements

#### User Preferences

- Location/zip code preference for search radius
- Default pet type preference (remember last selection)
- Search radius preference (5, 10, 25, 50, 100 miles)
- Display preferences (grid vs list view)
- Default sort order preference
- Notification preferences (when push notifications added)

#### App Settings

- Clear cache option
- Clear favorites option
- About section (app version, credits, open source licenses)
- Privacy policy and terms of service links
- Feedback/support contact form
- Rate the app
- Export/import favorites (backup)

#### What's New / Changelog Enhancements

**Future Enhancements:**

- Push notifications for app updates (requires Expo Notifications)
- Deep links from changelog items to specific features
- "What's New" auto-modal on first launch after update
- Share changelog feature (social media, email)

### 📊 Status Tab Enhancements

#### API Monitoring

- Detailed API health metrics dashboard
- API response time tracking
- Rate limit information display
- Connectivity status indicator
- Recent API errors/warnings log
- Request/response statistics
- Visual graphs for API performance

### 🔔 Future Considerations

#### Notifications (Long-term)

- Push notifications for new pets matching saved search criteria
- Favorites updates (e.g., pet adopted, status changed)
- Adoption application status updates
- Daily/weekly digest of new pets

#### Social Features (Long-term)

- Share pet profiles via social media
- Share via text/email
- Pet comparison feature (side-by-side)
- User reviews/ratings for shelters
- Adoption success stories
- Community forum or Q&A

#### Offline Support (Long-term)

- Cache search results for offline viewing
- Queue actions when offline (favorites, etc.)
- Sync when connection restored
- Offline-first architecture

#### Accessibility (Long-term)

- Screen reader optimization
- High contrast mode
- Font size preferences
- Voice search capability
- Alternative text for all images
- Keyboard navigation support

## Development Priorities

Priority order for next features (subject to change):

1. **High Priority** (Next Sprint)

   **Advanced Filtering** - ✅ **Completed v0.4.0**
   - ✅ ~~Age range filter (Baby, Young, Adult, Senior)~~ - Completed
   - ✅ ~~Size filter (Small, Medium, Large, X-Large)~~ - Completed
   - ✅ ~~Gender filter (Male, Female)~~ - Completed
   - ✅ ~~Multi-filter support (combine filters)~~ - Completed
   - ✅ ~~Location/distance filter (zip code + radius)~~ - Completed v0.4.0
     - ✅ ZIP code input with validation (5-digit and ZIP+4 formats)
     - ✅ Radius dropdown (10, 25, 50, 100, 250, 500 miles)
     - ✅ API integration with location/radius parameters
     - ✅ Active filter count and clear filters support
     - ✅ Distance display on animal cards with MapPin icon
     - ✅ AsyncStorage for default location preference (auto-saves/loads ZIP and radius)
     - 🔄 Optional: Geolocation "Use My Location" button (future enhancement)

   **Sorting Capabilities** - ✅ **Completed v0.4.0**
   - ✅ Sort by newest/oldest listings (animalUpdatedDate)
   - ✅ Sort by distance (closest/furthest - requires location filter)
   - ✅ Sort alphabetically (A-Z, Z-A)
   - ✅ Remember sort preference in AsyncStorage
   - ✅ Auto-trigger search on sort change
   - ✅ Disable distance sort when no ZIP code entered
   - ✅ 100% test coverage for SortPreferencesContext
   - ✅ Fixed state race conditions for sort preferences - Fixed v0.4.1

   **UX Polish & Animations** - ✅ **Completed v0.4.1**
   - ✅ Entrance animations for animal cards (fade-in + slide-up)
   - ✅ Smooth transitions using React Native Animated API
   - ✅ Improved layout (inline location icons)
   - ✅ Fixed filter accordion collapse behavior
   - ✅ Fixed What's New badge behavior

   **Organization Features** - ✅ **Completed v0.8.0**
   - ✅ Organization detail screens (`/org/[id]`)
   - ✅ Organization pets list with pagination (`/org/pets/[id]`)
   - ✅ OrganizationCard component with full test coverage
   - ✅ Organization favorites functionality
   - ✅ Organization filter in explore page
   - ✅ Navigate from pet details to organization pages
   - ✅ Contact action sheet for organizations
   - ✅ Extended FavoritesContext to support organizations
   - ✅ Tabbed favorites interface (pets & organizations)

2. **High Priority** (Next Sprint)

   **Settings Enhancements** - User preferences
   - ✅ Location preference for searches - **Completed v0.4.0**
   - ✅ Search radius preference (saved with location) - **Completed v0.4.0**
   - ✅ Default species preference (remember last selection) - **Completed v0.4.0**
   - Display preferences (grid/list)
   - Clear favorites functionality (in Settings)
   - Default pet type preference (deprecated - species preference covers this)

3. **Medium Priority** (Next 2-3 Sprints)

   **Pet Details Polish** - Improve detail screen UX
   - Pinch-to-zoom for images
   - Recently viewed pets tracking
   - Add notes/comments for favorited pets

   **Organization Enhancements**
   - Organization search/browse screen
   - Organization logos and branding
   - Reviews/ratings system

4. **Low Priority** (Future Sprints)
   - Status tab detailed metrics and dashboard
   - Social sharing enhancements
   - Push notifications system
   - Offline support and caching
   - Advanced accessibility features
   - User accounts and profile management

5. **Long-term / Research Needed**
   - Backend service for favorites sync across devices
   - User authentication system
   - Adoption application tracking
   - Community features (reviews, success stories)
   - Voice search and voice commands
   - AR features (pet visualization in home)
   - Integration with other pet adoption APIs

## Contributing

This roadmap is a living document. Features may be added, removed, or reprioritized based on:

- User feedback
- Technical feasibility
- API capabilities and limitations
- Development resources

## Notes

- All features should follow the project's coding standards and conventions
- Each feature should include appropriate tests
- API rate limits and costs should be considered for all RescueGroups API features
- Performance and user experience are key priorities
