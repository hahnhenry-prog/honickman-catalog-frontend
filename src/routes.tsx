import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout'
import CompanyPickerPage from './pages/CompanyPickerPage'
import CompanyCatalogPage from './pages/CompanyCatalogPage'

function CompanyRoute() {
  return (
    <Layout>
      <CompanyCatalogPage />
    </Layout>
  )
}

export const router = createBrowserRouter([
  { path: '/', Component: CompanyPickerPage },
  { path: '/:company', Component: CompanyRoute },
])
