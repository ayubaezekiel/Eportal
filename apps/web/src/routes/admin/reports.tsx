import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, FileText, Users, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: users } = useQuery(orpc.users.getAll.queryOptions());
  const { data: payments } = useQuery(orpc.payments.getAll.queryOptions());
  const { data: results } = useQuery(orpc.results.getAll.queryOptions());
  const { data: attendance } = useQuery(orpc.attendance.getAll.queryOptions());
  const { data: sessions } = useQuery(orpc.academicSessions.getAll.queryOptions());
  const { data: faculties } = useQuery(orpc.faculties.getAll.queryOptions());

  const totalStudents = users?.filter(u => u.userType === "student")?.length || 0;
  const confirmedPayments = payments?.filter(p => p.status === "Confirmed") || [];
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const approvedResults = results?.filter(r => r.status === "Approved") || [];
  const averageGPA = approvedResults.length > 0 
    ? (approvedResults.reduce((sum, r) => sum + Number(r.gradePoint || 0), 0) / approvedResults.length).toFixed(2)
    : "0.00";
  const presentAttendance = attendance?.filter(a => a.status === "Present")?.length || 0;
  const totalAttendance = attendance?.length || 1;
  const attendanceRate = ((presentAttendance / totalAttendance) * 100).toFixed(1);

  const exportAllReports = () => {
    const data = {
      summary: {
        totalStudents,
        totalRevenue,
        averageGPA,
        attendanceRate: `${attendanceRate}%`,
        generatedAt: new Date().toISOString()
      },
      students: users?.filter(u => u.userType === "student"),
      payments: confirmedPayments,
      results: approvedResults,
      attendance
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("All reports exported successfully");
  };

  const downloadReport = (type: string) => {
    let data: any = {};
    let filename = "";

    switch (type) {
      case "enrollment":
        data = users?.filter(u => u.userType === "student");
        filename = `enrollment-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case "financial":
        data = { payments: confirmedPayments, totalRevenue, summary: { totalPayments: confirmedPayments.length, totalRevenue } };
        filename = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case "academic":
        data = { results: approvedResults, averageGPA, summary: { totalResults: approvedResults.length, averageGPA } };
        filename = `academic-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case "attendance":
        data = { attendance, attendanceRate, summary: { totalRecords: attendance?.length, presentCount: presentAttendance, attendanceRate: `${attendanceRate}%` } };
        filename = `attendance-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);
  };

  const viewReport = (type: string) => {
    toast.info(`Opening ${type} report viewer...`);
    // In a real app, this would open a detailed report view
  };

  const reportTypes = [
    { id: "enrollment", title: "Enrollment Report", description: "Student enrollment statistics", icon: Users },
    { id: "financial", title: "Financial Report", description: "Revenue and payment analysis", icon: DollarSign },
    { id: "academic", title: "Academic Performance", description: "Results and grade analysis", icon: BarChart3 },
    { id: "attendance", title: "Attendance Report", description: "Class attendance statistics", icon: TrendingUp },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and view system reports</p>
        </div>
        <Button onClick={exportAllReports}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Academic Session</label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Session</SelectItem>
                  {sessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Faculty</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties?.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Level</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Students</span>
                <span className="font-bold">{totalStudents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Revenue</span>
                <span className="font-bold">₦{(totalRevenue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average GPA</span>
                <span className="font-bold">{averageGPA}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Attendance Rate</span>
                <span className="font-bold">{attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <report.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => viewReport(report.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" className="flex-1" onClick={() => downloadReport(report.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Monthly Enrollment Report</p>
                <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadReport("enrollment")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Financial Summary Q3</p>
                <p className="text-sm text-muted-foreground">Generated on {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadReport("financial")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Academic Performance Analysis</p>
                <p className="text-sm text-muted-foreground">Generated on {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadReport("academic")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
