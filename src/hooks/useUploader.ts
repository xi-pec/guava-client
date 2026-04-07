import { useState, useEffect } from "react"
import { addToast } from "@heroui/toast"

const API_URL = import.meta.env.VITE_API_URL || "/api"

export function useUploader(labels: string[]) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [allowed, setAllowed] = useState(false)
  const [results, setResults] = useState<any>(null)

  async function upload(file: File) {
    if (!file) return null

    const formdata = new FormData()
    formdata.append("item", file)
    formdata.append("classifications", JSON.stringify(labels))

    try {
      const response = await fetch(`${API_URL}/classify`, {
        method: "POST",
        body: formdata,
        credentials: "include"
      })

      const json = await response.json()
      
      handleResponseNotifications(json.code)

      if (json.code === 0) {
        setResults(json)
        return json
      }
      return null
    } catch (error) {
      addToast({ title: "Server connection failed!", color: "danger" })
      return null
    }
  }

  function handleResponseNotifications(code: number) {
    const configs: Record<number, { title: string, color: "success" | "danger" | "warning" }> = {
      0: { title: "Successfully classified!", color: "success" },
      1: { title: "File is missing!", color: "warning" },
      2: { title: "File type is not allowed!", color: "warning" },
      3: { title: "Classifications list is missing!", color: "warning" },
      4: { title: "Classifications list is empty or invalid!", color: "warning" },
    }

    const config = configs[code] || { title: "Unexpected error occurred!", color: "danger" }
    addToast({ ...config, variant: "solid" })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setResults(null)
    setPreview(URL.createObjectURL(selectedFile))
  }

  function handleClose() {
    setFile(null)
    setPreview(null)
    setResults(null)
  }

  async function handleUpload(cb: (data?: any) => void) {
    if (file) {
      setAllowed(false)
      const data = await upload(file)
      setAllowed(true)
      cb(data)
    }
  }

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  useEffect(() => {
    setAllowed(!!file)
  }, [file])

  return { handleClose, preview, allowed, handleChange, handleUpload, results }
}