hooks-install :
	pre-commit install && \
	pre-commit run --all-files

install :
	cd web && bun i && \
	cd ../server && bun i

check :
	@clear && \
	cd web && bun check && \
	cd ../server && bun check

setup :
	@clear && \
	$(MAKE) hooks-install && \
	$(MAKE) install

build :
	@clear && \
	cd web && bun run build && \
	cd ../server && bun run build
