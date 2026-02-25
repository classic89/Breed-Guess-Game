import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, Plus, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { allBreedNames } from "@shared/schema";

const addDogSchema = z.object({
  name: z.string().min(1, "Dog name is required"),
});

type FormValues = z.infer<typeof addDogSchema>;

interface BreedRow {
  breedName: string;
  percentage: number;
}

export default function AddDog() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [breeds, setBreeds] = useState<BreedRow[]>([{ breedName: "", percentage: 0 }]);

  const form = useForm<FormValues>({
    resolver: zodResolver(addDogSchema),
    defaultValues: { name: "" },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImages((prev) => [...prev, ...data.urls]);
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the images.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBreed = (index: number, field: keyof BreedRow, value: string | number) => {
    setBreeds((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBreedRow = () => {
    setBreeds((prev) => [...prev, { breedName: "", percentage: 0 }]);
  };

  const removeBreedRow = (index: number) => {
    if (breeds.length <= 1) return;
    setBreeds((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPercentage = breeds.reduce((sum, b) => sum + (b.percentage || 0), 0);

  const onSubmit = async (values: FormValues) => {
    if (images.length === 0) {
      toast({ title: "No photos", description: "Please upload at least one photo.", variant: "destructive" });
      return;
    }

    const validBreeds = breeds.filter((b) => b.breedName && b.percentage > 0);
    if (validBreeds.length === 0) {
      toast({ title: "No breeds", description: "Please add at least one breed with a percentage.", variant: "destructive" });
      return;
    }

    const validTotal = validBreeds.reduce((sum, b) => sum + b.percentage, 0);
    if (validTotal !== 100) {
      toast({ title: "Percentages must equal 100%", description: `Current total is ${validTotal}%.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/dogs", {
        name: values.name,
        images,
        breeds: validBreeds,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      toast({ title: "Dog added!", description: `${values.name} has been added to the quiz pool.` });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to add dog.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2" data-testid="text-add-dog-title">Add a Dog</h1>
        <p className="text-muted-foreground mb-8">
          Upload photos and enter the Embark breed percentages.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dog's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Buddy" {...field} data-testid="input-dog-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-3">
                {images.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" data-testid={`img-preview-${index}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label
                  className="w-24 h-24 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer text-muted-foreground transition-colors"
                  data-testid="button-upload-photos"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Breed Results</Label>
                <span className={`text-sm font-medium ${totalPercentage === 100 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} data-testid="text-total-percentage">
                  Total: {totalPercentage}%
                </span>
              </div>

              <div className="space-y-3">
                {breeds.map((breed, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <Select
                            value={breed.breedName}
                            onValueChange={(val) => updateBreed(index, "breedName", val)}
                          >
                            <SelectTrigger data-testid={`select-breed-${index}`}>
                              <SelectValue placeholder="Select breed" />
                            </SelectTrigger>
                            <SelectContent>
                              {allBreedNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={breed.percentage || ""}
                            onChange={(e) => updateBreed(index, "percentage", parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            placeholder="%"
                            data-testid={`input-percentage-${index}`}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          {breeds.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeBreedRow(index)}
                              data-testid={`button-remove-breed-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={addBreedRow} className="w-full" data-testid="button-add-breed">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Breed
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-dog">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Dog to Quiz Pool"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
