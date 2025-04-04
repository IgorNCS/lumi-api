import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompany1743725622137 implements MigrationInterface {
    name = 'CreateCompany1743725622137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "uf" character varying NOT NULL, "cep" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "owner_id" uuid, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'costumer')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "keycloakId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_9eccb789f0a033a2cfa5baf4d99" UNIQUE ("keycloakId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company_user" ("company_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a7f2a09b56d708448a0f21e9123" PRIMARY KEY ("company_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_10335130936e37b70e2e35f2f7" ON "company_user" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7368a8438ae617a2f8318f3a20" ON "company_user" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "FK_0c6ea8a32565efcb512e572d61d" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_user" ADD CONSTRAINT "FK_10335130936e37b70e2e35f2f74" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "company_user" ADD CONSTRAINT "FK_7368a8438ae617a2f8318f3a202" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_user" DROP CONSTRAINT "FK_7368a8438ae617a2f8318f3a202"`);
        await queryRunner.query(`ALTER TABLE "company_user" DROP CONSTRAINT "FK_10335130936e37b70e2e35f2f74"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_0c6ea8a32565efcb512e572d61d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7368a8438ae617a2f8318f3a20"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10335130936e37b70e2e35f2f7"`);
        await queryRunner.query(`DROP TABLE "company_user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }

}
