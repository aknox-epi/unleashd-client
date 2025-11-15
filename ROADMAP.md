# Unleashd Client Roadmap

This document outlines potential features and enhancements for the Unleashd pet adoption app.

## Current Status

### ✅ Completed Features

- Tab-based navigation (Explore, Settings, Status)
- RescueGroups API integration and context
- Theme switcher (light/dark mode) in Settings tab
- API health status monitoring
- Basic project structure and development workflow
- What's New / Changelog notification system with opt-in toggle
- Animated sparkle badge for new version notifications
- Version tracking and changelog parsing
- Advanced changelog filtering (by timeline and section types)
- Comprehensive test coverage for What's New feature (100% coverage)

## Planned Features

### 🔍 Pet Search & Discovery

#### Enhance Explore Tab

- Implement pet search functionality using RescueGroups API
- Display search results in a scrollable list/grid
- Add loading states and error handling
- Implement pull-to-refresh functionality

#### Filtering & Sorting

- Filter by pet type (dog, cat, etc.)
- Filter by age range (puppy, adult, senior)
- Filter by size (small, medium, large)
- Filter by location/distance
- Sort options (newest, alphabetical, distance)
- Save filter preferences

### 📱 Pet Details

#### Detail View

- Create dedicated pet detail screen
- Display comprehensive pet information (photos, description, characteristics)
- Show adoption requirements and process
- Display shelter/rescue organization info
- Add contact/inquiry functionality

#### Photo Gallery

- Implement image carousel/gallery for pet photos
- Add pinch-to-zoom functionality
- Support multiple photos per pet

### ⭐ Favorites & Saved Pets

#### Favorites System

- Add ability to favorite/save pets
- Create favorites tab or section
- Persist favorites locally (AsyncStorage)
- Add visual indicator for favorited pets
- Allow removing from favorites

### ⚙️ Settings Enhancements

#### User Preferences

- Location/zip code preference for search radius
- Default pet type preference
- Notification preferences (future)
- Search radius preference
- Display preferences (grid vs list view)

#### App Settings

- Clear cache option
- About section (app version, credits)
- Privacy policy and terms of service links
- Feedback/support contact

#### What's New / Changelog Notifications

**Current Implementation:**

- ✅ Basic What's New drawer with opt-in toggle
- ✅ Animated sparkle badge on Settings tab
- ✅ Version tracking and notification system
- ✅ Changelog parsing and display in drawer

**Future Enhancements:**

- 🔮 Push notifications for app updates (requires Expo Notifications setup)
- 🔮 Changelog category filtering (Features only, Fixes only, All)
- 🔮 Deep links from changelog items to specific features
- 🔮 "What's New" auto-modal on first launch after update
- 🔮 Share changelog feature (social media, email)

### 📊 Status Tab Enhancements

#### API Health Monitoring

- Add more detailed API health metrics
- Show API response time
- Display rate limit information
- Add connectivity status indicator
- Log recent API errors/warnings

### 🔔 Future Considerations

#### Notifications (Long-term)

- Push notifications for new pets matching criteria
- Favorites updates (e.g., pet adopted, status changed)
- Adoption application status updates

#### Social Features (Long-term)

- Share pet profiles via social media
- Share via text/email
- Add pet comparison feature

#### Offline Support (Long-term)

- Cache search results for offline viewing
- Queue actions when offline (favorites, etc.)
- Sync when connection restored

#### Accessibility (Long-term)

- Screen reader optimization
- High contrast mode
- Font size preferences
- Voice search capability

## Development Priorities

Priority order for next features (subject to change):

1. **High Priority**
   - Enhance Explore tab with pet search functionality
   - Implement filtering and sorting capabilities
   - Create pet detail view

2. **Medium Priority**
   - Add favorites/saved pets functionality
   - Enhance settings with user preferences
   - Improve status tab with detailed metrics

3. **Low Priority**
   - Social sharing features
   - Notifications system
   - Offline support
   - Advanced accessibility features

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
