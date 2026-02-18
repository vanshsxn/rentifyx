import { useState } from "react";
import { Calculator, PiggyBank, Wallet, ShoppingBag } from "lucide-react";

const BudgetAnalyzer = () => {
  const [income, setIncome] = useState("");
  const parsed = parseInt(income) || 0;

  const rent = Math.round(parsed * 0.4);
  const essentials = Math.round(parsed * 0.3);
  const savings = Math.round(parsed * 0.3);

  const segments = [
    { label: "Rent (40%)", value: rent, color: "bg-primary", icon: Wallet },
    { label: "Essentials (30%)", value: essentials, color: "bg-warning", icon: ShoppingBag },
    { label: "Savings (30%)", value: savings, color: "bg-success", icon: PiggyBank },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4 card-shadow">
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Budget Analyzer</h3>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Monthly Income (¥)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="e.g. 300000"
          className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {parsed > 0 && (
        <div className="space-y-3">
          {/* Visual bar */}
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="bg-primary" style={{ width: "40%" }} />
            <div className="bg-warning" style={{ width: "30%" }} />
            <div className="bg-success" style={{ width: "30%" }} />
          </div>

          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div key={seg.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />
                  {seg.label}
                </span>
                <span className="text-sm font-semibold text-foreground">¥{seg.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetAnalyzer;
