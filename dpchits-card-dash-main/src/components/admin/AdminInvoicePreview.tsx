import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Printer } from "lucide-react";

interface AdminInvoicePreviewProps {
  data: {
    invoiceNo: string;
    name: string;
    phone: string;
    location: string;
    amount: string;
    frequency: string;
    date: string;
    status: string;
  };
  onClose: () => void;
}

export const AdminInvoicePreview = ({ data, onClose }: AdminInvoicePreviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>View invoice information</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invoice Header */}
          <div className="text-center space-y-2 p-6 bg-primary/5 rounded-lg print:bg-transparent">
            <h2 className="text-2xl font-bold text-primary">Greedam</h2>
            <h3 className="text-lg font-semibold text-primary">Ram Finance</h3>
            <p className="text-sm text-muted-foreground">Collection Management System</p>
          </div>

          {/* Invoice Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Invoice Details</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Invoice No:</span> {data.invoiceNo}</p>
                <p><span className="font-medium">Date:</span> {formatDate(data.date)}</p>
                <p><span className="font-medium">Status:</span> <span className="text-success font-medium">{data.status}</span></p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Details</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Frequency:</span> {data.frequency}</p>
                <p><span className="font-medium">Amount:</span> ₹{data.amount}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Customer Information</h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <p><span className="font-medium">Name:</span> {data.name}</p>
              <p><span className="font-medium">Phone:</span> {data.phone}</p>
              {data.location && <p><span className="font-medium">Location:</span> {data.location}</p>}
            </div>
          </div>

          <Separator />

          {/* Amount Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Summary</h3>
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-primary">₹{data.amount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)} payment
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};