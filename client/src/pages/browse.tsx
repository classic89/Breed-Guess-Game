import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  Dog,
} from "lucide-react";
import type { Dog as DogType, BreedEntry } from "@shared/schema";
import { breedInfoMap } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function Browse() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDog, setSelectedDog] = useState<DogType | null>(null);

  const { data: dogs = [], isLoading } = useQuery<DogType[]>({
    queryKey: ["/api/dogs"],
  });

  const filtered = dogs.filter((dog) =>
    dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dog.breeds as BreedEntry[]).some((b) =>
      b.breedName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back-browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-browse-title">Browse Dogs</h1>
            <p className="text-sm text-muted-foreground">View all dogs and their breed results</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by dog name or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-dogs"
          />
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
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Dog className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {dogs.length === 0 ? "No dogs yet" : "No matches found"}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {dogs.length === 0
                  ? "Add some dogs with their breed information to see them here."
                  : "Try a different search term."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dog, index) => (
              <motion.div
                key={dog.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedDog(dog)}
                  data-testid={`card-browse-dog-${dog.id}`}
                >
                  <div className="aspect-square relative rounded-t-md overflow-hidden">
                    <img
                      src={dog.images[0]}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                    {dog.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                        +{dog.images.length - 1} more
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2" data-testid={`text-browse-dog-name-${dog.id}`}>
                      {dog.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {(dog.breeds as BreedEntry[]).slice(0, 3).map((b, bi) => (
                        <Badge key={bi} variant="secondary" className="text-xs">
                          {b.breedName} {b.percentage}%
                        </Badge>
                      ))}
                      {(dog.breeds as BreedEntry[]).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(dog.breeds as BreedEntry[]).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDog && (
          <DogDetailModal dog={selectedDog} onClose={() => setSelectedDog(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DogDetailModal({ dog, onClose }: { dog: DogType; onClose: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null);
  const breeds = dog.breeds as BreedEntry[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      data-testid="modal-dog-detail"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-md border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-md">
          <img
            src={dog.images[imageIndex]}
            alt={dog.name}
            className="w-full h-full object-cover"
            data-testid="img-detail-dog"
          />
          {dog.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8 bg-background/70 backdrop-blur-sm"
                onClick={() =>
                  setImageIndex((prev) =>
                    prev === 0 ? dog.images.length - 1 : prev - 1
                  )
                }
                data-testid="button-detail-prev-image"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 py-1 rounded-md bg-background/70 backdrop-blur-sm text-sm">
                {imageIndex + 1} / {dog.images.length}
              </div>
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8 bg-background/70 backdrop-blur-sm"
                onClick={() =>
                  setImageIndex((prev) =>
                    prev === dog.images.length - 1 ? 0 : prev + 1
                  )
                }
                data-testid="button-detail-next-image"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold" data-testid="text-detail-dog-name">{dog.name}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-detail">
              Close
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Breed Results
            </h3>
            {breeds.map((breed, index) => {
              const breedInfo = breedInfoMap[breed.breedName];
              const isExpanded = expandedBreed === breed.breedName;

              return (
                <div key={index} className="space-y-2" data-testid={`detail-breed-${index}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="font-medium">{breed.breedName}</span>
                      {breedInfo && (
                        <button
                          onClick={() => setExpandedBreed(isExpanded ? null : breed.breedName)}
                          className="text-muted-foreground"
                          data-testid={`button-detail-breed-info-${index}`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-sm font-semibold shrink-0">{breed.percentage}%</span>
                  </div>

                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${breed.percentage}%` }}
                      transition={{ duration: 0.7, delay: index * 0.12 }}
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && breedInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 space-y-2">
                          <p className="text-sm text-muted-foreground">{breedInfo.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-xs">{breedInfo.group}</Badge>
                            <Badge variant="outline" className="text-xs">{breedInfo.size}</Badge>
                            <Badge variant="outline" className="text-xs">{breedInfo.lifespan}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Temperament: {breedInfo.temperament}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
