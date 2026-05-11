import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const PlanContext = createContext()

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadPlan = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/plan/current')
      setPlan(res.data.data)
    } catch (err) {
      console.error('Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlan() }, [user])

  return (
    <PlanContext.Provider value={{ plan, loading, refresh: loadPlan }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)
