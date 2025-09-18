import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { PaymentService } from "@/services/paymentService";
import { UserService } from "@/services/userService";
import { Payment } from "@/lib/database";

export const StatsCards = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    weeklyPayments: 0,
    monthlyPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    try {
      setIsLoading(true);
      const [payments, totalUsers] = await Promise.all([
        PaymentService.getAllPayments(),
        UserService.getTotalUserCount()
      ]);
      
      // Calculate payment stats
      const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      
      // Calculate weekly payments (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyCount = payments.filter(p => new Date(p.date) >= weekAgo).length;
      
      // Calculate monthly payments (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthlyCount = payments.filter(p => new Date(p.date) >= monthAgo).length;
      
      setStats({
        totalUsers,
        totalPayments: totalAmount,
        weeklyPayments: weeklyCount,
        monthlyPayments: monthlyCount
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
    
    // Listen for storage changes to update stats in real-time
    const handleStorageChange = () => {
      calculateStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('paymentUpdated', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('paymentUpdated', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      subtitle: "Registered members",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Total Payments",
      value: `₹${stats.totalPayments.toLocaleString()}`,
      subtitle: "Cumulative amount",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "This Week",
      value: stats.weeklyPayments.toString(),
      subtitle: "Payments this week",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "This Month",
      value: stats.monthlyPayments.toString(),
      subtitle: "Payments this month",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-stats">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="stats-label">{stat.title}</div>
                  <div className={`stats-number ${stat.color}`}>
                    {isLoading ? (
                      <div className="w-16 h-6 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};