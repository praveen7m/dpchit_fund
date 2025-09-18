import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Eye, RotateCcw } from "lucide-react";
import { InvoicePreview } from "./InvoicePreview";
import { usePayments } from "@/hooks/usePayments";

export const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    amount: "",
    frequency: ""
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createPayment } = usePayments();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    if (!formData.name || !formData.phone || !formData.amount || !formData.frequency) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields to preview the invoice.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.amount || !formData.frequency) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceNo = `INV-${Date.now()}`;
      const paymentData = {
        ...formData,
        invoiceNo,
        date: new Date().toISOString().split('T')[0],
        status: "Paid"
      };

      // Save to database
      await createPayment(paymentData);

      toast({
        title: "Payment Successful!",
        description: `Invoice ${invoiceNo} has been generated and saved to database.`,
      });

      // Clear form
      setFormData({
        name: "",
        phone: "",
        location: "",
        amount: "",
        frequency: ""
      });
      
      setShowPreview(false);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to save payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: "",
      phone: "",
      location: "",
      amount: "",
      frequency: ""
    });
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <Card className="form-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Enter the payment details to generate an invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location (optional)"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Payment Frequency *</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Invoice
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay & Generate Invoice
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClear}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <InvoicePreview 
          data={formData}
          onClose={() => setShowPreview(false)}
          onConfirm={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};