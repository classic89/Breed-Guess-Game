import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dog, PawPrint, Plus, Trash2, ChevronRight, Eye } from "lucide-react";
import type { Dog as DogType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const [dogCount, setDogCount] = useState(3);
  const { toast } = useToast();

  const { data: dogs = [], isLoading } = useQuery<DogType[]>({
    queryKey: ["/api/dogs"],
  });

  const handleStartQuiz = () => {
    if (dogs.length === 0) {
      toast({
        title: "No dogs available",
        description: "Add some dogs with their breed information first!",
        variant: "destructive",
      });
      return;
    }
    const count = Math.min(dogCount, dogs.length);
    navigate(`/quiz?count=${count}`);
  };

  const handleDeleteDog = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await apiRequest("DELETE", `/api/dogs/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
    toast({ title: "Dog removed", description: "The dog has been removed from the quiz pool." });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <PawPrint className="w-4 h-4" />
            <span className="text-sm font-medium">Dog Breed Quiz</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-title">
            Guess the Breed Mix
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload photos of your dogs along with their Embark DNA test results, then challenge yourself or friends to guess the breed percentages!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate("/add-dog")}
              data-testid="button-add-dog"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a Dog
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/browse")}
              data-testid="button-browse-dogs"
            >
              <Eye className="w-4 h-4 mr-2" />
              Browse Dogs
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="dog-count" className="text-sm text-muted-foreground whitespace-nowrap">
                  Quiz me on
                </Label>
                <Input
                  id="dog-count"
                  type="number"
                  min={1}
                  max={Math.max(dogs.length, 1)}
                  value={dogCount}
                  onChange={(e) => setDogCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center"
                  data-testid="input-dog-count"
                />
                <span className="text-sm text-muted-foreground">
                  dog{dogCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleStartQuiz}
                disabled={dogs.length === 0}
                data-testid="button-start-quiz"
              >
                Start Quiz
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="text-xl font-semibold" data-testid="text-dog-pool-header">
            Dog Pool ({dogs.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-md" />
                <CardContent className="p-4">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Dog className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No dogs yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Add your first dog with their Embark DNA results to start building your quiz pool.
              </p>
              <Button onClick={() => navigate("/add-dog")} data-testid="button-add-first-dog">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Dog
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <Card key={dog.id} className="group relative" data-testid={`card-dog-${dog.id}`}>
                <div className="aspect-square relative rounded-t-md overflow-hidden">
                  <img
                    src={dog.images[0]}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                    data-testid={`img-dog-${dog.id}`}
                  />
                  {dog.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                      +{dog.images.length - 1} more
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate" data-testid={`text-dog-name-${dog.id}`}>
                        {dog.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {(dog.breeds as any[]).length} breed{(dog.breeds as any[]).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleDeleteDog(dog.id, e)}
                      data-testid={`button-delete-dog-${dog.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
