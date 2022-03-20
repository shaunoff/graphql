//import { Prisma } from '@prisma/client'
import prisma from '../config/prismaClient'
import createDates from './createDates'
import bcrypt from 'bcrypt'

const seed = async () => {
  await createDates(prisma)
  const encryptedPassword = await bcrypt.hash('passowrd', 10)
  await prisma.user.create({
    data: {
      email: 'shaun@shaun.com',
      password: encryptedPassword,
    },
  })
}

// const emptyDatabase = async () => {
//   const tables = Prisma.dmmf.datamodel.models.map((model) => model.dbName || model.name)

//   for (const table of tables) {
//     //const raw = `DELETE FROM "${table}";` as unknown as TemplateStringsArray
//     await prisma.$executeRaw`DELETE FROM "${table}";`
//   }
// }

// const reseedDatabase = async () => {
//   await emptyDatabase()
//   await seed()
// }

export default seed()
