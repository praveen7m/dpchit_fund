
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Database, Trash2, FileDown } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminInvoicePreview } from "@/components/admin/AdminInvoicePreview";
import { PaymentService } from "@/services/paymentService";
import { Payment } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface PaymentRecordsProps {
  filters: {
    search: string;
    dateRange: { from: Date | null; to: Date | null };
    frequency: string;
  };
  showAll?: boolean;
}

const exportToCSV = (data: Payment[], filename: string) => {
  const csvContent = [
    ["Invoice No", "Name", "Phone", "Location", "Amount", "Frequency", "Date", "Status"],
    ...data.map((payment) => [
      payment.invoiceNo,
      payment.name,
      payment.phone,
      payment.location,
      payment.amount,
      payment.frequency,
      payment.date,
      payment.status,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

const exportToPDF = (data: Payment[], filename: string) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('DPChits Payment Records', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Prepare table data
    const tableData = data.map((payment) => [
      payment.invoiceNo,
      payment.name,
      payment.phone,
      payment.location || 'N/A',
      `₹${payment.amount}`,
      payment.frequency,
      new Date(payment.date).toLocaleDateString(),
      payment.status,
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Invoice No', 'Name', 'Phone', 'Location', 'Amount', 'Frequency', 'Date', 'Status']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

export const PaymentRecords = ({ filters, showAll = true }: PaymentRecordsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPayments = async () => {
      try {
        // Migrate localStorage data to database (one-time)
        await PaymentService.migrateFromLocalStorage();
        
        // Load payments from database and sort by newest first
        const dbPayments = await PaymentService.getAllPayments();
        const sortedPayments = dbPayments.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
        setPayments(sortedPayments);
      } catch (error) {
        console.error('Error loading payments:', error);
        // Fallback to localStorage if database fails
        const storedPayments = JSON.parse(localStorage.getItem("payments") || "[]");
        setPayments(storedPayments);
      }
    };
    
    loadPayments();
    
    // Listen for payment updates
    const handlePaymentUpdate = () => {
      loadPayments();
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
    };
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      try {
        // Use database service for filtering
        let filtered = await PaymentService.getFilteredPayments({
          search: filters.search,
          frequency: filters.frequency,
          dateRange: filters.dateRange
        });

        // Sort by newest first
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });

        // If not showing all, limit to recent payments
        if (!showAll) {
          filtered = filtered.slice(0, 10);
        }

        setFilteredPayments(filtered);
      } catch (error) {
        console.error('Error applying filters:', error);
        // Fallback to client-side filtering
        let filtered = [...payments];

        if (filters.search) {
          filtered = filtered.filter(payment =>
            payment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.phone.includes(filters.search) ||
            payment.invoiceNo.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        if (filters.frequency && filters.frequency !== "all") {
          filtered = filtered.filter(payment => payment.frequency === filters.frequency);
        }

        if (filters.dateRange.from) {
          filtered = filtered.filter(payment => {
            const paymentDate = new Date(payment.date);
            const fromDate = new Date(filters.dateRange.from!);
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date();
            
            return paymentDate >= fromDate && paymentDate <= toDate;
          });
        }

        if (!showAll) {
          filtered = filtered.slice(0, 10);
        }

        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
        setFilteredPayments(filtered);
      }
    };

    applyFilters();
  }, [payments, filters, showAll]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewInvoice = (payment: Payment) => {
    setSelectedInvoice(payment);
    setIsModalOpen(true);
  };



  const handleDeleteInvoice = async (payment: Payment) => {
    if (!payment.id) return;
    
    if (!confirm(`Are you sure you want to delete invoice ${payment.invoiceNo}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await PaymentService.deletePayment(payment.id);
      if (success) {
        toast({
          title: "Invoice Deleted",
          description: `Invoice ${payment.invoiceNo} has been deleted successfully.`,
        });
        // Reload payments
        const dbPayments = await PaymentService.getAllPayments();
        const sortedPayments = dbPayments.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
        setPayments(sortedPayments);
      } else {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="table-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            {showAll ? "All Payment Records" : "Recent Payments"}
          </CardTitle>
          <CardDescription>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </CardDescription>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredPayments, "payment_records.csv")}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => exportToPDF(filteredPayments, "payment_records.pdf")}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {payments.length === 0 
                  ? "No payments have been recorded yet."
                  : "No payments match the current filter criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.invoiceNo} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{payment.invoiceNo}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="font-medium">{payment.name}</TableCell>
                    <TableCell>{payment.phone}</TableCell>
                    <TableCell>{payment.location || "N/A"}</TableCell>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(payment)}
                          disabled={isLoading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <AdminInvoicePreview
          data={{
            invoiceNo: selectedInvoice.invoiceNo,
            name: selectedInvoice.name,
            phone: selectedInvoice.phone,
            location: selectedInvoice.location,
            amount: selectedInvoice.amount,
            frequency: selectedInvoice.frequency,
            date: selectedInvoice.date,
            status: selectedInvoice.status,
          }}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
};