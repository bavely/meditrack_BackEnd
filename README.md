# 🩺 MediTrack Backend

This is the **backend server** for the MediTrack mobile app — a smart medication tracker that sends reminders, predicts refills, and provides AI-assisted dosage parsing from prescription labels.

Built with:
- 🚀 NestJS (GraphQL API)
- 🔐 Auth0 (JWT-based Auth)
- 🧠 OpenAI GPT-4 (AI dosage interpretation)
- 📅 Cron-based Reminder Engine
- 💬 Twilio + Push Notifications
- 🧬 Prisma + PostgreSQL (Data Layer)

---

## 🔧 Tech Stack

| Layer         | Tech                                     |
|--------------|-------------------------------------------|
| Server       | NestJS + GraphQL                         |
| Auth         | Auth0 (JWT strategy)                     |
| AI           | OpenAI GPT-4 API                         |
| DB           | PostgreSQL + Prisma ORM                  |
| Messaging    | Twilio SMS / Expo Push Notifications     |
| Scheduling   | node-cron (timezone-aware hourly jobs)   |

---

## 📁 Project Structure
meditrack-server/
│
├── prisma/ # Prisma schema + migrations
├── src/
│ ├── ai/ # Label parsing via OpenAI
│ ├── auth/ # Auth0 JWT strategy
│ ├── medication/ # CRUD + reminder logic
│ ├── notification/ # SMS + push delivery engine
│ ├── reminder/ # Hourly cron job scheduler
│ ├── user/ # Auth0 user registration logic
│ ├── prisma/ # PrismaService (DB abstraction)
│ ├── app.module.ts # Main app module
│ └── main.ts # App entry point



---

## ⚙️ Setup & Development

### 1. Clone & Install

```bash
git clone https://github.com/yourname/meditrack-server.git
cd meditrack-server
npm install


2. Configure Environment
Create a .env file based on .env.example:

env
Copy
Edit
DATABASE_URL=postgresql://user:pass@localhost:5432/meditrack
AUTH0_ISSUER=https://yourdomain.auth0.com/
AUTH0_AUDIENCE=https://meditrack-api/
OPENAI_API_KEY=sk-xxxx
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1xxxxxxxx
3. Setup Prisma
bash
Copy
Edit
npx prisma generate
npx prisma migrate dev --name init
4. Run the Server
bash
Copy
Edit
npm run start:dev
GraphQL Playground: http://localhost:3000/graphql

🔐 Auth0 Integration
JWT is passed via Authorization: Bearer <token>

NestJS uses Passport + JWT Strategy

userId is extracted from Auth0 sub claim

Google Signups Note
Since Auth0 Actions don’t fire for Google logins, the frontend manually inserts the user by checking if auth0|google-oauth2|... is present in the sub.

🤖 AI-Powered Label Parsing
Expo client scans prescription label text

Frontend sanitizes text (removes PHI)

Sends to backend POST /ai/parse-label

Backend calls OpenAI with a prompt like:

json
Copy
Edit
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "daily at 9 AM",
  "durationDays": 30,
  "quantity": 30,
  "refillCount": 2
}
🔔 Reminders & Notifications
Runs every hour (cron.schedule('0 * * * *'))

Filters medications due soon

Sends:

📲 Push (via Expo or FCM)

📞 SMS (via Twilio)

Logs delivery + user response (taken/snoozed)

🚧 Todo / Enhancements
 Snooze reminders via app action

 Dashboard analytics (adherence rate)

 Refill request workflow

 Support multi-device push

👤 Contributors
🧠 Backend: [Your Name]

📱 Frontend: [Your Name]

❤️ Powered by NestJS, Prisma, Auth0, and OpenAI

📝 License