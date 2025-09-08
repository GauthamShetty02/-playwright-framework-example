FROM ubuntu:noble

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=America/Los_Angeles

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# === INSTALL Node.js ===
RUN apt-get update && \
    apt-get install -y curl wget gpg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists/* && \
    adduser pwuser

# === INSTALL PLAYWRIGHT ===
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN mkdir /ms-playwright && \
    mkdir /ms-playwright-agent && \
    cd /ms-playwright-agent && npm init -y && \
    npm i playwright@1.40.0 && \
    npx playwright install --with-deps && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /ms-playwright-agent && \
    rm -rf ~/.npm/ && \
    chmod -R 777 /ms-playwright

# === PROJECT SETUP ===
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

USER pwuser
CMD ["npx", "playwright", "test"]