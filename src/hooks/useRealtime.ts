import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const useRealtime = () => {
  const subscriptionsRef = useRef<any[]>([])

  const subscribe = (
    table: string,
    filter: string,
    callback: (payload: any) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
  ) => {
    const subscription = supabase
      .channel(`realtime:${table}:${filter}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        callback
      )
      .subscribe()

    subscriptionsRef.current.push(subscription)
    return subscription
  }

  const unsubscribe = (subscription: any) => {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub !== subscription)
    }
  }

  const unsubscribeAll = () => {
    subscriptionsRef.current.forEach(subscription => {
      supabase.removeChannel(subscription)
    })
    subscriptionsRef.current = []
  }

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [])

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll
  }
}