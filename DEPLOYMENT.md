# Quick Deployment Guide

## 1. Clone the Repository

```bash
git clone https://github.com/PelerYuan/QuizSystemV2.git
cd QuizSystemV2
```

## 2. Environment Configuration

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

```bash
sudo docker compose up -d --build
```
