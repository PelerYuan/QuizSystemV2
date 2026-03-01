# Quick Deployment Guide

This guide covers the rapid deployment of the **QuizSystemV2** monorepo using Docker Compose.

## 1. Clone the Repository

First, pull the source code onto your production server.

```bash
git clone https://github.com/PelerYuan/QuizSystemV2.git
cd QuizSystemV2
```

## 2. Configure Environment Variables

Create a `.env` file in the root directory to store your production secrets.

```bash
vi .env
```

Use the template below:

```
# Domain and Security
DOMAIN_NAME=your_domain_name
SECRET=your_random_jwt_secret_string
ADMIN_PASSWORD=your_secure_admin_password

# Environment
NODE_ENV=production
```

## 3. Run with Docker

Use Docker Compose to build the images and start all services (Nginx, Frontend, Backend, and MongoDB) in the background.

```bash
sudo docker compose up -d --build
```