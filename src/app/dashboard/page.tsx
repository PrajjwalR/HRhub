import { Clock, Timer, Coins, Wallet } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import PaymentChart from "@/components/dashboard/PaymentChart";
import PayPeriodCalendar from "@/components/dashboard/PayPeriodCalendar";
import ActivityLog from "@/components/dashboard/ActivityLog";
import RequiredActions from "@/components/dashboard/RequiredActions";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-[#2C2C2C]">Dashboard</h1>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Clock}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          value="320.00"
          label="Total working hours"
          change="+3Hrs longer vs last month"
          changeType="positive"
        />
        <StatsCard
          icon={Timer}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          value="56.00"
          label="Total overtime hours"
          change="+1Hrs longer vs last month"
          changeType="positive"
        />
        <StatsCard
          icon={Coins}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-50"
          value="80.32"
          label="Total ultimate hours"
          change="+5Hrs longer vs last month"
          changeType="positive"
        />
        <StatsCard
          icon={Wallet}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          value="132"
          label="Total payroll paid"
          change="12 paid vs last month"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 items-stretch">
        {/* Payment Chart - Takes 2 columns */}
        <div className="lg:col-span-2 flex w-full">
          <PaymentChart />
        </div>

        {/* Calendar - Takes 1 column */}
        <div className="flex w-full">
          <PayPeriodCalendar />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityLog />
        <RequiredActions />
      </div>
    </div>
  );
}
