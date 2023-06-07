Запускается по адресу http://localhost:3001

- без парсера `docker compose up -d` 
- с парсером `npm run launch`

## swagger

При запуске nest из docker compose Swagger по адресу http://localhost:3001/docs иногда отрубается.
Поэтому в docker compose добавлен контейнер со swagger, который настроен делать документацию из файла swagger.json, лежащего в корне проекта.
Этот файл автоматически генерируется при каждом запуске микросервса "api".
Тем не менее, он все же может оказаться рассинхронизированным с реальным состоянием проекта.
Поэтому сначала стоит проверить по адресу http://localhost:3001/docs 

документация доступна по адресу 
- http://localhost:8082/ при запуске сервиса api** через docker compose**: `docker compose up -d`. Документация может оказаться рассинхронизированной
- http://localhost:3001/docs  при запуске сервиса api **через npm**: `docker compose stop api; npm run start:dev api`. Всегда up-to-date