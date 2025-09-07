# Discord Log Bot

**Discord Log Bot** is a powerful and easy-to-use Discord bot that tracks server events and allows administrators to manage log channels efficiently through a web-based dashboard built with **Express.js** and **Bootstrap 5**.

---

## Features

- Logs important server events:
  - Member Join / Leave
  - Message Delete / Update
  - Role Update
  - Channel Update
- Add servers manually via web dashboard.
- Configure log channels per server easily.
- Automatically creates JSON config files for each server.
- Responsive and modern web interface.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/LaizooDeveloper/discord-log-bot.git
cd discord-log-bot

# 1. Initialize the project
npm init -y

# 2. Install dependencies
npm install
npm i discord.js fs path dotenv express ejs body-parser

# 3. Open .env and paste your token bot with your actual bot token

# 4. Start the bot
node index.js

```
