import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useUser } from "@/hooks/auth";

export const Route = createFileRoute("/lecturer/reports")({
  component: LecturerReportsPage,
});

function LecturerReportsPage() {
  const { data: user } = useUser();
  
  const { data: courseAllocations } = useQuery(orpc.courseAllocation.getAll.queryOptions());
  const { data: attendance } = useQuery(orpc.attendance.getAll.queryOptions());
  const { data: results } = useQuery(orpc.results.getAll.queryOptions());

  const lecturerCourses = courseAllocations?.filter(ca => ca.lecturerId === user?.data?.user?.id) || [];

  const generateAttendanceReport = () => {
    const lecturerAttendance = attendance?.filter(a => 
      lecturerCourses.some(lc => lc.courseId === a.courseId)
    ) || [];
    
    const csvContent = [
      ['Course', 'Student', 'Date', 'Status'],
      ...lecturerAttendance.map(a => [a.courseId, a.studentId, a.date, a.status])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-report.csv';
    a.click();
  };

  const generateResultsReport = () => {
    const lecturerResults = results?.filter(r => 
      lecturerCourses.some(lc => lc.courseId === r.courseId)
    ) || [];
    
    const csvContent = [
      ['Course', 'Student', 'Score', 'Grade'],
      ...lecturerResults.map(r => [r.courseId, r.studentId, r.score, r.grade])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results-report.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and view teaching reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attendance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Generate attendance reports for your courses</p>
            <Button onClick={generateAttendanceReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View results statistics and performance</p>
            <Button onClick={generateResultsReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Course Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Comprehensive course performance report</p>
            <Button onClick={() => {
              const reportData = {
                courses: lecturerCourses.length,
                totalAttendance: attendance?.filter(a => 
                  lecturerCourses.some(lc => lc.courseId === a.courseId)
                ).length || 0,
                totalResults: results?.filter(r => 
                  lecturerCourses.some(lc => lc.courseId === r.courseId)
                ).length || 0
              };
              
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'course-report.json';
              a.click();
            }}>
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
