# Task Management Application

A modern, scalable, and secure web application built with React, TypeScript, and Supabase featuring authentication, user profiles, and full CRUD operations for task management.

## Features

### Authentication
- User registration with email/password
- Secure login with JWT tokens
- Password hashing (bcrypt via Supabase)
- Protected routes (authentication required)
- Session management with auto-refresh
- Logout functionality

### User Profile Management
- View user profile information
- Update profile (full name)
- Profile automatically created on signup
- Email and timestamps displayed

### Task Management (CRUD Operations)
- **Create**: Add new tasks with title, description, status, and priority
- **Read**: View all tasks with filtering and search
- **Update**: Edit existing tasks (all fields)
- **Delete**: Remove tasks with confirmation

### Dashboard Features
- Real-time task display
- Search tasks by title/description
- Filter by status (pending, in_progress, completed)
- Filter by priority (low, medium, high)
- Task count display
- Responsive design for all devices
- Visual status indicators
- Priority badges with color coding

### Security & Validation
- Client-side form validation
- Server-side validation via database constraints
- Row Level Security (RLS) policies
- Users can only access their own data
- Input sanitization
- HTTPS enforced by default

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Authentication service
  - Auto-generated REST API
  - Row Level Security (RLS)

### Tools & Libraries
- **@supabase/supabase-js** - Supabase client library
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard with tasks
│   │   ├── Login.tsx           # Login form
│   │   ├── Signup.tsx          # Registration form
│   │   ├── TaskModal.tsx       # Task create/edit modal
│   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── lib/
│   │   └── supabase.ts         # Supabase client configuration
│   ├── utils/
│   │   └── validation.ts       # Form validation utilities
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── database/
│   └── schema.sql              # Database schema and migrations
├── API_DOCUMENTATION.md        # Complete API documentation
├── SCALABILITY.md              # Scalability and production notes
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd project
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Supabase**:

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Get your project URL and anon key from Settings > API

   c. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run database migrations**:

   a. Go to Supabase Dashboard > SQL Editor

   b. Copy contents of `database/schema.sql`

   c. Execute the SQL script

5. **Start development server**:
```bash
npm run dev
```

6. **Open browser**:
Navigate to `http://localhost:5173`

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npm run typecheck
```

---

## Usage

### 1. Sign Up
- Click "Sign up" on the login page
- Enter full name, email, and password (min 6 characters)
- Submit form to create account
- Automatically logged in after signup

### 2. Sign In
- Enter registered email and password
- Click "Sign In" to authenticate
- Redirected to dashboard on success

### 3. Manage Tasks

**Create Task**:
- Click "New Task" button
- Fill in title (required, 3-100 chars)
- Add description (optional, max 500 chars)
- Select status and priority
- Click "Create Task"

**View Tasks**:
- All tasks displayed in list view
- Status icon and color coding
- Priority badges

**Search & Filter**:
- Use search bar to find tasks by title/description
- Filter by status dropdown
- Filter by priority dropdown
- Filters work together

**Edit Task**:
- Click edit icon on task card
- Modify any fields
- Click "Update Task" to save

**Delete Task**:
- Click delete icon on task card
- Confirm deletion in popup
- Task permanently removed

### 4. Profile Management
- View profile information in dashboard header
- Click "Edit Profile" to update full name
- Save changes to update profile

### 5. Sign Out
- Click "Sign Out" button in header
- Session terminated
- Redirected to login page

---

## API Documentation

Comprehensive API documentation is available in `API_DOCUMENTATION.md`, including:

- Authentication endpoints
- Profile management endpoints
- Task CRUD endpoints
- Request/response examples
- Error handling
- Security details
- Rate limiting
- Client-side usage examples
- cURL/Postman examples

---

## Database Schema

### Tables

**profiles**:
```sql
id          uuid PRIMARY KEY
email       text UNIQUE NOT NULL
full_name   text NOT NULL
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

**tasks**:
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES profiles(id)
title       text NOT NULL
description text DEFAULT ''
status      text DEFAULT 'pending'
priority    text DEFAULT 'medium'
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only view their own data
- Users can only modify their own data
- No unauthorized access possible

See `database/schema.sql` for complete schema definition.

---

## Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Session management with refresh tokens
- Automatic token refresh

### Database Security
- Row Level Security (RLS) enabled
- Foreign key constraints
- Check constraints for valid values
- Automatic timestamps

### Input Validation
- Client-side validation for immediate feedback
- Server-side validation via database constraints
- XSS prevention through React
- SQL injection prevention through parameterized queries

### Network Security
- HTTPS enforced by default
- CORS properly configured
- Secure headers

---

## Scalability

The application is designed for scalability from day one. See `SCALABILITY.md` for detailed information on:

- Database optimization strategies
- Frontend performance optimizations
- Caching strategies
- Load balancing
- Monitoring and observability
- Deployment architecture
- Cost optimization
- Horizontal scaling strategies

---

## Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Sign up with valid data
- [ ] Sign up with invalid email
- [ ] Sign up with short password
- [ ] Sign up with duplicate email
- [ ] Sign in with correct credentials
- [ ] Sign in with incorrect credentials
- [ ] Sign out

**Profile Management**:
- [ ] View profile information
- [ ] Update profile name
- [ ] Cancel profile edit

**Task Management**:
- [ ] Create task with all fields
- [ ] Create task with only required fields
- [ ] Edit task
- [ ] Delete task
- [ ] Search tasks
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Multiple filters together

**Edge Cases**:
- [ ] Empty task list
- [ ] Very long task title/description
- [ ] Special characters in inputs
- [ ] Rapid consecutive actions
- [ ] Browser refresh during session

---

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Platforms

**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify**:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Other Options**:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages

### Environment Variables

Set these in your deployment platform:
```
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
```

---

## Performance

Current build metrics:
- **CSS**: 15.69 KB (3.73 KB gzipped)
- **JavaScript**: 296.45 KB (86.04 KB gzipped)
- **Total Build Time**: < 4 seconds

Performance targets:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Common Issues

**Build fails**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection error**:
- Verify `.env` file exists with correct values
- Check Supabase project is active
- Verify API keys are correct

**Authentication not working**:
- Check database migrations are run
- Verify RLS policies are enabled
- Check browser console for errors

**Tasks not loading**:
- Verify user is authenticated
- Check RLS policies allow user access
- Inspect network tab for API errors

---

## Code Quality

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

### Code Style
- TypeScript strict mode enabled
- ESLint configured for React/TypeScript
- Consistent naming conventions
- Component-based architecture

---

## Contributing

When contributing to this project:

1. Follow existing code structure
2. Maintain TypeScript strict mode
3. Add proper types for all components
4. Validate all user inputs
5. Test authentication flows
6. Ensure RLS policies are correct
7. Update documentation as needed

---

## License

This project is created for the Frontend Developer Intern assignment.

---

## Contact

For questions or issues, please refer to:
- API Documentation: `API_DOCUMENTATION.md`
- Scalability Notes: `SCALABILITY.md`
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev

---

## Assignment Requirements Checklist

### Frontend
- [x] Built with React.js
- [x] Responsive design with TailwindCSS
- [x] Forms with validation (client + server)
- [x] Protected routes (login required)

### Backend
- [x] User signup/login (JWT-based)
- [x] Profile fetching/updating
- [x] CRUD operations on tasks entity
- [x] Connected to PostgreSQL database

### Dashboard
- [x] Display user profile
- [x] CRUD operations on tasks
- [x] Search and filter UI
- [x] Logout flow

### Security & Scalability
- [x] Password hashing (via Supabase)
- [x] JWT authentication
- [x] Error handling & validation
- [x] Code structured for scaling

### Deliverables
- [x] Frontend + Backend in GitHub repo
- [x] Functional authentication (register/login/logout)
- [x] Dashboard with CRUD-enabled entity
- [x] API documentation (API_DOCUMENTATION.md)
- [x] Scalability notes (SCALABILITY.md)

---

## Project Highlights

### Security First
- Row Level Security ensures data isolation
- JWT tokens for stateless authentication
- Comprehensive input validation
- Industry-standard password hashing

### Performance Optimized
- Code splitting with Vite
- Tree shaking for minimal bundle size
- Lazy loading components
- Optimized database queries with indexes

### Developer Experience
- TypeScript for type safety
- ESLint for code quality
- Hot module replacement in dev
- Clear component structure

### Production Ready
- Comprehensive error handling
- Loading states for all async operations
- Responsive design for all devices
- Scalable architecture documented

---

**Built with modern web technologies for a secure, scalable, and performant user experience.**
