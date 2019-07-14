build:
	docker build -t  loic_fejoz/dodoc2-dev:latest .

run:
	docker run -p 8080:8080 -v ~/dodoc-documents:/home/node/Documents -d loic_fejoz/dodoc2-dev
	docker ps

.PHONY: build run
