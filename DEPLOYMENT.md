# QuizSystemV2 Production Deployment Manual (Force SSL)

This guide provides the technical procedure for deploying the **QuizSystemV2** monorepo using **Docker Compose**. This deployment architecture enforces **SSL/TLS encryption** via Certbot to ensure secure end-to-end communication.

## 1. Repository Acquisition

Begin by cloning the source code into your production environment. Ensure you are on the stable production branch.

```bash
git clone https://github.com/PelerYuan/QuizSystemV2.git
cd QuizSystemV2
```

## 2. Environment Configuration

The application requires a `.env` file in the root directory to manage sensitive credentials and orchestration variables.

```bash
touch .env && vi .env
```

**Populate the file with the following parameters:**

```ini
# Domain & Security Infrastructure
DOMAIN_NAME=example.com            # Your fully qualified domain name (FQDN)
SECRET=your_robust_jwt_secret      # High-entropy string for JWT signing
ADMIN_PASSWORD=your_secure_pass    # Initial administrative credential

# Environment Context
NODE_ENV=production                # Sets the application to production mode
```

## 3. SSL/TLS Certificate Provisioning (Initial Setup)

Before orchestrating the full service stack, you must obtain a valid certificate from **Let's Encrypt**. We utilize the `certbot` container to perform a standalone challenge validation.

Execute the following command to initiate the DNS/Standalone challenge:

```bash
sudo docker compose run --rm certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d your_domain_name
```

## 4. Full-Stack Service Orchestration

Once the certificates are successfully provisioned to the shared volume, initiate the containerized stack. This command builds and deploys the **Nginx (Reverse Proxy)**, **Frontend**, **Backend API**, and **MongoDB** instances in a decoupled environment.

```bash
# Build images and start services in detached mode
sudo docker compose up -d --build
```

------

### Post-Deployment Verification

To ensure all services are healthy and the reverse proxy is routing traffic correctly, use the following diagnostic commands:

- **Service Status**: `sudo docker compose ps`
- **Live Log Streaming**: `sudo docker compose logs -f`
