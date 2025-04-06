
yarn typeorm migration:create --dataSource src/database/data-source.ts
yarn typeorm migration:generate ./src/migrations/create_column_image -d src/database/data-source.ts
yarn typeorm migration:run --dataSource src/database/data-source.ts