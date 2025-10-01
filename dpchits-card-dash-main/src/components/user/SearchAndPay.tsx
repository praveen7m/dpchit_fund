import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, CreditCard, Eye, FileDown } from "lucide-react";
import { InvoicePreview } from "./InvoicePreview";
import { usePayments } from "@/hooks/usePayments";

export const SearchAndPay = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { createPayment } = usePayments();

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
      // Search for user by phone number in payments/users
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/payments/search-user?phone=${searchPhone}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        setUserData(user);
      } else {
        toast({
          title: "User Not Found",
          description: "No user found with this phone number",
          variant: "destructive",
        });
        setUserData(null);
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

  const handlePay = async () => {
    if (!userData) return;

    setIsPaying(true);
    try {
      const invoiceNo = `INV-${Date.now()}`;
      const paymentData = {
        invoiceNo,
        name: userData.name,
        phone: userData.phone,
        location: userData.location,
        amount: userData.amount,
        frequency: userData.frequency,
        date: new Date().toISOString().split('T')[0],
        status: "Paid"
      };

      await createPayment(paymentData);

      toast({
        title: "Payment Successful!",
        description: `Payment recorded for ${userData.name}`,
      });

      // Clear search
      setSearchPhone("");
      setUserData(null);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePreview = () => {
    if (!userData) return;
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <Card className="form-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Search User
          </CardTitle>
          <CardDescription>
            Enter phone number to find user and process payment
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

      {userData && (
        <Card className="form-container">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              User Details
            </CardTitle>
            <CardDescription>
              Process payment for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <div className="p-2 bg-muted rounded">{userData.name}</div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="p-2 bg-muted rounded">{userData.phone}</div>
              </div>
            </div>
            
            <div>
              <Label>Location</Label>
              <div className="p-2 bg-muted rounded">{userData.location || 'N/A'}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Amount</Label>
                <div className="p-2 bg-muted rounded font-semibold">₹{userData.amount}</div>
              </div>
              <div>
                <Label>Frequency</Label>
                <div className="p-2 bg-muted rounded capitalize">{userData.frequency}</div>
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
                onClick={handlePay}
                disabled={isPaying}
                className="flex items-center gap-2"
              >
                {isPaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{userData.amount}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview && userData && (
        <InvoicePreview 
          data={{
            name: userData.name,
            phone: userData.phone,
            location: userData.location,
            amount: userData.amount,
            frequency: userData.frequency
          }}
          onClose={() => setShowPreview(false)}
          onConfirm={handlePay}
          isSubmitting={isPaying}
        />
      )}
    </div>
  );
};