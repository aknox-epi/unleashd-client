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
- Opt-in toggle for changelog notifications
- Version tracking and comparison (isNewerVersion)
- Changelog parsing from CHANGELOG.md
- Collapsible filter section with Accordion
- Timeline filtering (latest, 7/30 days, 3 months, all time)
- Type filtering with checkboxes (Features, Fixes, Docs, Build, etc.)
- Drawer with comprehensive changelog display
- Persistent user preferences via AsyncStorage
- 100% test coverage for What's New feature (75 tests)

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

- Comprehensive test coverage (249+ tests passing)
- 99%+ coverage for API integrations
- 95%+ coverage for critical services
- Pre-commit hooks (lint, format, test staged files)
- Pre-push hooks (full test suite with coverage)
- Jest configured with Expo preset
- React Test Renderer for component testing
- Mock implementations for external dependencies
- Coverage reports generated in coverage/ directory

**Development Workflow:**

- Modified GitHub Flow (main ← dev ← feature branches)
- Release branch workflow (release → dev → main)
- Regular merge strategy (no squash merge to preserve history)
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
- Clear separation of concerns between docs
- Cross-linking for easy navigation
- API integration documentation with examples
- Testing guidelines and coverage standards
- Release process documentation (10-step workflow)
- Merge strategy documentation (regular merge only)

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
- Heart button with haptic feedback on interactions
- Visual indicators for favorited pets (filled red heart)
- Persist favorites locally with AsyncStorage
- Dedicated Favorites tab in navigation
- Remove from favorites functionality
- Favorites count badge on tab icon

**Favorites Tab:**

- Grid display of favorited pets
- Pull-to-refresh functionality
- Empty state with helpful message
- Sort by most recently favorited
- Tap to view pet details
- Favorites counter in header

**Implementation:**

- FavoritesContext with React Context API
- O(1) favorite lookup performance (Set-based)
- Versioned storage schema for future migrations
- 100% test coverage (20 comprehensive tests)
- Optimistic updates for instant UI feedback

## Planned Features

### 🔍 Pet Search & Discovery Enhancements

#### Advanced Filtering

- Filter by age range (puppy/kitten, young, adult, senior)
- Filter by size (small, medium, large, extra large)
- Filter by location/distance (zip code + radius)
- Filter by gender (male, female, unknown)
- Filter by special needs
- Filter by good with kids/dogs/cats
- Multi-filter support (combine multiple filters)
- Save filter preferences locally

#### Sorting & Organization

- Sort by newest listings
- Sort alphabetically by name
- Sort by distance from location
- Sort by age
- Recently viewed pets
- Remember sort preference

### 📱 Pet Details Enhancements

#### Interactive Features

- Pinch-to-zoom for images
- Add notes/comments for saved pets
- Mark pet as "contacted" or "applied"

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

   **Advanced Filtering** - Enhance search capabilities
   - Age range filter (puppy/kitten, young, adult, senior)
   - Size filter (small, medium, large, extra large)
   - Location/distance filter (zip code + radius)
   - Gender filter
   - Multi-filter support (combine filters)

2. **Medium Priority** (Next 2-3 Sprints)

   **Sorting Capabilities** - Organize search results
   - Sort by newest/oldest
   - Sort by distance (requires location filter first)
   - Sort alphabetically
   - Remember sort preference in AsyncStorage

   **Settings Enhancements** - User preferences
   - Location preference for searches
   - Default pet type preference
   - Search radius preference
   - Display preferences (grid/list)
   - Clear favorites functionality (in Settings)

   **Pet Details Polish** - Improve detail screen UX
   - Pinch-to-zoom for images
   - Recently viewed pets tracking
   - Add notes/comments for favorited pets

3. **Low Priority** (Future Sprints)
   - Status tab detailed metrics and dashboard
   - Social sharing enhancements
   - Push notifications system
   - Offline support and caching
   - Advanced accessibility features
   - User accounts and profile management

4. **Long-term / Research Needed**
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
