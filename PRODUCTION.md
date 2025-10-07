# Memora Production Deployment Guide

## Prerequisites

-   Docker and Docker Compose installed
-   Domain name configured (if using custom domain)
-   SSL certificates (if using HTTPS with Nginx)

## Quick Start

1. **Clone and navigate to the project:**

    ```bash
    git clone <repository-url>
    cd memora
    ```

2. **Configure environment:**

    ```bash
    cp .env.prod.example .env
    # Edit .env with your actual values
    ```

3. **Deploy without Nginx (HTTP only):**

    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

4. **Deploy with Nginx (HTTPS support):**
    ```bash
    # First, place your SSL certificates in ./ssl/ directory
    ./deploy.sh --with-nginx
    ```

## Environment Configuration

### Required Variables

-   `POSTGRES_PASSWORD`: Secure password for PostgreSQL
-   `JWT_SECRET_KEY`: Secure secret for JWT tokens (min 32 chars)
-   `GOOGLE_CLIENT_ID`: Google OAuth client ID
-   `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
-   `GOOGLE_API_KEY`: Google API key for embeddings

### Production URLs

-   `VITE_BACKEND_URL`: Full URL to your backend API
-   `FRONTEND_URL`: Full URL to your frontend
-   `DOMAIN_NAME`: Your domain name
-   `GOOGLE_CALLBACK_URL`: OAuth callback URL

## SSL Configuration (with Nginx)

1. Place SSL certificates in `./ssl/` directory:

    ```
    ssl/
    ├── cert.pem
    └── key.pem
    ```

2. Uncomment SSL configuration in `nginx.conf`

3. Deploy with Nginx profile:
    ```bash
    ./deploy.sh --with-nginx
    ```

## Service URLs

-   **Frontend:** `http://localhost:80` (or your domain)
-   **Backend API:** `http://localhost:8000/docs`
-   **With Nginx:** `https://localhost:443` (or your domain)

## Management Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update and redeploy
git pull
./deploy.sh

# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres memora > backup.sql

# Database restore
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres memora
```

## Monitoring and Troubleshooting

### Health Checks

All services include health checks. Check status with:

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Common Issues

1. **Services not starting:** Check logs for specific errors
2. **Database connection issues:** Verify PostgreSQL is healthy
3. **Search not working:** Check Elasticsearch container status
4. **OAuth issues:** Verify Google OAuth configuration and callback URLs

### Performance Tuning

1. **Elasticsearch memory:** Adjust `ES_JAVA_OPTS` in docker-compose.prod.yml
2. **Database connections:** Configure connection pooling in backend
3. **Nginx caching:** Review caching rules in nginx.conf

## Security Considerations

-   Use strong passwords for all services
-   Keep SSL certificates secure and up to date
-   Regularly update base Docker images
-   Monitor logs for suspicious activity
-   Use environment variables for all secrets
-   Enable rate limiting in Nginx configuration

## Backup Strategy

1. **Database:** Regular PostgreSQL dumps
2. **Search Index:** Elasticsearch snapshots (if needed)
3. **Application Config:** Version control for configuration files
4. **SSL Certificates:** Secure backup of certificates and keys
