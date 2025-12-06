install :
	@clear && \
	bun i && \
	cd web && bun i && \
	cd ../server && bun i

check :
	@clear && \
	cd web && bun check && \
	cd ../server && bun check
