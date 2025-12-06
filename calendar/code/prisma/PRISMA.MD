# PRISMA

## First migrate

`npx prisma migrate dev --name init` will trigger the schema to be implemented and the seeders to be activitated. `Seed/ts` is the entrypoint here. In this project, for every table a seperate seeder is created. 

## Following migration
When you are in a development setup throw away the migrations and the database and approach the project as as a first migrate.


## SQLite
We are using SQLite because you don't need to setup a seperate container or something like that. It is a relational database but it comes with its boundaries and challenges. Within a learning situation or for small projects this is fine. However for larger applications please change to more robust alternatives.