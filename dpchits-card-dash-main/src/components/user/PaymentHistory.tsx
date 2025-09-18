import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Search, FileText, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";
import { PaymentService } from "@/services/paymentService";
import { Payment } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { AdminInvoicePreview } from "../admin/AdminInvoicePreview";

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

export const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadPayments = async () => {
    try {
      const dbPayments = await PaymentService.getAllPayments();
      // Sort by newest first (by createdAt or date)
      const sortedPayments = dbPayments.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      setPayments(sortedPayments);
      setFilteredPayments(sortedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  useEffect(() => {
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
    // Filter payments based on search term
    const filtered = payments.filter(payment =>
      payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone.includes(searchTerm)
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewInvoice = (payment: Payment) => {
    setSelectedInvoice(payment);
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
        loadPayments();
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
    <div className="space-y-6">
      <Card className="form-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>
            View and manage your previous chit fund payments
          </CardDescription>
          <Button
            variant="primary"
            size="sm"
            onClick={() => exportToCSV(filteredPayments, "payment_history.csv")}
            className="mt-2"
          >
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, invoice number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {payments.length === 0 
                  ? "You haven't made any payments yet. Start by making your first payment."
                  : "No payments match your search criteria."
                }
              </p>
            </div>
          ) : (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
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
                      <TableCell>{payment.name}</TableCell>
                      <TableCell className="font-medium">
                        ₹{payment.amount}
                      </TableCell>
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
            </div>
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
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};