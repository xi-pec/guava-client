import DefaultLayout from "@/layouts/default"
import { Image } from "@heroui/image"
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Chip } from "@heroui/chip"
import { Progress } from "@heroui/progress"
import { useState } from "react"
import { useUploader } from "@/hooks/useUploader"

export default function IndexPage() {
  const [loading, setLoading] = useState(false)
  const [labelInput, setLabelInput] = useState("")
  const [labels, setLabels] = useState<string[]>([])

  const uploader = useUploader(labels)

  const scores = uploader.results 
    ? Object.entries(uploader.results.all_scores)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
    : []

  return (
    <DefaultLayout>
      <div className="grid place-items-center py-10">
        <Card className="max-w-[400px] w-full">
          <CardHeader className="px-6 pt-6"><h4 className="font-semibold">Classify Item</h4></CardHeader>
          <CardBody className="flex flex-col gap-4">
            
            <div className="relative aspect-square bg-default-100 rounded-xl overflow-hidden">
              <label className="w-full h-full cursor-pointer block">
                {uploader.preview ? (
                  <Image src={uploader.preview} removeWrapper className="z-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-default-500">Click to select</div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={uploader.handleChange} />
              </label>
            </div>

            {uploader.results && (
              <div className="flex flex-col gap-2">
                {scores.map(([name, score]: any) => (
                  <Progress 
                    key={name} 
                    label={name} 
                    value={score * 100} 
                    size="sm"
                    color={name === uploader.results.class ? "success" : "primary"}
                    showValueLabel 
                    formatOptions={{ style: "percent" }}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input size="sm" value={labelInput} onValueChange={setLabelInput} placeholder="Add label" />
                <Button variant="flat" color="primary" size="sm" onPress={() => {
                  if (labelInput && !labels.includes(labelInput)) {
                    setLabels([...labels, labelInput]); setLabelInput("");
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {labels.map(l => (
                  <Chip key={l} variant="flat" color="primary" size="sm" onClose={() => setLabels(labels.filter(i => i !== l))}>{l}</Chip>
                ))}
                {labels.length === 0 && (
                  <span className="text-tiny text-default-400 italic">No labels added yet.</span>
                )} 
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button 
              className="w-full" 
              color="primary" 
              isLoading={loading} 
              isDisabled={!uploader.allowed || labels.length === 0}
              onPress={() => uploader.handleUpload(() => setLoading(false))}
            >Classify</Button>
          </CardFooter>
        </Card>
      </div>
    </DefaultLayout>
  )
}