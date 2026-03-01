# Quick Deployment Guide (Force SSL)

This guide covers the rapid deployment of the **QuizSystemV2** monorepo using Docker Compose with mandatory SSL via Certbot.

## 1. Clone the Repository

First, pull the source code onto your production server.

```bash
git clone https://github.com/PelerYuan/QuizSystemV2.git
cd QuizSystemV2
```

## 2. Configure Environment Variables

Create a `.env` file in the root directory. This file is critical for providing your domain name and secrets to the Docker containers.

```bash
vi .env
```

**Fill in your specific details:**

```
# Domain and Security
DOMAIN_NAME=your_domain_name
SECRET=your_random_jwt_secret_string
ADMIN_PASSWORD=your_secure_admin_password

# Environment
NODE_ENV=production
```

## 3. Register SSL Certificate (One-Time Setup)

Before starting the full suite, you must obtain an SSL certificate from Let's Encrypt. We will use the `certbot` container to perform a standalone challenge.

**Important:** Ensure your domain is already pointing to this server's IP and port 80 is not being used by any other process.

```bash
sudo docker compose run --rm  certbot certonly --manual --preferred-challenges dns -d your_domain_name
```

## 4. Run with Docker

Now that the SSL certificates are ready in the shared volume, you can launch all services (Nginx, Frontend, Backend, and MongoDB).

```bash
sudo docker compose up -d --build
```
