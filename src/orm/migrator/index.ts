import { int, text } from '@/fields'
import { Model } from '@/model'

class User extends Model {
  static $columns = {
    id: int().pk(),
    username: text().unique().$type(),
    email: text().unique(),
    addressLine1: text(),
  }
}

async function test() {
  // const migrator = new Migrator(db)
  // await migrator.createTable(User)

  // const user = new User({ username: 'johndoe', email: 'john@example.com' })
  // await user.save()

  const query = await User.query()
    .filter({ username: 'johndoe' })
    .orderBy('id', 'DESC')

  console.log(await query)
}

test().catch(console.error)
