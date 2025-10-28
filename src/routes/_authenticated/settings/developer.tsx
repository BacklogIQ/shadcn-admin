import { createFileRoute } from '@tanstack/react-router'
import { SettingsDeveloper } from '@/features/settings/developer'

export const Route = createFileRoute('/_authenticated/settings/developer')({
  component: SettingsDeveloper,
})
