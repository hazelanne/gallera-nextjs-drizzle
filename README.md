# 🐓 Gallera Next.js + Drizzle Demo

A simple betting app demo built with **Next.js**, **Drizzle ORM**, and
**PostgreSQL**.

This project showcases a minimal real-world style setup with authentication,
migrations, and a modular codebase --- great as a learning resource or a
starting point for your own apps.

---

## ✨ Features

- ⚡ **Next.js 14** -- modern React framework with App Router
- 🗄️ **Drizzle ORM** -- fully typed database access
- 🐘 **PostgreSQL** -- relational database support
- 🔐 **JWT Auth** -- stored securely in HttpOnly cookies
- 🎨 **Tailwind CSS + shadcn/ui** -- fast styling and UI components
- 🔄 **Migrations** -- schema managed with Drizzle

---

## 🚀 Quickstart

> Requires a local **Postgres** instance running.\
> Example assumes `postgres` user with no password.

1.  **Clone & Setup Environment**

    ```bash
    git clone https://github.com/your-org/gallera-next-drizzle-demo.git
    cd gallera-next-drizzle-demo
    cp .env.example .env   # update with your DB credentials
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Create Database**

    ```bash
    createdb -U postgres betting_app
    ```

4.  **Run Migrations**

    ```bash
    npm run migrate:dev
    ```

5.  **Start Development Server**

    ```bash
    npm run dev
    ```

    App will be available at <http://localhost:3000>.

---

## 🎮 How It Works

Gallera simulates a simple **betting flow**:

1.  An **admin** starts a new fight.
2.  **Users** place bets on their chosen side (Red vs Blue).
3.  Once the fight is resolved, the system:
    - Pays out winning bets
    - Updates user balances
    - Records fight history
4.  Admin can also **cancel fights**, refunding all bets.

This keeps the demo lightweight but shows how **transactions, updates,
and real-time events** could work in a betting-style application.

---

## 📂 Project Structure

    src/
     ├─ app/           # Next.js routes & pages
     ├─ components/    # Reusable UI components
     └─ lib/
         ├─ db/        # Drizzle schema & migrations
         └─ auth/      # JWT auth helpers

---

## 🛠️ Development Notes

- JWT is stored in an **HttpOnly cookie** for security.
- Schema is defined in [`src/lib/db/schema.ts`](src/lib/db/schema.ts).
- Drizzle migrations are wired through `package.json` scripts.

---

## 🤝 Contributing

Pull requests are welcome! If you'd like to: - Add new features -
Improve docs - Report issues

...please open an
[issue](https://github.com/your-org/gallera-next-drizzle-demo/issues) or
submit a PR.

---

## 📜 License

MIT --- feel free to use this demo in your own projects.
