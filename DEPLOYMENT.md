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

```ini
# Domain and Security
DOMAIN_NAME=example.com
SECRET=your_random_jwt_secret_string
ADMIN_PASSWORD=your_secure_admin_password

# Environment
NODE_ENV=production
```

## 3. Create SSL certificate

```bash
sudo apt update
sudo apt install certbot -y

sudo certbot certonly --standalone -d example.com
```

## 4. Run with Docker

Use Docker Compose to build the images and start all services (Nginx, Frontend, Backend, and MongoDB) in the background.

```bash
sudo docker compose up -d --build
```