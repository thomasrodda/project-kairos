// packages/database/src/seed.ts
import { prisma } from './index'

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      firebaseUid: 'test-firebase-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  })

  // Create a test workspace
  const testWorkspace = await prisma.workspace.upsert({
    where: { id: 'test-workspace-id' },
    update: {},
    create: {
      id: 'test-workspace-id',
      name: 'My First Workspace',
      userId: testUser.id,
    },
  })

  // Create a test page
  const testPage = await prisma.page.create({
    data: {
      title: 'Welcome Page',
      workspaceId: testWorkspace.id,
      blocks: {
        create: [
          {
            type: 'HEADING1',
            content: 'Welcome to Project Kairos',
            order: 0,
          },
          {
            type: 'PARAGRAPH',
            content: 'This is your first page. Start writing!',
            order: 1,
          },
        ],
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${testUser.email}`)
  console.log(`📁 Created workspace: ${testWorkspace.name}`)
  console.log(`📄 Created page: ${testPage.title}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
