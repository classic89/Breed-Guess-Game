import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AddDog from "@/pages/add-dog";
import Quiz from "@/pages/quiz";
import Browse from "@/pages/browse";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/add-dog" component={AddDog} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/browse" component={Browse} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
