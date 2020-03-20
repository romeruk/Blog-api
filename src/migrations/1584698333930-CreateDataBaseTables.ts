import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDataBaseTables1584698333930 implements MigrationInterface {
    name = 'CreateDataBaseTables1584698333930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "PK_8ac7b8caed923e01e2b609484aa" PRIMARY KEY ("title", "slug"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "verificationToken" character varying, "passwordResetToken" character varying, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_e12875dfb3b1d92d7d7c5377e22" PRIMARY KEY ("email"))`, undefined);
        await queryRunner.query(`CREATE TABLE "post" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "slug" character varying NOT NULL, "content" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "userEmail" character varying, CONSTRAINT "PK_fb0943ae1860a2fb58cbc1b2ada" PRIMARY KEY ("title", "slug"))`, undefined);
        await queryRunner.query(`CREATE TABLE "image" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "url" character varying NOT NULL, "postTitle" character varying, "postSlug" character varying, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "post_categories_category" ("postTitle" character varying NOT NULL, "postSlug" character varying NOT NULL, "categoryTitle" character varying NOT NULL, "categorySlug" character varying NOT NULL, CONSTRAINT "PK_4f1b1343d4ededee49f3c61f146" PRIMARY KEY ("postTitle", "postSlug", "categoryTitle", "categorySlug"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_5b038b44692ccaac2aaa015aa8" ON "post_categories_category" ("postTitle", "postSlug") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_79a4b143cbda63076b6062d2c5" ON "post_categories_category" ("categoryTitle", "categorySlug") `, undefined);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_b6a3397e33ab179a2c7d64705b9" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_f9bef6044818d8dd28fc63dec94" FOREIGN KEY ("postTitle", "postSlug") REFERENCES "post"("title","slug") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "post_categories_category" ADD CONSTRAINT "FK_5b038b44692ccaac2aaa015aa85" FOREIGN KEY ("postTitle", "postSlug") REFERENCES "post"("title","slug") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "post_categories_category" ADD CONSTRAINT "FK_79a4b143cbda63076b6062d2c51" FOREIGN KEY ("categoryTitle", "categorySlug") REFERENCES "category"("title","slug") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories_category" DROP CONSTRAINT "FK_79a4b143cbda63076b6062d2c51"`, undefined);
        await queryRunner.query(`ALTER TABLE "post_categories_category" DROP CONSTRAINT "FK_5b038b44692ccaac2aaa015aa85"`, undefined);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_f9bef6044818d8dd28fc63dec94"`, undefined);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_b6a3397e33ab179a2c7d64705b9"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_79a4b143cbda63076b6062d2c5"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_5b038b44692ccaac2aaa015aa8"`, undefined);
        await queryRunner.query(`DROP TABLE "post_categories_category"`, undefined);
        await queryRunner.query(`DROP TABLE "image"`, undefined);
        await queryRunner.query(`DROP TABLE "post"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "category"`, undefined);
    }

}
