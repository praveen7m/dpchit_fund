import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCards } from "@/components/admin/StatsCards";
import { PaymentRecords } from "@/components/admin/PaymentRecords";
import { FilterBar } from "@/components/admin/FilterBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ResetService } from "@/services/resetService";
import { LayoutDashboard, Database, Filter, Users, TrendingUp, RotateCcw } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState({
    search: "",
    dateRange: { from: null, to: null },
    frequency: "all"
  });
  const [isResetting, setIsResetting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.username || user.role !== 'admin' || !token) {
      navigate('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This will delete all payments and users permanently. This action cannot be undone.')) {
      return;
    }

    try {
      setIsResetting(true);
      await ResetService.clearAllData();
      toast({
        title: "Data Cleared",
        description: "All payments and users have been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "payments", label: "All Payments", icon: Database },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <StatsCards />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recent Payments</h2>
              </div>
              <FilterBar filters={filters} onFiltersChange={setFilters} />
              <PaymentRecords filters={filters} showAll={false} />
            </div>
          </div>
        );
      case "payments":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">All Payment Records</h2>
            </div>
            <FilterBar filters={filters} onFiltersChange={setFilters} />
            <PaymentRecords filters={filters} showAll={true} />
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <StatsCards />
            <PaymentRecords filters={filters} showAll={false} />
          </div>
        );
    }
  };

  return (
    <div className="page-container flex">
      <Sidebar 
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userRole="admin"
      />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor chit fund activities, manage payments, and view comprehensive reports.
                </p>
              </div>
              <Button
                onClick={handleResetData}
                disabled={isResetting}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Clear All Data
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;