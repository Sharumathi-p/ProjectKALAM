import { useEffect, useState } from 'react'
import { supabase } from '@services/supabase'

export default function DiagnosticCheck() {
  const [status, setStatus] = useState<{
    envVars: boolean
    supabaseConnection: boolean
    error?: string
  }>({
    envVars: false,
    supabaseConnection: false,
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        const envVarsOk = !!(supabaseUrl && supabaseKey)
        
        console.log('Environment Check:', {
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing',
        })

        // Test Supabase connection
        let connectionOk = false
        try {
          const { error } = await supabase.auth.getSession()
          connectionOk = !error
          
          if (error) {
            console.error('Supabase connection error:', error)
          } else {
            console.log('Supabase connection successful')
          }
        } catch (err) {
          console.error('Supabase connection failed:', err)
        }

        setStatus({
          envVars: envVarsOk,
          supabaseConnection: connectionOk,
          error: !envVarsOk
            ? 'Environment variables missing'
            : !connectionOk
            ? 'Cannot connect to Supabase'
            : undefined,
        })
      } catch (err: any) {
        console.error('Diagnostic check failed:', err)
        setStatus({
          envVars: false,
          supabaseConnection: false,
          error: err.message,
        })
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg border border-white/20 text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Diagnostic Check</h3>
      <div className="space-y-1">
        <div>
          Environment Variables: {status.envVars ? '✅' : '❌'}
        </div>
        <div>
          Supabase Connection: {status.supabaseConnection ? '✅' : '❌'}
        </div>
        {status.error && (
          <div className="text-red-400 mt-2">Error: {status.error}</div>
        )}
      </div>
      <div className="text-white/40 mt-2">
        Check browser console (F12) for details
      </div>
    </div>
  )
}
