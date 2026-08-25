import { useEffect } from 'react'
import { LowlandSite } from '../components/LowlandDemo'

export default function LowlandSitePage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Lowland — Home'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return <LowlandSite />
}
