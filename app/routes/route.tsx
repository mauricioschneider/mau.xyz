import { createFileRoute } from '@tanstack/react-router'

import { Layout } from '../components/public/Layout'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/')({
  component: PublicApp,
})

function PublicApp({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>
}
