import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/tables";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useUser } from "@/hooks/auth";

export const Route = createFileRoute("/student/results/")({
  component: StudentResultsPage,
});

function StudentResultsPage() {
  const { data: user } = useUser();
  const { data: results } = useQuery(orpc.results.getAll.queryOptions());

  const exportResults = () => {
    const studentResults =
      results?.filter((r) => r.results.studentId === user?.data?.user?.id) ||
      [];

    const csvContent = [
      ["Course", "Score", "Grade", "Date"],
      ...studentResults.map((r) => [
        r.results.courseId,
        r.results.examScore,
        r.results.grade,
        new Date(r.results.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-results.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Results</h1>
          <p className="text-muted-foreground">
            View your academic results and grades
          </p>
        </div>
        <Button onClick={exportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable userType="student" />
        </CardContent>
      </Card>
    </div>
  );
}
