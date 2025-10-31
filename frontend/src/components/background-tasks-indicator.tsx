import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useBackgroundTasks } from "@/contexts/BackgroundTasksContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function BackgroundTasksIndicator() {
  const { tasks } = useBackgroundTasks();
  
  const activeTasks = tasks.filter(
    task => task.status === 'pending' || task.status === 'processing'
  );

  if (activeTasks.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          Background Tasks ({activeTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTasks.map((task) => (
          <div key={task.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                {task.type === 'draft' 
                  ? `Generating ${task.draftType || 'draft'}`
                  : `Analyzing ${task.documentName}`
                }
              </span>
              <Badge variant={task.status === 'processing' ? 'default' : 'secondary'} className="text-xs">
                {task.status}
              </Badge>
            </div>
            {task.status === 'processing' && (
              <Progress value={66} className="h-1" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
