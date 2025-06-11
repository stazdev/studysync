# StudySync - AI-Powered Collaborative Learning Platform

StudySync is a modern web application that combines AI-powered study assistance with collaborative learning features. Upload documents, generate quizzes, join study groups, and get personalized help from AI study buddies.

## Features

- 🤖 **AI Study Buddy**: Personalized AI tutors with different personalities
- 📚 **Document Analysis**: Upload PDFs, images, and text for AI-powered analysis
- 🧠 **Smart Quizzes**: Auto-generated quizzes from your study materials
- 👥 **Study Groups**: Collaborative learning with real-time chat
- 📊 **Progress Tracking**: Monitor your learning journey with detailed analytics
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Quick Setup

### 1. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

### 2. Database Setup

**Important**: You need to run the database migration to set up all required tables and functions.

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250611170600_fix_missing_tables.sql`
4. Run the migration

This will create all necessary:
- Tables (profiles, study_groups, notifications, etc.)
- Functions (get_user_stats, mark_notification_read, etc.)
- Row Level Security policies
- Storage buckets and policies

### 3. API Keys Setup

#### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon/public key

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 4. Install and Run

```bash
npm install
npm run dev
```

## Database Schema

The application uses the following main tables:
- `profiles` - User profile information
- `study_groups` - Study group data
- `group_members` - Group membership relationships
- `study_materials` - Uploaded content and analysis
- `notifications` - User notifications
- `quizzes` - Quiz definitions and attempts
- `chat_messages` - Group chat messages

## Troubleshooting

### Common Issues

1. **"Function not found" errors**: Make sure you've run the database migration
2. **"Table does not exist" errors**: Run the migration script in Supabase SQL Editor
3. **Gemini API 403 errors**: Check that your API key is valid and properly set
4. **Authentication issues**: Verify your Supabase credentials

### Database Migration

If you're getting database-related errors, run this SQL in your Supabase SQL Editor:

```sql
-- Copy the entire contents of supabase/migrations/20250611170600_fix_missing_tables.sql
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details