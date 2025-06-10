.PHONY: help install start stop restart logs backup restore test clean

help: ## Afficher l'aide
	@echo "Wildlife Tracker - Commandes disponibles:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Installation complète
	@chmod +x scripts/*.sh
	@./scripts/install.sh

start: ## Démarrer les services
	@docker-compose up -d

stop: ## Arrêter les services
	@docker-compose down

restart: ## Redémarrer les services
	@docker-compose restart

logs: ## Afficher les logs
	@docker-compose logs -f --tail=100

status: ## Statut des services
	@docker-compose ps

backup: ## Créer une sauvegarde
	@./scripts/backup.sh

restore: ## Restaurer une sauvegarde (make restore DATE=20240115_143022)
	@./scripts/restore.sh $(DATE)

test: ## Lancer les tests
	@./scripts/dev.sh test

clean: ## Nettoyer Docker
	@docker-compose down -v
	@docker system prune -f

update: ## Mettre à jour l'application
	@./scripts/update.sh

dev: ## Mode développement
	@./scripts/dev.sh start