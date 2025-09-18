import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentService } from "@/services/paymentService";

export const DataDebug = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const payments = await PaymentService.getAllPayments();
        const localStorageData = localStorage.getItem('dp_chit_payments');
        const oldData = localStorage.getItem('payments');
        
        setData({
          payments,
          localStorageData: localStorageData ? JSON.parse(localStorageData) : null,
          oldData: oldData ? JSON.parse(oldData) : null,
          totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
          uniqueUsers: new Set(payments.map(p => p.phone)).size
        });
      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    loadData();
  }, []);

  if (!data) return <div>Loading debug info...</div>;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};