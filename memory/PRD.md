# Orbit CRM — Product Requirements Document

## Original Problem Statement
Build Orbit — a personal and professional relationship CRM powered by AI. React frontend with localStorage persistence, mocked Claude AI features, 9 screens.

## Architecture
- **Frontend**: React SPA with client-side routing (react-router-dom)
- **Data**: localStorage (no backend required)
- **AI**: All features mocked with realistic hardcoded responses
- **Styling**: Tailwind CSS + shadcn/ui components
- **Design**: Clean flat premium UI (Linear meets Notion aesthetic)

## User Persona
- **Name**: Arkin Sanghi
- **Program**: Full-time MBA, CMU Tepper
- **LinkedIn**: https://www.linkedin.com/in/arkin-sanghi/

## Core Requirements
1. Dashboard with personalized greeting, metric cards, outreach sections
2. My Network with search, filter pills, card/list views
3. Contact Detail with AI summary, recommendations, timeline
4. Add Contact with URL/paste/manual tabs and AI extraction
5. Linked Apps with CSV import flow
6. Import Review and Manual Review screens
7. Activity Feed (chronological, grouped by date)
8. Profile with network stats and settings
9. Contextual Warmth Engine (warm/strong/lukewarm/cold)
10. Collapsible sidebar navigation

## What's Been Implemented (March 13, 2026)
- All 9 screens fully functional
- 10 pre-populated demo contacts with realistic data
- 20 seed interactions, 12 seed activities
- Warmth color system (warm/strong/lukewarm/cold pills)
- Dashboard: greeting, metrics, TODAY/THIS WEEK/OVERDUE sections, FAB
- My Network: search, filters, card/list toggle, overdue flags
- Contact Detail: AI summary, recommendation, timeline, edit, add interaction
- Add Contact: 3 tabs, mocked AI extraction, duplicate detection
- Linked Apps: 4 integration cards, CSV upload flow
- Import Review: radio options, stats cards
- Manual Review: checkbox selection, import flow
- Activity: chronological log, date grouping, icon color coding
- Profile: user info, 4-stat network snapshot, settings modals
- Notification bell with count badge
- CSV export functionality
- gh-pages deployment configured (homepage, predeploy, deploy scripts, 404.html SPA redirect, BrowserRouter basename)
- All 26 features passed testing (100% success rate)

## Prioritized Backlog
### P0 (Critical)
- None — all core features implemented

### P1 (Important)
- Real Claude API integration (replace mocks)
- Actual LinkedIn profile scraping
- Google Calendar OAuth integration
- Data backup/sync mechanism

### P2 (Nice to Have)
- Birthday/job change context triggers
- Drag-and-drop contact organization
- Dark mode theme
- Mobile responsive layout
- Email draft composition with AI
- Real-time notifications
- Contact grouping/folders

## Next Tasks
1. Replace mocked AI with live Claude API integration
2. Add real CSV parsing with edge case handling
3. Implement Google Calendar event integration
4. Add contact photo/avatar uploads
5. Build email/LinkedIn draft composer
