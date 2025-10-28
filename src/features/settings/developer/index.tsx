import { ContentSection } from '../components/content-section'
import { DeveloperForm } from './developer-form'

export const SettingsDeveloper = () => {
  return (
    <ContentSection
      title='Developer'
      desc='API keys and access tokens for integrations.'
    >
      <DeveloperForm />
    </ContentSection>
  )
}
