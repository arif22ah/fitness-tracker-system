# Fitness Tracker — Nutrition & Calorie Tracking

A modern full-stack fitness/nutrition tracker.

**Stack**
- **Backend:** Django 5 + Django REST Framework + PostgreSQL, JWT auth (SimpleJWT)
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + Recharts
- **Infra:** Docker + Docker Compose

## Features
- User registration/login (JWT access + refresh tokens)
- Personal daily calorie/macro goals (stored on the user profile)
- Food library (global + user-created foods) with search
- Log meals per day (breakfast/lunch/dinner/snack, fractional servings)
- Daily summary: totals vs goals, macro breakdown pie chart, entry list

## Project layout
```
fitness-tracker/
├── docker-compose.yml
├── .env.example
├── backend/            # Django + DRF
│   ├── config/settings/{base,dev,prod}.py
│   └── apps/
│       ├── users/      # custom user model + auth endpoints
│       └── nutrition/  # FoodItem, MealEntry, daily summary endpoint
└── frontend/           # React + Vite + TS
    └── src/
        ├── api/client.ts       # axios instance + JWT refresh interceptor
        ├── context/AuthContext.tsx
        └── pages/{Login,Register,Dashboard,AddEntry}.tsx
```

## Quick start

```bash
cp .env.example .env          # adjust secrets as needed
docker compose up --build
```

- Backend API: http://localhost:8000/api/
- Frontend: http://localhost:5173
- Django admin: http://localhost:8000/admin/ (create a superuser first, see below)

Create a superuser (in a second terminal, while containers are running):
```bash
docker compose exec backend python manage.py createsuperuser
```

## API overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register/` | POST | Create account |
| `/api/auth/login/` | POST | Get JWT access + refresh tokens |
| `/api/auth/token/refresh/` | POST | Refresh access token |
| `/api/auth/me/` | GET/PATCH | View/update profile & goals |
| `/api/nutrition/foods/` | GET/POST | List/search foods, create custom food |
| `/api/nutrition/entries/` | GET/POST | List/log meal entries (filter by `date`, `meal_type`) |
| `/api/nutrition/entries/daily_summary/?date=YYYY-MM-DD` | GET | Daily totals vs goals + entries |

## Local (non-Docker) development

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=config.settings.dev
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Where to go next
- Add workout/exercise logging as a sibling app to `nutrition` (same pattern: model → serializer → viewset → router).
- Add progress charts (weight over time, calorie trends) with a `/stats/` endpoint + Recharts line chart.
- Swap SQLite-style dev settings for a real `prod.py` deploy (gunicorn + nginx + collectstatic) — a `prod` profile is already stubbed in `config/settings/prod.py`.
- Add a real food database (e.g. Open Food Facts / USDA FoodData Central) instead of manual food entry.
- CI: add GitHub Actions to run `pytest`/`ruff` on backend and `tsc`/`eslint` on frontend.
