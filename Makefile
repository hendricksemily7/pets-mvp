.PHONY: setup run

# Setup: Install dependencies, start database, and run migrations
setup:
	npm install
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	npx prisma generate
	npx prisma migrate deploy

# Run the development server
run:
	npm run dev
