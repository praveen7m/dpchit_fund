import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, User, History, Database, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminUserSearch = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Search for user info
      const userResponse = await fetch(`${API_BASE_URL}/payments/admin-search-user?phone=${searchPhone}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserInfo(userData.userInfo);
        setPaymentHistory(userData.paymentHistory);
      } else {
        toast({
          title: "User Not Found",
          description: "No user found with this phone number",
          variant: "destructive",
        });
        setUserInfo(null);
        setPaymentHistory([]);
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search user",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportToPDF = () => {
    if (!userInfo || paymentHistory.length === 0) return;
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Greedam Ram Finance', 20, 20);
      doc.setFontSize(16);
      doc.text('Payment History Report', 20, 35);
      
      // Add user info
      doc.setFontSize(12);
      doc.text(`Customer: ${userInfo.name}`, 20, 50);
      doc.text(`Phone: ${userInfo.phone}`, 20, 60);
      doc.text(`Location: ${userInfo.location || 'N/A'}`, 20, 70);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 80);
      
      // Prepare table data
      const tableData = paymentHistory.map((payment) => [
        payment.invoiceNo,
        formatDate(payment.date),
        `Rs.${payment.amount}`,
        payment.frequency,
        payment.status,
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Invoice No', 'Date', 'Amount', 'Frequency', 'Status']],
        body: tableData,
        startY: 90,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [37, 99, 235] },
      });
      
      doc.save(`${userInfo.name}_payment_history.pdf`);
      
      toast({
        title: "PDF Exported",
        description: "Payment history has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="form-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Search User by Phone
          </CardTitle>
          <CardDescription>
            Enter phone number to view user information and payment history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {userInfo && (
        <Card className="form-container">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Information
            </CardTitle>
            <CardDescription>
              Details saved by collection agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <div className="p-2 bg-muted rounded">{userInfo.name}</div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="p-2 bg-muted rounded">{userInfo.phone}</div>
              </div>
            </div>
            
            <div>
              <Label>Location</Label>
              <div className="p-2 bg-muted rounded">{userInfo.location || 'N/A'}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Amount</Label>
                <div className="p-2 bg-muted rounded font-semibold">₹{userInfo.amount}</div>
              </div>
              <div>
                <Label>Frequency</Label>
                <div className="p-2 bg-muted rounded capitalize">{userInfo.frequency}</div>
              </div>
            </div>

            <div>
              <Label>Created Date</Label>
              <div className="p-2 bg-muted rounded">{formatDate(userInfo.created_at)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentHistory.length > 0 && (
        <Card className="table-container">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Payment History
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>{paymentHistory.length} payment{paymentHistory.length !== 1 ? 's' : ''} found</span>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.invoiceNo}>
                    <TableCell className="font-medium">{payment.invoiceNo}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="font-medium">₹{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {payment.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success">
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {userInfo && paymentHistory.length === 0 && (
        <Card className="form-container">
          <CardContent className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
            <p className="text-muted-foreground">
              This user has not made any payments yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};