# The Logos AI - Implementation Guide

## Overview
"The Logos" is an advanced strategic AI chatbot integrated into the Nexus productivity platform. It provides context-aware assistance, strategic analysis, and cross-module insights to enhance productivity and decision-making.

## Architecture

### Database Schema (`logos-database-setup.sql`)
- **logos_conversations**: Chat session management
- **logos_messages**: Individual messages with context
- **logos_knowledge_base**: Imported files and methodologies
- **logos_user_preferences**: User settings and preferences
- **logos_analytics**: Usage analytics and insights

### API Endpoints
- `POST /api/logos/chat` - Main chat endpoint with context gathering
- `GET/POST /api/logos/conversations` - Conversation management
- `GET/PUT /api/logos/preferences` - User preferences

### Frontend Components
- `LogosFloatingChat.tsx` - Main floating chat interface
- Integrated into `(app-layout)/layout.tsx` for global availability

## Features

### Core Capabilities
1. **Strategic Analysis**: Advanced problem-solving and decision support
2. **Context Awareness**: Automatic integration with all Nexus modules
3. **Conversation Management**: Persistent chat history and context
4. **Knowledge Integration**: Support for imported JSON/Excel files
5. **User Preferences**: Customizable AI personality and response style

### AI Personality
- **Name**: The Logos (representing reason, logic, and divine wisdom)
- **Character**: Strategic, analytical, forward-thinking advisor
- **Language**: Arabic/English with professional, executive tone
- **Focus**: Strategic thinking, challenge assumptions, provide actionable insights

### Context Integration
The Logos automatically gathers context from:
- **Projects**: Current active projects, deadlines, priorities
- **Tasks**: Incomplete tasks, overdue items, completion patterns
- **Notes**: Recent notes, AI summaries, pending analysis
- **Scenarios**: Risk assessments, scenario planning results
- **Journal Entries**: Mood patterns, personal insights

## Setup Instructions

### 1. Database Setup
```bash
# Run the database schema in Supabase SQL Editor
psql -h your-db-host -d your-db -f logos-database-setup.sql
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key  # Or other AI provider
```

### 3. Dependencies
All required dependencies are already included in `package.json`:
- `@supabase/supabase-js` - Database integration
- `@radix-ui/*` - UI components
- `lucide-react` - Icons

### 4. Knowledge Base Import
Use the provided script to import knowledge files:
```bash
# Import a single file
node scripts/import-knowledge.js "./data/strategy-framework.json" "methodology" 85

# Import entire directory
node scripts/import-knowledge.js "./books/" "literature" 70
```

## Usage

### Accessing The Logos
- The floating chat button appears on all pages within the app layout
- Click the brain icon to open the chat interface
- Start conversations naturally - The Logos will provide context-aware responses

### Conversation Features
- **Multiple Conversations**: Create and switch between different chat sessions
- **Context Display**: See what information The Logos is using from your Nexus data
- **Settings Panel**: Customize AI personality, response style, and preferences
- **Real-time Updates**: Live conversation updates and message delivery

### Strategic Interactions
The Logos is designed to:
- Challenge assumptions and identify blind spots
- Provide multiple strategic pathways for goals
- Analyze second and third-order implications
- Offer cross-module insights and connections
- Suggest proactive actions based on patterns

## Customization

### AI Personality Options
- **Analytical**: Data-driven, logical, systematic
- **Creative**: Innovative, lateral thinking, exploratory
- **Balanced**: Mix of analytical and creative approaches
- **Strategic**: Executive-level, big-picture focus

### Response Styles
- **Casual**: Friendly, conversational tone
- **Professional**: Business-appropriate communication
- **Academic**: Formal, research-oriented
- **Executive**: High-level, strategic focus

### Context Depth
- **Minimal**: Basic current context only
- **Standard**: Relevant recent activity
- **Comprehensive**: Full historical context and patterns

## Integration Points

### Module Context Sources
1. **The Catalyst** - Notes analysis and project generation status
2. **The Oracle** - Scenario planning and risk assessment data
3. **The Mirror** - Personal analytics and mood patterns
4. **The Nexus** - Project management and task completion
5. **The Archive** - Knowledge base and document insights

### Real-time Updates
- Supabase realtime subscriptions for live message delivery
- Automatic context refresh when module data changes
- Push notifications for important insights (future enhancement)

## Security Considerations

### Data Protection
- Row Level Security (RLS) enabled on all tables
- User-based access control (currently using mock user for development)
- Encrypted message storage and transmission

### API Security
- Service role key for server-side operations
- Input validation and sanitization
- Rate limiting and abuse prevention (to be implemented)

## Performance Optimization

### Database
- Optimized indexes for conversation and message queries
- Full-text search capabilities for knowledge base
- Efficient context gathering with limited result sets

### Frontend
- Lazy loading of conversation history
- Debounced input for real-time features
- Optimistic UI updates for better responsiveness

## Future Enhancements

### Planned Features
1. **Advanced Analytics Dashboard**: Conversation insights and productivity metrics
2. **Voice Integration**: Speech-to-text and text-to-speech capabilities
3. **Mobile App**: React Native companion app
4. **Team Collaboration**: Shared conversations and knowledge bases
5. **API Integrations**: External tools and services integration

### Knowledge Base Expansion
- Support for PDF, Word, and Excel file imports
- Automated content extraction and categorization
- Version control for knowledge updates
- Collaborative knowledge curation

## Troubleshooting

### Common Issues
1. **Chat not loading**: Check Supabase connection and environment variables
2. **Context not showing**: Verify module data exists and API permissions
3. **Slow responses**: Check AI provider API limits and database performance

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoint responses in Network tab
3. Check Supabase logs for database connection issues
4. Validate environment variables in server logs

## Development Notes

### Code Organization
- `/src/app/api/logos/` - API routes
- `/src/components/LogosFloatingChat.tsx` - Main UI component
- `/src/types/database.ts` - TypeScript interfaces
- `/scripts/import-knowledge.js` - Knowledge import utility

### Best Practices
- Follow established Nexus coding patterns
- Maintain TypeScript strict mode compliance
- Use error boundaries for graceful failure handling
- Implement proper loading states and user feedback

---

**The Logos AI** represents the next evolution in productivity assistance - not just answering questions, but providing strategic guidance that adapts to your unique work patterns and goals within the Nexus ecosystem.
