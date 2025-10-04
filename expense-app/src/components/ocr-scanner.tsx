"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, Upload, FileText, CheckCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OCRResult {
  amount?: number
  currency?: string
  date?: string
  merchant?: string
  category?: string
  description?: string
}

export function OCRScanner({ onScanComplete }: { onScanComplete?: (result: OCRResult) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<OCRResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setScanResult(null)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateOCR = async (): Promise<OCRResult> => {
    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Simulate OCR results - in production, this would call a real OCR API
    const mockResults: OCRResult[] = [
      {
        amount: 125.5,
        currency: "USD",
        date: new Date().toISOString().split("T")[0],
        merchant: "Italian Restaurant",
        category: "Food",
        description: "Business lunch - Client meeting",
      },
      {
        amount: 89.99,
        currency: "EUR",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        merchant: "Hotel Grand Plaza",
        category: "Accommodation",
        description: "Hotel stay for business trip",
      },
      {
        amount: 45.0,
        currency: "GBP",
        date: new Date().toISOString().split("T")[0],
        merchant: "City Taxi Service",
        category: "Transportation",
        description: "Taxi to airport",
      },
    ]

    return mockResults[Math.floor(Math.random() * mockResults.length)]
  }

  const handleScan = async () => {
    if (!selectedFile) return

    setIsScanning(true)

    try {
      const result = await simulateOCR()
      setScanResult(result)

      if (onScanComplete) {
        onScanComplete(result)
      }
    } catch (error) {
      console.error("[v0] OCR scanning failed:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setScanResult(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          OCR Receipt Scanner
        </CardTitle>
        <CardDescription>Upload a receipt image to automatically extract expense details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="text-sm font-medium mb-1">Click to upload or drag and drop</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</div>
              </Label>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <Button asChild>
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Select Receipt
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {previewUrl && (
              <div className="rounded-lg border overflow-hidden">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Receipt preview"
                  className="w-full h-64 object-contain bg-muted"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>

            {!scanResult && !isScanning && (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleScan}>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Receipt
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="flex items-center justify-center gap-2 p-4 rounded-lg border bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Scanning receipt with OCR...</span>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Receipt scanned successfully!</span>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Extracted Information:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {scanResult.amount && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <p className="font-medium">
                          {scanResult.amount} {scanResult.currency}
                        </p>
                      </div>
                    )}
                    {scanResult.merchant && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Merchant</Label>
                        <p className="font-medium">{scanResult.merchant}</p>
                      </div>
                    )}
                    {scanResult.date && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <p className="font-medium">{new Date(scanResult.date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {scanResult.category && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <p className="font-medium">{scanResult.category}</p>
                      </div>
                    )}
                  </div>
                  {scanResult.description && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="text-sm">{scanResult.description}</p>
                    </div>
                  )}
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
                  Scan Another Receipt
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}