'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Database } from 'lucide-react'
import { isUsingMockData } from '@/lib/data-service'

export function DemoModeBanner() {
  if (!isUsingMockData()) {
    return null
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Database className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Demo Mode:</strong> Aplikasi sedang menggunakan data dummy untuk testing. 
          Data ini tidak akan disimpan secara permanen dan akan hilang saat refresh.
        </span>
        <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
          <Info className="h-3 w-3 mr-1" />
          Testing UI
        </div>
      </AlertDescription>
    </Alert>
  )
}
