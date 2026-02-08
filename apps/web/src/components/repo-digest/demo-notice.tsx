import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoNotice({ message }: { message: string }) {
  return (
    <Alert variant="default" className="border-dashed">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Demo data</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground">
        {message}
      </AlertDescription>
    </Alert>
  );
}
