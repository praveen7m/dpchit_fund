import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaymentForm } from "@/components/user/PaymentForm";
import { PaymentHistory } from "@/components/user/PaymentHistory";
import { Home, CreditCard, History } from "lucide-react";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("payment");

  const sidebarItems = [
    { id: "payment", label: "Make Payment", icon: CreditCard },
    { id: "history", label: "Payment History", icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "payment":
        return <PaymentForm />;
      case "history":
        return <PaymentHistory />;
      default:
        return <PaymentForm />;
    }
  };

  return (
    <div className="page-container flex">
      <Sidebar 
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userRole="user"
      />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Manage your chit fund payments and view your transaction history.
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;