hooks-install :
	pre-commit install && \
	pre-commit run --all-files

install-web :
	cd web && bun i

install-server :
	cd server && bun i

install : install-web install-server

check-web :
	cd web && bun check

check-server :
	cd server && bun check

check : check-web check-server

setup : hooks-install install

build-web:
	cd web && bun run build

build-server:
	cd web && bun run build

build : build-web build-server
