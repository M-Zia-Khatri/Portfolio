# Cross-platform OS detection
ifeq ($(OS),Windows_NT)
	DOCKER_COMPOSE ?= docker compose
else
	DOCKER_COMPOSE := $(shell command -v docker-compose 2> /dev/null)
	ifndef DOCKER_COMPOSE
		DOCKER_COMPOSE := docker compose
	endif
endif

# Ensure all targets are registered as PHONY to prevent conflicts with local directories
.PHONY: help build up down restart logs logs-client logs-server logs-db ps \
        shell-client shell-server shell-db migrate migrate-dev seed studio clean \
        rebuild prune init db-start db-stop db-logs dev-start server client client-host

# Cross-platform Categorized Help Menu
ifeq ($(OS),Windows_NT)
help:
	@echo ==========================================
	@echo        DEVELOPMENT / LOCAL COMMANDS
	@echo ==========================================
	@echo   dev-start       - Start isolated local DB and boot client/server concurrently
	@echo   init            - Full initial project setup (Build, up, migrate, seed)
	@echo   build           - Build all Docker containers
	@echo   up              - Start all containers in the background
	@echo   down            - Stop all containers and remove networks/orphans
	@echo   restart         - Restart all containers
	@echo   ps              - List running containers and their statuses
	@echo   logs            - View live tailing logs from all containers
	@echo   logs-client     - View client container live logs
	@echo   logs-server     - View server container live logs
	@echo   logs-db         - View database container live logs
	@echo   shell-client    - Access client container shell
	@echo   shell-server    - Access server container shell
	@echo   shell-db        - Access database CLI tool inside container
	@echo   migrate-dev     - Create and run database migrations (Development mode)
	@echo   seed            - Run Prisma database seed script
	@echo   studio          - Open Prisma Studio instance inside container
	@echo   clean           - Stop containers, wipe volumes (Hard Reset)
	@echo   rebuild         - Force rebuild all containers without cache
	@echo   db-start        - Start isolated local DB (docker-compose.db.yml)
	@echo   db-stop         - Stop isolated local DB
	@echo   db-logs         - View isolated local DB logs
	@echo   server          - Start local Node server on host (pnpm dev)
	@echo   client          - Start local frontend client on host (pnpm dev)
	@echo   client-host     - Start local frontend client exposed to network
	@echo.
	@echo ==========================================
	@echo             PRODUCTION COMMANDS
	@echo ==========================================
	@echo   migrate         - Deploy database migrations (Production mode)
	@echo   prune           - Deep clean entire system Docker resources
else
help:
	@echo "\033[1;34m==========================================\033[0m"
	@echo "\033[1;34m       DEVELOPMENT / LOCAL COMMANDS       \033[0m"
	@echo "\033[1;34m==========================================\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## dev: .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## dev: "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "\033[1;35m==========================================\033[0m"
	@echo "\033[1;35m            PRODUCTION COMMANDS           \033[0m"
	@echo "\033[1;35m==========================================\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## prod: .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## prod: "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
endif

# ==============================================================================
# --- DEVELOPMENT / LOCAL CATEGORY ---
# ==============================================================================

dev-start: ## dev: Start isolated local DB and boot client/server apps concurrently on host
	@$(MAKE) db-start
	pnpm dev

init: ## dev: Full initial project setup (Build, up, run migrations, and seed)
	@$(MAKE) build
	@$(MAKE) up
	@echo "Waiting for database to be ready..." && sleep 5
	@$(MAKE) migrate-dev
	@$(MAKE) seed

build: ## dev: Build all Docker containers
	$(DOCKER_COMPOSE) build

up: ## dev: Start all containers in the background
	$(DOCKER_COMPOSE) up -d

down: ## dev: Stop all containers and remove networks/orphan containers
	$(DOCKER_COMPOSE) down --remove-orphans

restart: ## dev: Restart all containers
	$(DOCKER_COMPOSE) restart

ps: ## dev: List running containers and their statuses
	$(DOCKER_COMPOSE) ps

logs: ## dev: View live tailing logs from all containers
	$(DOCKER_COMPOSE) logs -f

logs-client: ## dev: View client container live logs
	$(DOCKER_COMPOSE) logs -f client

logs-server: ## dev: View server container live logs
	$(DOCKER_COMPOSE) logs -f server

logs-db: ## dev: View database container live logs
	$(DOCKER_COMPOSE) logs -f db

shell-client: ## dev: Access client container shell
	$(DOCKER_COMPOSE) exec client sh

shell-server: ## dev: Access server container shell
	$(DOCKER_COMPOSE) exec server sh

shell-db: ## dev: Access database CLI tool inside container
	$(DOCKER_COMPOSE) exec db mariadb -u root -p

migrate-dev: ## dev: Create and run database migrations (Development mode)
	$(DOCKER_COMPOSE) exec server pnpm prisma migrate dev

seed: ## dev: Run Prisma database seed script
	$(DOCKER_COMPOSE) exec server pnpm prisma db seed

studio: ## dev: Open Prisma Studio instance inside the server container proxy
	$(DOCKER_COMPOSE) exec server pnpm prisma studio

clean: ## dev: Stop containers, wipe volumes, and remove orphans (Hard Reset)
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f

rebuild: ## dev: Force rebuild all containers without cache and restart services
	$(DOCKER_COMPOSE) down --remove-orphans
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

db-start: ## dev: Start isolated local DB using the specialized compose file
	$(DOCKER_COMPOSE) -f docker-compose.db.yml up -d

db-stop: ## dev: Stop isolated local DB
	$(DOCKER_COMPOSE) -f docker-compose.db.yml down

db-logs: ## dev: View isolated local DB logs
	$(DOCKER_COMPOSE) -f docker-compose.db.yml logs -f

server: ## dev: Start local Node server on host machine in development mode
	cd server && pnpm dev

client: ## dev: Start local frontend client on host machine in development mode
	cd client && pnpm dev

client-host: ## dev: Start local frontend client exposed to network host
	cd client && pnpm dev --host


# ==============================================================================
# --- PRODUCTION CATEGORY ---
# ==============================================================================

migrate: ## prod: Deploy database migrations (Production mode)
	$(DOCKER_COMPOSE) exec server pnpm prisma migrate deploy

prune: ## prod: Deep clean entire system Docker resources (caches, volumes, images)
	docker system prune -a -f --volumes