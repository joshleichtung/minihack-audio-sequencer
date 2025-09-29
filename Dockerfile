# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA
RUN echo 'server {' > /etc/nginx/conf.d/default.conf \
    && echo '    listen 8080;' >> /etc/nginx/conf.d/default.conf \
    && echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf \
    && echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    index index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '' >> /etc/nginx/conf.d/default.conf \
    && echo '    # Handle client-side routing' >> /etc/nginx/conf.d/default.conf \
    && echo '    location / {' >> /etc/nginx/conf.d/default.conf \
    && echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '' >> /etc/nginx/conf.d/default.conf \
    && echo '    # Security headers' >> /etc/nginx/conf.d/default.conf \
    && echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf \
    && echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf \
    && echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf \
    && echo '' >> /etc/nginx/conf.d/default.conf \
    && echo '    # Cache static assets' >> /etc/nginx/conf.d/default.conf \
    && echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {' >> /etc/nginx/conf.d/default.conf \
    && echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf \
    && echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
