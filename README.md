# NexTicket – Event and Venue Service

This is the backend service responsible for managing **Venues** in the NexTicket multi-tenant event ticketing platform. It is built with:

* Node.js + TypeScript (ES Modules)
* Express.js (modular structure)
* PostgreSQL (hosted on Railway)
* Prisma ORM (with seed + migration support)

---

## 📁 Folder Structure

```
src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── utils/
└── index.mts             ← Main Express server file
prisma/
└── schema.prisma         ← Prisma schema (Venue, Tenant)
.env                      ← Environment variables (DATABASE_URL)
```

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/evms.git
cd evms
```

### 2. Install dependencies

```bash
npm install
```

---

## 💠 Environment Setup

### 3. Set up the PostgreSQL Database (via Railway)

1. Go to [https://railway.app](https://railway.app)
2. Create a new project → Add PostgreSQL Plugin
3. Click **"Connect"** → copy the **Prisma connection string**
4. Create a `.env` file in your project root:

```env
DATABASE_URL="postgresql://postgres:<password>@containers-xxx.railway.app:5432/railway"
```

✅ Keep this private and never commit it.

---

## 🔧 Prisma Setup

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migration + seed

```bash
npx prisma migrate dev --name init
```

> ✅ This will create tables and auto-run the seed script.

You should see:

```
Running seed command "tsx prisma/seed.mts"
✅ Dummy data inserted!
```

---

## 🕪 Seed Script (Optional Manual Run)

To re-run the seed manually:

```bash
npx prisma db seed
```

Or use:

```bash
npm run seed
```

(If you've defined it in `package.json`.)

---

## 🟢 Run the Backend (ESM + TypeScript)

```bash
npm run dev
```

> This will run `src/index.mts` using `ts-node` with ESM loader + `nodemon`

You should see:

```
✅ Server running on http://localhost:4000
```

---

## ✅ At this point...

You're ready to begin implementing APIs like:

* `GET /api/venues`
* `POST /api/venues`
* `GET /api/venues/:id`

> Continue development inside `src/routes/`, `controllers/`, and `services/`.

---

## 🛌 Dev Tips

* Use `npx prisma studio` to view/edit data visually
* Use `.mts` and `import` syntax consistently (ESM only)
* Keep `.env` out of version control using `.gitignore`
* Share `.env.example` with teammates (without secrets)

---

## 👨‍💼 Authors

* Pasindu Ravishan (Venue Service)
* \[Your teammate] (Event Service)

---

## 📄 License

This project is licensed under the MIT License.
