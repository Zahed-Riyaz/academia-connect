# Academia Connect

A professional networking platform built exclusively for researchers. Think LinkedIn, but stripped down to what academics actually need: discovering PhD openings, posting collaboration requests, connecting with peers across institutions, and messaging without noise.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Running the Project](#running-the-project)
4. [Architecture Deep Dive](#architecture-deep-dive)
   - [Backend](#backend-architecture)
   - [Frontend](#frontend-architecture)
   - [Data Flow](#data-flow)
5. [API Reference](#api-reference)
6. [Key Design Decisions](#key-design-decisions)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | Django 5.2 + Django REST Framework | Batteries-included: auth, ORM, admin, migrations — no assembly required |
| Auth | djangorestframework-simplejwt | Stateless JWT tokens, built-in blacklisting for logout |
| Database | PostgreSQL 16 | Relational integrity for social graph; native full-text search |
| Frontend | Next.js 16 (App Router) | SSR for SEO-indexable profiles; React ecosystem |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with pre-built accessible components |
| Server state | TanStack Query (React Query) | Caching, background refetch, infinite scroll, polling |
| Forms | React Hook Form + Zod | Type-safe validation with minimal re-renders |
| HTTP client | Axios | Interceptors for automatic JWT refresh |

---

## Project Structure

```
academia-connect/
├── backend/                    Django project
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py         Shared settings (all environments)
│   │   │   ├── development.py  Local dev overrides (DEBUG, SQLite-free, CORS)
│   │   │   └── production.py   Prod overrides (S3, HTTPS cookies, allowed hosts)
│   │   ├── urls.py             Root URL dispatcher
│   │   ├── wsgi.py
│   │   └── asgi.py             Ready for WebSocket upgrade (Django Channels)
│   ├── apps/
│   │   ├── users/              User model, profiles, publications, research interests
│   │   ├── auth_api/           Register, login, logout, password change
│   │   ├── connections/        Connection requests + unidirectional follows
│   │   ├── opportunities/      Job/collab postings, bookmarks, filters
│   │   ├── feed/               Aggregated opportunity feed (no separate DB table)
│   │   └── messaging/          1:1 conversations and messages
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env                    Environment variables (never commit this)
│
└── frontend/                   Next.js project
    ├── app/
    │   ├── (auth)/             Login, register pages (no sidebar layout)
    │   └── (main)/             All protected pages (with sidebar layout)
    ├── components/
    │   ├── ui/                 shadcn/ui primitives (do not edit manually)
    │   ├── layout/             Sidebar, top navigation
    │   ├── opportunities/      OpportunityCard, filters
    │   ├── connections/        Connection buttons, request cards
    │   ├── messaging/          Conversation list, message thread
    │   └── common/             UserAvatar, RoleBadge, shared utilities
    └── lib/
        ├── api/                One file per domain (auth, users, opportunities…)
        ├── providers/          AuthProvider (token state), QueryProvider
        ├── types/              TypeScript interfaces matching the API
        └── utils/              Role colors, opportunity labels, formatting
```

---

## Running the Project

### Prerequisites

- [Miniconda or Anaconda](https://docs.anaconda.com/miniconda/)
- [Homebrew](https://brew.sh) (macOS)
- Node.js 18+

---

### Step 1 — Clone and enter the project

```bash
git clone <your-repo-url>
cd "academia-connect"
```

---

### Step 2 — Set up PostgreSQL

Install and start PostgreSQL via Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

Add PostgreSQL to your PATH (add this to `~/.zshrc` or `~/.bashrc` for persistence):

```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
```

Create the database:

```bash
createdb academia_connect
```

---

### Step 3 — Set up the Python environment

Create and activate the conda environment:

```bash
conda create -n connect python=3.11 -y
conda activate connect
```

Install all backend dependencies:

```bash
cd backend
pip install -r requirements-dev.txt
```

---

### Step 4 — Configure environment variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

Open `.env` and set these values:

```env
SECRET_KEY=any-long-random-string-here
DJANGO_SETTINGS_MODULE=config.settings.development

DB_NAME=academia_connect
DB_USER=your_macos_username    # run: whoami
DB_PASSWORD=                   # leave blank for Homebrew Postgres
DB_HOST=localhost
DB_PORT=5432
```

> **Tip:** On macOS with Homebrew PostgreSQL, `DB_USER` is your system username (output of `whoami`) and `DB_PASSWORD` is empty.

---

### Step 5 — Run database migrations

This creates all tables in PostgreSQL:

```bash
# Make sure you are inside the backend/ directory with (connect) active
python manage.py migrate --settings=config.settings.development
```

---

### Step 6 — Create an admin user (optional but recommended)

```bash
python manage.py createsuperuser --settings=config.settings.development
```

You will be prompted for email, username, and password. The admin panel is at `http://localhost:8000/admin`.

---

### Step 7 — Start the Django backend

```bash
python manage.py runserver 8000 --settings=config.settings.development
```

The API is now live at `http://localhost:8000/api/v1/`.

---

### Step 8 — Set up and start the frontend

Open a new terminal tab:

```bash
cd frontend
npm install
```

Copy the environment file:

```bash
cp .env.local.example .env.local
```

`.env.local` should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the dev server:

```bash
npm run dev
```

The app is now live at `http://localhost:3000`.

---

### Step 9 — Register your first account

Open `http://localhost:3000/register`, pick a role, and create an account. The backend will:

1. Hash your password and store the user
2. Auto-create a `UserProfile` via a Django signal
3. Return a JWT access token + refresh token
4. Redirect you to `/feed`

---

### Stopping everything

```bash
# Stop Next.js: Ctrl+C in its terminal

# Stop Django: Ctrl+C in its terminal

# Stop PostgreSQL (optional)
brew services stop postgresql@16
```

---

### Restarting after a reboot

```bash
brew services start postgresql@16
conda activate connect
cd backend && python manage.py runserver 8000 --settings=config.settings.development
# (new tab)
cd frontend && npm run dev
```

---

## Architecture Deep Dive

### Backend Architecture

The Django project follows a **multi-app architecture** where each domain of the product is its own Django app inside `backend/apps/`. Each app owns its models, serializers, views, and URLs — nothing leaks between them except through explicit imports.

#### App Responsibilities

**`apps/users`** — The foundation. Every other app foreign-keys to `User`.

```
User (AbstractUser)
  ├── email            — used as the login identifier (not username)
  ├── role             — professor | phd_student | masters_student |
  │                      undergraduate | independent_researcher
  └── UserProfile (OneToOne)
        ├── bio, institution, department, location
        ├── google_scholar_url, orcid_id, linkedin_url
        └── research_interests (ManyToMany → ResearchInterest)

ResearchInterest       — tag system (e.g. "Machine Learning", "Quantum Computing")
Publication            — manually entered papers, linked to User
```

A Django **signal** in `apps/users/signals.py` automatically creates a `UserProfile` the moment a `User` is saved for the first time, so the profile always exists and you never need to null-check it.

---

**`apps/auth_api`** — Thin authentication layer on top of simplejwt.

- `RegisterView`: creates the user, returns both tokens immediately so the client is logged in right after signup
- `LogoutView`: blacklists the refresh token so it cannot be reused, even if someone has it
- JWT tokens are configured in `base.py`:
  - Access token: **15 minutes** (short-lived, lives in memory)
  - Refresh token: **7 days** (long-lived, lives in an `httpOnly` cookie)

---

**`apps/connections`** — The social graph. Two separate models with different semantics:

```
Connection (bidirectional, requires approval)
  sender   ──FK──▶ User
  receiver ──FK──▶ User
  status: pending | accepted | rejected
  unique_together: (sender, receiver)   ← one row per pair, not two

Follow (unidirectional, no approval)
  follower  ──FK──▶ User
  following ──FK──▶ User
  unique_together: (follower, following)
```

Why two models? **Connections** model mutual academic peers — you send a request, they accept. **Follows** model lightweight subscriptions — a student can follow a famous professor's posts without the professor needing to do anything. Both contribute to the feed.

The `ConnectionStatusView` endpoint (`GET /connections/status/<user_id>/`) computes the relationship between the current user and any other user, returning one of: `none`, `pending_sent`, `pending_received`, `connected`, `following`, `followed_by`, `mutual_follow`. The frontend uses this single endpoint to decide which buttons to render on a profile page.

---

**`apps/opportunities`** — The core content type.

```
Opportunity
  author          ──FK──▶ User
  opportunity_type: ra_position | phd_opening | masters_opening |
                    postdoc | collaboration | project | internship | other
  required_role   — who can apply (any | specific role)
  research_areas  ──M2M──▶ ResearchInterest
  funding_available, stipend_details, deadline
  is_active       — soft delete / close an opportunity

OpportunityBookmark
  user        ──FK──▶ User
  opportunity ──FK──▶ Opportunity
  unique_together: (user, opportunity)   ← one bookmark per pair
```

Filtering is handled by `django-filter` via `OpportunityFilter` in `apps/opportunities/filters.py`. This maps URL query parameters like `?type=phd_opening&is_remote=true` directly to queryset filters without any manual parsing.

---

**`apps/feed`** — No database model. The feed is computed at read time with a single optimized query:

```python
# Pseudocode for how the feed query works
network_ids = (
    all users you have an accepted Connection with
    UNION
    all users you Follow
)

Opportunity.objects
    .filter(author_id__in=network_ids, is_active=True)
    .select_related('author', 'author__profile')   # avoids N+1 on author
    .prefetch_related('research_areas', 'bookmarked_by')  # avoids N+1 on M2M
    .order_by('-created_at')
```

`select_related` and `prefetch_related` are critical here — without them, fetching 20 opportunities would fire 60+ database queries. With them, it's always 3 queries regardless of page size.

The feed uses **cursor pagination** (not page numbers). This means the client gets a cursor token pointing to its position in the result set. If new items are posted while you scroll, you won't see duplicates or skip items.

---

**`apps/messaging`** — 1:1 conversations.

```
Conversation
  participants ──M2M──▶ User   (exactly 2 in practice, enforced at view layer)
  updated_at                   (bumped on every new message, used for inbox ordering)

Message
  conversation ──FK──▶ Conversation
  sender       ──FK──▶ User
  content
  is_read      — marked True when the other user fetches the messages
```

When `POST /conversations/` is called with a `user_id`, the view first checks if a conversation between these two users already exists and returns it if so — you never create duplicates.

---

#### Settings Structure

Settings are split into three files that inherit from each other:

```
base.py          ← shared across all environments
  └── development.py   ← DEBUG=True, CORS open to localhost:3000
  └── production.py    ← secure cookies, S3 storage, allowed hosts from env
```

The active settings module is selected via the `DJANGO_SETTINGS_MODULE` environment variable in `.env`. This means you never touch base.py to switch environments.

---

### Frontend Architecture

The Next.js app uses the **App Router** with two route groups that share different layouts:

```
(auth)/      → centered card layout, no sidebar, accessible without login
(main)/      → protected layout with sidebar; redirects to /login if not authenticated
```

#### Authentication Flow

Authentication state lives in `AuthProvider` (`lib/providers/AuthProvider.tsx`). The key design choice: **the access token is never stored in localStorage** (XSS risk). Instead:

- Access token → **React state** (in-memory, lost on page refresh)
- Refresh token → **`httpOnly` cookie** set by Django (inaccessible to JavaScript)

On every page load, `AuthProvider` fires a silent `POST /auth/token/refresh/` request. The browser automatically sends the refresh cookie, Django validates it and returns a new access token, which gets stored in memory. This is the "silent refresh" pattern — the user stays logged in across browser sessions without any token being readable by JavaScript.

If any API call returns a 401, the Axios interceptor in `lib/api/client.ts` automatically retries the refresh before propagating the error.

```
Page loads
    │
    ▼
AuthProvider.useEffect()
    │
    ├── POST /auth/token/refresh/  (cookie sent automatically)
    │       │
    │       ├── success → setAccessToken(newToken) → fetch /users/me/ → setUser()
    │       └── fail    → user is null → redirect to /login
    │
    ▼
All API calls attach: Authorization: Bearer <accessToken>
    │
    └── 401 response → interceptor retries refresh → retry original request
```

#### API Layer

Each domain has its own file in `lib/api/`:

```
lib/api/
  client.ts        → Axios instance (base URL, JWT attach interceptor, refresh-on-401)
  auth.ts          → register, login, logout, changePassword
  users.ts         → getMe, updateMe, uploadAvatar, publications, researchInterests
  connections.ts   → connect, follow, getStatus, listConnections
  opportunities.ts → CRUD, filters, bookmarks
  feed.ts          → getFeed, getDiscover
  messaging.ts     → conversations, messages, unreadCount
```

All functions return raw Axios response promises. The consuming hooks (TanStack Query) handle caching, loading states, and error states.

#### Server State with TanStack Query

All API data is managed by TanStack Query. Key patterns used:

- **`useQuery`** for data that needs to be fetched once and cached (profile, opportunity detail, connection list)
- **`useInfiniteQuery`** for paginated lists that grow as you scroll (feed, discover)
- **`useMutation`** for writes (send message, accept connection, bookmark). After a mutation succeeds, related queries are invalidated with `queryClient.invalidateQueries()` so the UI updates automatically
- **`refetchInterval`** for the message thread (4 seconds) and unread count (15 seconds) — this is the polling strategy for real-time-ish messaging without WebSockets

---

### Data Flow

Here is the complete flow for a typical action — a student sending a connection request to a professor:

```
1. User clicks "Connect" on /profile/42

2. Frontend
   ConnectionButton onClick
   → useMutation calls connectionsApi.sendRequest(42)
   → POST /api/v1/connections/ { receiver_id: 42 }
     with Authorization: Bearer <accessToken>

3. Axios interceptor attaches the token, sends request

4. Django
   CorsMiddleware: checks Origin header against CORS_ALLOWED_ORIGINS ✓
   JWTAuthentication: decodes Bearer token, loads request.user ✓
   ConnectionListCreateView.perform_create()
     → checks for existing connection (avoids duplicates)
     → Connection.objects.create(sender=request.user, receiver=user_42, status='pending')
   Returns 201 { id: 7, sender: {...}, receiver: {...}, status: 'pending' }

5. Frontend
   mutation.onSuccess()
   → queryClient.invalidateQueries(['connection-status', 42])
   → ConnectionStatusView is re-fetched: returns { status: 'pending_sent' }
   → Button re-renders as "Pending" (disabled)
   → toast.success('Connection request sent')
```

---

## API Reference

All endpoints require `Authorization: Bearer <token>` unless marked public.

### Auth (`/api/v1/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/` | Create account. Returns user + tokens. |
| POST | `/login/` | Returns access + refresh tokens. |
| POST | `/token/refresh/` | Exchange refresh cookie for new access token. |
| POST | `/logout/` | Blacklists the refresh token. |
| POST | `/password/change/` | Change password (requires old password). |

### Users (`/api/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/` | List/search users. Supports `?search=`, `?role=`, `?institution=` |
| GET | `/users/<id>/` | Public profile with publications |
| GET | `/users/me/` | Own profile |
| PATCH | `/users/me/` | Update name, profile fields, research interests |
| POST | `/users/me/avatar/` | Upload profile picture (multipart/form-data) |
| GET/POST | `/users/me/publications/` | List or add publications |
| GET/PUT/DELETE | `/users/me/publications/<id>/` | Manage a specific publication |
| GET/POST | `/research-interests/` | Browse or create research interest tags |

### Connections (`/api/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/connections/` | My accepted connections |
| POST | `/connections/` | Send request `{ receiver_id }` |
| GET | `/connections/requests/` | Pending requests received |
| GET | `/connections/sent/` | Pending requests I sent |
| PATCH | `/connections/<id>/` | Accept or reject `{ status: "accepted" }` |
| DELETE | `/connections/<id>/` | Remove connection |
| GET | `/connections/status/<user_id>/` | Relationship status with a user |
| GET | `/follows/` | Who I follow |
| GET | `/follows/followers/` | Who follows me |
| POST | `/follows/` | Follow a user `{ user_id }` |
| DELETE | `/follows/<id>/` | Unfollow |

### Opportunities (`/api/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/opportunities/` | Browse all. Filters: `?type=`, `?required_role=`, `?research_area=`, `?is_remote=`, `?funding_available=`, `?search=` |
| POST | `/opportunities/` | Post a new opportunity |
| GET | `/opportunities/<id>/` | Detail view |
| PATCH | `/opportunities/<id>/` | Edit (author only) |
| DELETE | `/opportunities/<id>/` | Delete (author only) |
| GET | `/opportunities/my/` | Opportunities I have posted |
| GET | `/bookmarks/` | My saved opportunities |
| POST | `/bookmarks/` | Save `{ opportunity_id }` |
| DELETE | `/bookmarks/<opportunity_id>/` | Unsave |

### Feed (`/api/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feed/` | Opportunities from connections + follows. Cursor-paginated. |
| GET | `/feed/discover/` | Opportunities outside network matching your research interests |

### Messaging (`/api/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/` | My conversations, sorted by most recent message |
| POST | `/conversations/` | Start or retrieve conversation `{ user_id }` |
| GET | `/conversations/<id>/` | Conversation detail + participants |
| GET | `/conversations/<id>/messages/` | Paginated messages (marks unread as read) |
| POST | `/conversations/<id>/messages/` | Send `{ content }` |
| GET | `/conversations/unread-count/` | Total unread badge count |

---

## Key Design Decisions

### Why two social graph models (Connection + Follow)?

A pure mutual-connection model (like LinkedIn) forces both parties to act. A pure follow model (like Twitter) has no concept of mutual peers. Academia needs both:

- **Connection** — when you want to establish a bilateral academic relationship with someone at your level. Requires accept/reject.
- **Follow** — when a student wants to see a famous professor's posts without expecting reciprocity. Zero friction.

Both contribute to the feed.

### Why is the feed computed at read time, not write time?

The alternative (fanout-on-write) precomputes each user's feed whenever someone posts. This is how Twitter scaled, but it adds infrastructure complexity (background jobs, a fanout table) and is only necessary at very high scale. For a research network, computing the feed on read with an optimized PostgreSQL query and proper indexes is fast enough and simpler to reason about.

### Why polling instead of WebSockets for messaging?

WebSockets (Django Channels + Redis + Daphne) is the correct long-term solution. For an MVP it adds: a channel layer, a Redis instance, an ASGI deployment, and a different server setup entirely. The current implementation polls every 4 seconds when the tab is active — invisible to the user at this scale, and the model layer is identical. Upgrading later requires only changing the hooks and adding the Channels config; no model or migration changes.

### Why is the access token stored in React state and not localStorage?

Any JavaScript that runs on your page can read `localStorage`. If there is ever an XSS vulnerability anywhere in the app (a third-party script, a user-submitted string that escapes sanitization), an attacker can steal the token and impersonate the user indefinitely. By keeping the access token in memory (a React state variable), it is destroyed when the tab closes and is unreachable to injected scripts. The refresh token in an `httpOnly` cookie is also unreachable to JavaScript — only the browser sends it, only to the same origin, and only over HTTPS in production.

### Why split settings into base/development/production?

The `DEBUG = True` setting must never reach production — it exposes full stack traces and internal state. The split makes this impossible to forget: each environment file only adds or overrides what it needs. The active file is selected by a single environment variable (`DJANGO_SETTINGS_MODULE`), so switching from dev to prod is one config change, not a code change.
