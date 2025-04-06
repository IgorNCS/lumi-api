import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDb1743953765489 implements MigrationInterface {
    name = 'CreateDb1743953765489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "energy_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "energyDataType" "public"."energy_data_energydatatype_enum" NOT NULL, "quantity" numeric(10,4) NOT NULL, "value" numeric(10,4) NOT NULL, "unitPrice" numeric(10,8) NOT NULL, "invoice_id" uuid, CONSTRAINT "PK_13de4935c907133cee13629002a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "history_energy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "consumptionHistory" jsonb NOT NULL, CONSTRAINT "REL_a65ed26afcc36633e33208b5a3" UNIQUE ("invoice_id"), CONSTRAINT "PK_f9e5a5f74ac4ef1c9cd5b75aa9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "installation" character varying NOT NULL, "client" character varying NOT NULL, "dueDate" character varying NOT NULL, "totalAmount" numeric(10,4) NOT NULL, "publicContribution" numeric(10,4) NOT NULL, "notaFiscal" character varying NOT NULL, "referencyMonth" character varying NOT NULL, "band" character varying NOT NULL, "path" character varying NOT NULL, "name" character varying NOT NULL, "distributor" character varying NOT NULL DEFAULT 'CEMIG', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid, "company_id" uuid, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "uf" character varying NOT NULL, "cep" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "owner_id" uuid, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "keycloakId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_9eccb789f0a033a2cfa5baf4d99" UNIQUE ("keycloakId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company_user" ("company_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a7f2a09b56d708448a0f21e9123" PRIMARY KEY ("company_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_10335130936e37b70e2e35f2f7" ON "company_user" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7368a8438ae617a2f8318f3a20" ON "company_user" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "energy_data" ADD CONSTRAINT "FK_38a2bfc4e2cb17b1dde45f83a87" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "history_energy" ADD CONSTRAINT "FK_a65ed26afcc36633e33208b5a3c" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_c14b00795593eafc9d423e7f74d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_7718b2d8c649496f6ffd8e0399d" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "FK_0c6ea8a32565efcb512e572d61d" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_user" ADD CONSTRAINT "FK_10335130936e37b70e2e35f2f74" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "company_user" ADD CONSTRAINT "FK_7368a8438ae617a2f8318f3a202" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_user" DROP CONSTRAINT "FK_7368a8438ae617a2f8318f3a202"`);
        await queryRunner.query(`ALTER TABLE "company_user" DROP CONSTRAINT "FK_10335130936e37b70e2e35f2f74"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_0c6ea8a32565efcb512e572d61d"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_7718b2d8c649496f6ffd8e0399d"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_c14b00795593eafc9d423e7f74d"`);
        await queryRunner.query(`ALTER TABLE "history_energy" DROP CONSTRAINT "FK_a65ed26afcc36633e33208b5a3c"`);
        await queryRunner.query(`ALTER TABLE "energy_data" DROP CONSTRAINT "FK_38a2bfc4e2cb17b1dde45f83a87"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7368a8438ae617a2f8318f3a20"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10335130936e37b70e2e35f2f7"`);
        await queryRunner.query(`DROP TABLE "company_user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TABLE "history_energy"`);
        await queryRunner.query(`DROP TABLE "energy_data"`);
    }

}
