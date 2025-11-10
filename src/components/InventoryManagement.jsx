
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Edit, Eye, AlertCircle, CheckCircle, Clock, Search, Filter,
  DollarSign, Calendar, PackageCheck, AlertTriangle, Target, TrendingUp, RefreshCw,
  Bot, X, Send, Brain, Sparkles, ChevronRight, Copy, Truck, ArrowRight,
  BarChart3, Activity, Layers, Box, MapPin, FileText, History, Settings,
  Download, Upload, ChevronDown, Home, Info, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, addDays } from "date-fns";
import { 
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell
} from "recharts";
import { toast } from "sonner";

// Enhanced Mock Data with Advanced Metrics
const MOCK_DATA = {
  kpis: {
    totalValue: { value: 13638000, delta: 0.052, spark: [12, 14, 13, 15, 18, 17] },
    coverageDays: { value: 267, delta: -0.021, spark: [28, 26, 27, 26, 25, 27] },
    fillRate: { value: 0.818, delta: 0.035, spark: [78, 80, 81, 82, 81, 82] },
    stockoutRisk: { value: 0.096, delta: -0.012, spark: [12, 11, 10, 9, 10, 9] },
    agingPct: { value: 0.452, delta: 0.023, spark: [42, 43, 44, 45, 45, 45] },
    accuracy: { value: 0.953, delta: 0.018, spark: [93, 94, 95, 95, 96, 95] },
    forecastAcc: { value: 0.923, delta: -0.005, spark: [92, 93, 93, 92, 92, 92] },
    turnover: { value: 6.0, delta: 0.042, spark: [5.8, 5.9, 6.0, 6.1, 6.0, 6.0] },
    serviceLevel: { value: 0.937, delta: 0.018, spark: [91, 92, 93, 94, 93, 94] },
    backorderValue: { value: 48500, delta: -0.124, spark: [65, 60, 55, 52, 50, 48] },
    carryingCost: { value: 18200, delta: 0.035, spark: [16, 17, 17, 18, 18, 18] },
    fefoCompliance: { value: 0.972, delta: 0.008, spark: [95, 96, 97, 97, 97, 97] },
    forecastBias: { value: 0.034, delta: -0.012, spark: [5, 4.5, 4, 3.8, 3.5, 3.4] },
    supplierOTD: { value: 0.883, delta: -0.022, spark: [90, 89, 88, 88, 88, 88] }
  },
  warehouses: [
    { id: "WH-A", name: "WH-A", health: "Healthy", skuCount: 136, value: 3729000, supplyDays: 241, serviceLevel: 95.2, throughput: 1240 },
    { id: "WH-B", name: "WH-B", health: "Healthy", skuCount: 116, value: 3099000, supplyDays: 372, serviceLevel: 94.8, throughput: 980 },
    { id: "WH-C", name: "WH-C", health: "At-Risk", skuCount: 106, value: 2629000, supplyDays: 255, serviceLevel: 89.3, throughput: 750 },
    { id: "WH-D", name: "WH-D", health: "Healthy", skuCount: 142, value: 4181000, supplyDays: 216, serviceLevel: 96.1, throughput: 1450 }
  ]
};

const generateInventoryData = () => {
  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Office Supplies', 'Beauty', 'Sports', 'Automotive', 'Hardware', 'Chemicals'];
  const warehouses = ['WH-A', 'WH-B', 'WH-C', 'WH-D'];
  const suppliers = ['Acme Corp', 'Global Supply', 'TechVendor', 'FastShip', 'Premium Goods', 'EcoSupply'];
  const abcClass = ['A', 'B', 'C'];
  const xyzClass = ['X', 'Y', 'Z'];
  
  const items = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const onHand = Math.floor(Math.random() * 1000) + 50;
    const committed = Math.floor(onHand * Math.random() * 0.3);
    const available = onHand - committed;
    const safetyStock = Math.floor(Math.random() * 200) + 50;
    const forecasted = Math.floor(Math.random() * 300);
    const inTransit = Math.floor(Math.random() * 100);
    const unitCost = Math.floor(Math.random() * 100) + 10;
    const abc = abcClass[Math.floor(Math.random() * abcClass.length)];
    const xyz = xyzClass[Math.floor(Math.random() * xyzClass.length)];
    
    let status = 'Healthy';
    if (available < safetyStock * 0.5) status = 'Critical';
    else if (available < safetyStock) status = 'At-Risk';
    else if (onHand > safetyStock * 4) status = 'Overstocked';
    else if (category === 'Food' && Math.random() > 0.8) status = 'Expiring';
    
    const daysOfSupply = forecasted > 0 ? Math.floor((available / forecasted) * 30) : 999;
    const daysOld = Math.floor(Math.random() * 180);
    
    // Generate 8-week sparkline data
    const sparkline = Array.from({ length: 8 }, () => Math.floor(Math.random() * 200) + onHand - 100);
    
    items.push({
      id: `INV-${10000 + i}`,
      sku: `SKU-${String(i).padStart(4, '0')}`,
      name: `${category} Product ${i}`,
      variant: Math.random() > 0.7 ? 'Standard' : null,
      category,
      warehouse,
      zone: `Zone-${Math.floor(Math.random() * 5) + 1}`,
      bin: `Bin-${Math.floor(Math.random() * 20) + 1}`,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      onHand,
      available,
      committed,
      inTransit,
      safetyStock,
      forecasted30: forecasted,
      forecasted60: Math.floor(forecasted * 1.2),
      forecasted90: Math.floor(forecasted * 1.5),
      daysOfSupply,
      unitCost,
      totalValue: onHand * unitCost,
      status,
      abcClass: abc,
      xyzClass: xyz,
      serviceLevel: Math.floor(Math.random() * 20) + 80,
      fillRate: Math.floor(Math.random() * 25) + 75,
      lotCount: category === 'Food' ? Math.floor(Math.random() * 5) + 1 : 0,
      serialCount: category === 'Electronics' || category === 'Hardware' ? onHand : 0,
      expiryDate: category === 'Food' ? addDays(now, Math.floor(Math.random() * 180)).toISOString() : null,
      lastUpdated: subDays(now, Math.floor(Math.random() * 7)).toISOString(),
      turnoverRate: (Math.random() * 8 + 2).toFixed(1),
      daysOld,
      shrinkageRate: (Math.random() * 3).toFixed(2),
      fefoCompliance: category === 'Food' ? Math.floor(Math.random() * 10) + 90 : 100,
      sparkline
    });
  }
  return items;
};

const generateRestockRecs = (inventory) => {
  return inventory
    .filter(i => i.status === 'Critical' || i.status === 'At-Risk')
    .slice(0, 8)
    .map(item => ({
      sku: item.sku,
      name: item.name,
      currentQty: item.available,
      projectedDemand: item.forecasted30,
      leadTimeDays: Math.floor(Math.random() * 14) + 3,
      recommendedOrderQty: Math.max(item.safetyStock - item.available, 0) + item.forecasted30,
      estimatedCost: (Math.max(item.safetyStock - item.available, 0) + item.forecasted30) * item.unitCost,
      supplier: item.supplier,
      urgency: item.status === 'Critical' ? 'URGENT' : item.daysOfSupply < 14 ? 'High' : 'Normal',
      warehouse: item.warehouse
    }));
};

const generateAnomalies = () => {
  return [
    {
      id: 1,
      type: 'shrinkage',
      severity: 'high',
      title: 'Unexpected shrinkage detected in WH-B',
      details: 'SKU-0234 showing 8.2% variance vs expected. Last cycle count 5 days ago.',
      warehouse: 'WH-B',
      sku: 'SKU-0234',
      timestamp: new Date().toISOString(),
      impact: '$4,200',
      suggestedFix: 'Immediate cycle count + review security footage'
    },
    {
      id: 2,
      type: 'delivery',
      severity: 'medium',
      title: 'Supplier delivery variance +2.5 days',
      details: 'TechVendor Inc consistently delayed across 8 POs this month.',
      supplier: 'TechVendor Inc',
      timestamp: subDays(new Date(), 1).toISOString(),
      impact: '3 SKUs at risk',
      suggestedFix: 'Escalate to supplier, adjust lead times'
    },
    {
      id: 3,
      type: 'mismatch',
      severity: 'high',
      title: 'Data mismatch: SKU-0112 vs sales feed',
      details: 'System: 450 units, Physical count: 423 units. Channel feed: 440 units.',
      sku: 'SKU-0112',
      timestamp: subDays(new Date(), 2).toISOString(),
      impact: '27 units',
      suggestedFix: 'Reconcile with authoritative source'
    },
    {
      id: 4,
      type: 'aging',
      severity: 'medium',
      title: 'Aging spike in Electronics category',
      details: '15% increase in >90d inventory vs last month.',
      category: 'Electronics',
      timestamp: subDays(new Date(), 3).toISOString(),
      impact: '$12,400 tied up',
      suggestedFix: 'Run clearance promo or redistribute'
    },
    {
      id: 5,
      type: 'expiry',
      severity: 'high',
      title: 'Lot expiry risk: 6 batches < 14 days',
      details: 'Food category lots expiring soon. Total value: $8,900.',
      category: 'Food',
      timestamp: new Date().toISOString(),
      impact: '$8,900',
      suggestedFix: 'Expedite sales or markdown'
    }
  ];
};

const generateCostOptimizations = () => {
  return [
    {
      id: 1,
      type: 'moq',
      title: 'Reduce MOQ for Acme Corp by 10%',
      description: 'Analysis shows current MOQ exceeds demand by 12%. Negotiate lower minimum.',
      savings: 8500,
      complexity: 'Low',
      timeline: '2-4 weeks'
    },
    {
      id: 2,
      type: 'reorder',
      title: 'Shift reorder pattern for SKU-0334 → 3-week cadence',
      description: 'Current 2-week cadence creates excess holding costs. Extend to 21 days.',
      savings: 3200,
      complexity: 'Low',
      timeline: 'Immediate'
    },
    {
      id: 3,
      type: 'transfer',
      title: 'Redistribute overstock from WH-C to WH-A',
      description: 'Transfer 450 units to avoid stockout in WH-A and reduce liquidation risk in WH-C.',
      savings: 12400,
      complexity: 'Medium',
      timeline: '1 week'
    },
    {
      id: 4,
      type: 'consolidation',
      title: 'Consolidate shipments from 3 suppliers',
      description: 'Combine orders from Premium Goods, EcoSupply, and FastShip to reduce freight costs.',
      savings: 6800,
      complexity: 'Medium',
      timeline: '2 weeks'
    },
    {
      id: 5,
      type: 'storage',
      title: 'Move slow movers to lower-cost zone',
      description: 'Relocate 12 SKUs with <2x turnover to Zone 5 (40% lower storage cost).',
      savings: 4100,
      complexity: 'Low',
      timeline: '3-5 days'
    }
  ];
};

const generateSupplierData = () => {
  const suppliers = [
    'Acme Corp', 'Global Supply', 'TechVendor', 'FastShip',
    'Premium Goods', 'EcoSupply', 'DirectSource', 'MegaDistributor'
  ];

  return suppliers.map(name => ({
    name,
    onTimeDelivery: Math.floor(Math.random() * 30 + 70),
    leadTimeVariance: (Math.random() * 3).toFixed(1),
    fillRate: Math.floor(Math.random() * 20 + 80),
    qualityIssueRate: (Math.random() * 5).toFixed(1),
    reliabilityScore: Math.floor(Math.random() * 30 + 70),
    riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
    totalOrders: Math.floor(Math.random() * 200 + 50),
    slaBreaches: Math.floor(Math.random() * 10),
    leadTimeDrift: (Math.random() * 2 - 1).toFixed(1),
    asnAccuracy: Math.floor(Math.random() * 15 + 85),
    defectRate: (Math.random() * 2).toFixed(2)
  }));
};

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [restockRecs, setRestockRecs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [costOptimizations, setCostOptimizations] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("30D");
  const [filters, setFilters] = useState({
    category: [],
    warehouse: [],
    supplier: [],
    status: []
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [explainViewOpen, setExplainViewOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [cycleCountOpen, setCycleCountOpen] = useState(false);
  const [anomalyDrawer, setAnomalyDrawer] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);
  const [chartView, setChartView] = useState("throughput");

  useEffect(() => {
    const inv = generateInventoryData();
    setInventory(inv);
    setRestockRecs(generateRestockRecs(inv));
    setAnomalies(generateAnomalies());
    setCostOptimizations(generateCostOptimizations());
    setSupplierData(generateSupplierData());
  }, []);

  const filteredInventory = useMemo(() => {
    let result = inventory || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.sku?.toLowerCase().includes(query) ||
        i.name?.toLowerCase().includes(query) ||
        i.supplier?.toLowerCase().includes(query) ||
        i.warehouse?.toLowerCase().includes(query)
      );
    }

    if (filters.category?.length > 0) {
      result = result.filter(i => filters.category.includes(i.category));
    }

    if (filters.warehouse?.length > 0) {
      result = result.filter(i => filters.warehouse.includes(i.warehouse));
    }

    if (filters.supplier?.length > 0) {
      result = result.filter(i => filters.supplier.includes(i.supplier));
    }

    if (filters.status?.length > 0) {
      result = result.filter(i => filters.status.includes(i.status));
    }

    return result;
  }, [inventory, searchQuery, filters]);

  const kpis = useMemo(() => {
    if (!filteredInventory || filteredInventory.length === 0) return MOCK_DATA.kpis;
    
    const totalValue = filteredInventory.reduce((sum, i) => sum + i.totalValue, 0);
    const avgDaysOfSupply = filteredInventory.reduce((sum, i) => sum + i.daysOfSupply, 0) / filteredInventory.length;
    const fillRate = filteredInventory.filter(i => i.available >= i.forecasted30).length / filteredInventory.length;
    const stockoutRisk = filteredInventory.filter(i => i.status === 'Critical').length / filteredInventory.length;
    const agingPct = filteredInventory.filter(i => i.daysOld > 90).length / filteredInventory.length;
    
    return {
      totalValue: { ...MOCK_DATA.kpis.totalValue, value: totalValue },
      coverageDays: { ...MOCK_DATA.kpis.coverageDays, value: Math.floor(avgDaysOfSupply) },
      fillRate: { ...MOCK_DATA.kpis.fillRate, value: fillRate },
      stockoutRisk: { ...MOCK_DATA.kpis.stockoutRisk, value: stockoutRisk },
      agingPct: { ...MOCK_DATA.kpis.agingPct, value: agingPct },
      accuracy: MOCK_DATA.kpis.accuracy,
      forecastAcc: MOCK_DATA.kpis.forecastAcc,
      turnover: MOCK_DATA.kpis.turnover,
      serviceLevel: MOCK_DATA.kpis.serviceLevel,
      backorderValue: MOCK_DATA.kpis.backorderValue,
      carryingCost: MOCK_DATA.kpis.carryingCost,
      fefoCompliance: MOCK_DATA.kpis.fefoCompliance,
      forecastBias: MOCK_DATA.kpis.forecastBias,
      supplierOTD: MOCK_DATA.kpis.supplierOTD
    };
  }, [filteredInventory]);

  const movementTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM d'),
        receipts: Math.floor(Math.random() * 200) + 100,
        sales: Math.floor(Math.random() * 180) + 80,
        transfers: Math.floor(Math.random() * 50) + 10
      };
    });
  }, []);

  // Working Capital Waterfall Data
  const workingCapitalData = useMemo(() => {
    return [
      { name: 'Starting Inv', value: 13200, type: 'start' },
      { name: 'Receipts', value: 3400, type: 'positive' },
      { name: 'Sales', value: -2800, type: 'negative' },
      { name: 'Markdowns', value: -120, type: 'negative' },
      { name: 'Write-offs', value: -42, type: 'negative' },
      { name: 'Ending Inv', value: 13638, type: 'end' }
    ];
  }, []);

  // Aging Pyramid Data
  const agingData = useMemo(() => {
    return [
      { range: '0-90d', value: 58, color: '#10b981' },
      { range: '91-180d', value: 28, color: '#f59e0b' },
      { range: '181-270d', value: 9, color: '#ef4444' },
      { range: '271+d', value: 5, color: '#991b1b' }
    ];
  }, []);

  // Service Level Matrix (SKU x Channel)
  const serviceLevelMatrix = useMemo(() => {
    const channels = ['Shopify', 'Amazon', 'POS', 'B2B'];
    const skus = filteredInventory.slice(0, 12);
    
    return skus.map(sku => ({
      sku: sku.sku,
      Shopify: Math.floor(Math.random() * 20) + 80,
      Amazon: Math.floor(Math.random() * 20) + 80,
      POS: Math.floor(Math.random() * 20) + 80,
      B2B: Math.floor(Math.random() * 20) + 80
    }));
  }, [filteredInventory]);

  // ABC/XYZ Grid Data
  const abcXyzData = useMemo(() => {
    const grid = {};
    filteredInventory.forEach(item => {
      const key = `${item.abcClass}-${item.xyzClass}`;
      if (!grid[key]) {
        grid[key] = { abc: item.abcClass, xyz: item.xyzClass, value: 0, count: 0 };
      }
      grid[key].value += item.totalValue;
      grid[key].count += 1;
    });
    return Object.values(grid);
  }, [filteredInventory]);

  // Forecast Bias & MAPE Data
  const forecastMetrics = useMemo(() => {
    return filteredInventory.slice(0, 20).map(item => ({
      sku: item.sku,
      bias: (Math.random() * 20 - 10).toFixed(1),
      mape: (Math.random() * 40 + 10).toFixed(1),
      revenue: item.totalValue
    }));
  }, [filteredInventory]);

  const handleAiChat = (message) => {
    setChatMessages([...chatMessages, { role: 'user', content: message }]);
    setChatInput("");

    setTimeout(() => {
      let response = "";
      if (message.toLowerCase().includes('stockout')) {
        const critical = filteredInventory.filter(i => i.status === 'Critical').slice(0, 3);
        response = `Found ${critical.length} SKUs at high stockout risk: ${critical.map(i => i.sku).join(', ')}. Recommended action: Create purchase orders immediately with 3-day expedited shipping to suppliers: ${critical.map(i => i.supplier).join(', ')}.`;
      } else if (message.toLowerCase().includes('expir')) {
        const expiring = filteredInventory.filter(i => i.status === 'Expiring').length;
        response = `${expiring} SKUs expiring in next 45 days (${(expiring / filteredInventory.length * 100).toFixed(1)}%). Primary categories: Food, Beauty. Recommendation: Run 20% clearance promotion or redistribute to high-velocity locations.`;
      } else if (message.toLowerCase().includes('moq') || message.toLowerCase().includes('optimize')) {
        response = `Found ${costOptimizations.length} optimization opportunities with total potential savings of $${costOptimizations.reduce((sum, o) => sum + o.savings, 0).toLocaleString()}. Top recommendation: ${costOptimizations[0].title} (saves $${costOptimizations[0].savings.toLocaleString()}).`;
      } else if (message.toLowerCase().includes('wh-b') || message.toLowerCase().includes('shrinkage')) {
        response = `WH-B shows 8.2% shrinkage on SKU-0234 ($4,200 impact). Root causes: (1) Last cycle count was 5 days ago, (2) Zone 3 camera offline for 48h, (3) High-traffic area. Recommend: Immediate cycle count + security review + increase count frequency to weekly.`;
      } else if (message.toLowerCase().includes('po') || message.toLowerCase().includes('purchase')) {
        response = `Analyzing restock needs... Found ${restockRecs.length} SKUs requiring purchase orders. Total estimated cost: $${restockRecs.reduce((sum, r) => sum + r.estimatedCost, 0).toLocaleString()}. Breakdown by urgency: URGENT (${restockRecs.filter(r => r.urgency === 'URGENT').length}), High (${restockRecs.filter(r => r.urgency === 'High').length}), Normal (${restockRecs.filter(r => r.urgency === 'Normal').length}).`;
      } else {
        response = "I can analyze stockout risks, forecast demand, investigate anomalies, optimize costs, and generate purchase orders. Try asking specific questions like 'What will stockout next week?' or 'Generate PO for under-safety SKUs'.";
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  const handleApplyOptimization = (opt) => {
    setAppliedOptimizations([...appliedOptimizations, opt.id]);
    toast.success(
      <div>
        <div className="font-medium">Optimization Applied</div>
        <div className="text-xs">{opt.title} - Savings: ${opt.savings.toLocaleString()}</div>
      </div>
    );
  };

  const handleCreatePO = (rec) => {
    setCreatePOOpen(true);
    toast.success(`Creating PO for ${rec.sku} - ${rec.recommendedOrderQty} units`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Healthy": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "At-Risk": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Overstocked": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Critical": return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
      case "Expiring": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case "Healthy": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "At-Risk": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Critical": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getServiceLevelColor = (value) => {
    if (value >= 95) return 'bg-emerald-500';
    if (value >= 90) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getMAPEColor = (value) => {
    const floatValue = parseFloat(value);
    if (floatValue < 20) return 'text-emerald-400';
    if (floatValue < 35) return 'text-amber-400';
    return 'text-red-400';
  };

  const getBiasColor = (value) => {
    const absValue = Math.abs(parseFloat(value));
    if (absValue < 5) return 'text-emerald-400';
    if (absValue < 10) return 'text-amber-400';
    return 'text-red-400';
  };

  const Sparkline = ({ data }) => (
    <ResponsiveContainer width="100%" height={20}>
      <LineChart data={data.map((v, i) => ({ v, i }))}>
        <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );

  const KPICard = ({ title, value, delta, spark, suffix = "", tooltip }) => (
    <motion.div whileHover={{ scale: 1.02 }} className="group relative">
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm hover:shadow-lg transition-all h-full">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">{title}</span>
            {tooltip && (
              <Info className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-2xl font-bold text-slate-900">
              {typeof value === 'number' && value < 1 && value !== 0 && value.toFixed(3).endsWith('00') ? (value * 100).toFixed(1) + '%' : 
               typeof value === 'number' && value < 1 && value !== 0 ? value.toFixed(3) :
               typeof value === 'number' && value > 1000000 ? `$${(value / 1000000).toFixed(1)}M` :
               typeof value === 'number' && value > 1000 ? `$${(value / 1000).toFixed(0)}K` :
               typeof value === 'number' ? value.toFixed(1) : value}{suffix}
            </div>
            {delta && (
              <Badge className={cn(
                "text-xs px-1.5 py-0",
                delta > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              )}>
                {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
          {spark && (
            <div className="h-5 text-blue-500">
              <Sparkline data={spark} />
            </div>
          )}
        </CardContent>
      </Card>
      {tooltip && (
        <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {tooltip}
        </div>
      )}
    </motion.div>
  );

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => Array.isArray(arr) ? sum + arr.length : 0, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
          <span>Management Center</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Inventory Management</span>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7D">7 Days</SelectItem>
            <SelectItem value="30D">30 Days</SelectItem>
            <SelectItem value="90D">90 Days</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Command Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search SKU, batch/lot, serial, supplier, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setFilterSheetOpen(true)}
            className="border-slate-200/50 hover:bg-slate-50 rounded-xl bg-white/80 backdrop-blur-sm relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white border-0 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-200/50 hover:bg-slate-50 rounded-xl bg-white/80 backdrop-blur-sm"
            onClick={() => setExplainViewOpen(true)}
          >
            <Brain className="w-4 h-4 mr-2" />
            Explain View
          </Button>
          <Button
            variant="outline"
            className="border-slate-200/50 hover:bg-slate-50 rounded-xl bg-white/80 backdrop-blur-sm"
            onClick={() => setCopilotOpen(!copilotOpen)}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Copilot
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
            onClick={() => setAddInventoryOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Header - 14 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard 
          title="Total Value" 
          value={kpis.totalValue.value} 
          delta={kpis.totalValue.delta} 
          spark={kpis.totalValue.spark}
          tooltip="Total inventory value across all warehouses"
        />
        <KPICard 
          title="Stock Coverage" 
          value={kpis.coverageDays.value} 
          delta={kpis.coverageDays.delta} 
          spark={kpis.coverageDays.spark}
          suffix="d"
          tooltip="Average days of supply based on current inventory and forecast"
        />
        <KPICard 
          title="Fill Rate" 
          value={kpis.fillRate.value} 
          delta={kpis.fillRate.delta} 
          spark={kpis.fillRate.spark}
          tooltip="Percentage of order lines filled from available stock"
        />
        <KPICard 
          title="Stockout Risk" 
          value={kpis.stockoutRisk.value} 
          delta={kpis.stockoutRisk.delta} 
          spark={kpis.stockoutRisk.spark}
          tooltip="Probability of stockout in next 14 days based on current inventory and demand"
        />
        <KPICard 
          title="Aging Inventory" 
          value={kpis.agingPct.value} 
          delta={kpis.agingPct.delta} 
          spark={kpis.agingPct.spark}
          tooltip="Percentage of inventory older than 90 days"
        />
        <KPICard 
          title="Accuracy Rate" 
          value={kpis.accuracy.value} 
          delta={kpis.accuracy.delta} 
          spark={kpis.accuracy.spark}
          tooltip="System inventory accuracy vs physical count"
        />
        <KPICard 
          title="Forecast Accuracy" 
          value={kpis.forecastAcc.value} 
          delta={kpis.forecastAcc.delta} 
          spark={kpis.forecastAcc.spark}
          tooltip="Demand forecast accuracy over last 30 days"
        />
        <KPICard 
          title="Turnover Rate" 
          value={kpis.turnover.value} 
          delta={kpis.turnover.delta} 
          spark={kpis.turnover.spark}
          suffix="x"
          tooltip="Inventory turnover rate (annual)"
        />
        <KPICard 
          title="Service Level" 
          value={kpis.serviceLevel.value} 
          delta={kpis.serviceLevel.delta} 
          spark={kpis.serviceLevel.spark}
          tooltip="On-time fulfillment rate (rolling 30d)"
        />
        <KPICard 
          title="Backorder $" 
          value={kpis.backorderValue.value} 
          delta={kpis.backorderValue.delta} 
          spark={kpis.backorderValue.spark}
          tooltip="Total backorder value at cost"
        />
        <KPICard 
          title="Carrying Cost" 
          value={kpis.carryingCost.value} 
          delta={kpis.carryingCost.delta} 
          spark={kpis.carryingCost.spark}
          suffix="/mo"
          tooltip="Monthly carrying cost (capital, storage, insurance)"
        />
        <KPICard 
          title="FEFO %" 
          value={kpis.fefoCompliance.value} 
          delta={kpis.fefoCompliance.delta} 
          spark={kpis.fefoCompliance.spark}
          tooltip="First-Expired-First-Out compliance"
        />
        <KPICard 
          title="Forecast Bias" 
          value={kpis.forecastBias.value} 
          delta={kpis.forecastBias.delta} 
          spark={kpis.forecastBias.spark}
          suffix="%"
          tooltip="Forecast bias (signed error)"
        />
        <KPICard 
          title="Supplier OTD" 
          value={kpis.supplierOTD.value} 
          delta={kpis.supplierOTD.delta} 
          spark={kpis.supplierOTD.spark}
          tooltip="Supplier On-Time Delivery rate (rolling 30d)"
        />
      </div>

      {/* Main Chart Area with Tabs */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">Analytics View</CardTitle>
            <div className="flex gap-2">
              {[
                { id: 'throughput', label: 'Throughput' },
                { id: 'capital', label: 'Working Capital' },
                { id: 'aging', label: 'Aging' }
              ].map(tab => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={chartView === tab.id ? "default" : "outline"}
                  onClick={() => setChartView(tab.id)}
                  className={cn(
                    "text-xs h-7",
                    chartView === tab.id && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {chartView === 'throughput' && (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="receipts" fill="#10b981" radius={[8, 8, 0, 0]} name="Receipts" />
                <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Sales" />
                <Line type="monotone" dataKey="transfers" stroke="#8b5cf6" strokeWidth={2} name="Transfers" />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartView === 'capital' && (
            <div>
              <div className="text-xs text-slate-600 mb-3">Working Capital Waterfall (Last 30 Days, $K)</div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={workingCapitalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => `$${value}K`} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {workingCapitalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.type === 'start' || entry.type === 'end' ? '#3b82f6' :
                        entry.type === 'positive' ? '#10b981' : '#ef4444'
                      } />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'aging' && (
            <div>
              <div className="text-xs text-slate-600 mb-3">Inventory Aging Distribution (%)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={agingData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={70} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution & Trends - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Warehouse Distribution */}
        <div className="lg:col-span-4">
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Warehouse Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_DATA.warehouses.map(wh => (
                  <motion.div
                    key={wh.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all border-2",
                      getHealthColor(wh.health)
                    )}
                    onClick={() => setFilters({...filters, warehouse: [wh.id]})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{wh.name}</span>
                      <Badge className={getHealthColor(wh.health)}>
                        {wh.health}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-600">SKUs</div>
                        <div className="font-semibold">{wh.skuCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Value</div>
                        <div className="font-semibold">${(wh.value / 1000000).toFixed(1)}M</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Supply</div>
                        <div className="font-semibold">{wh.supplyDays}d</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service & Performance Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Service Level Matrix */}
          <div className="lg:col-span-7">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm h-full">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-700">Service Level Matrix (SKU × Channel)</CardTitle>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    Explain
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-2 font-semibold text-slate-700">SKU</th>
                        <th className="text-center p-2 font-semibold text-slate-700">Shopify</th>
                        <th className="text-center p-2 font-semibold text-slate-700">Amazon</th>
                        <th className="text-center p-2 font-semibold text-slate-700">POS</th>
                        <th className="text-center p-2 font-semibold text-slate-700">B2B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceLevelMatrix.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 font-mono text-blue-600">{row.sku}</td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className={cn("w-8 h-2 rounded", getServiceLevelColor(row.Shopify))}></div>
                              <span className="text-xs">{row.Shopify}%</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className={cn("w-8 h-2 rounded", getServiceLevelColor(row.Amazon))}></div>
                              <span className="text-xs">{row.Amazon}%</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className={cn("w-8 h-2 rounded", getServiceLevelColor(row.POS))}></div>
                              <span className="text-xs">{row.POS}%</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <div className={cn("w-8 h-2 rounded", getServiceLevelColor(row.B2B))}></div>
                              <span className="text-xs">{row.B2B}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Scorecards */}
          <div className="lg:col-span-5">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm h-full">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-medium text-slate-700">Vendor Scorecards</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {supplierData.slice(0, 6).map((supplier, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-900">{supplier.name}</span>
                        <Badge className={cn(
                          "text-xs",
                          supplier.riskLevel === 'Low' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          supplier.riskLevel === 'Medium' ? "bg-amber-100 text-amber-700 border-amber-200" :
                          "bg-red-100 text-red-700 border-red-200"
                        )}>
                          {supplier.reliabilityScore}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-slate-500">OTD</div>
                          <div className={cn(
                            "font-semibold",
                            supplier.onTimeDelivery >= 90 ? "text-emerald-600" : "text-red-600"
                          )}>{supplier.onTimeDelivery}%</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Drift</div>
                          <div className="font-semibold text-slate-700">{supplier.leadTimeDrift}d</div>
                        </div>
                        <div>
                          <div className="text-slate-500">ASN</div>
                          <div className="font-semibold text-slate-700">{supplier.asnAccuracy}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ABC/XYZ Grid & Forecast Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ABC/XYZ Classification Grid */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700">ABC/XYZ Classification</CardTitle>
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                <Info className="w-3 h-3 mr-1" />
                Guide
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {['X', 'Y', 'Z'].map(xyz => (
                <div key={xyz} className="space-y-2">
                  <div className="text-xs font-semibold text-center text-slate-700">{xyz}</div>
                  {['A', 'B', 'C'].map(abc => {
                    const data = abcXyzData.find(d => d.abc === abc && d.xyz === xyz);
                    const value = data ? data.value : 0;
                    const count = data ? data.count : 0;
                    const maxValue = Math.max(...abcXyzData.map(d => d.value));
                    const intensity = maxValue > 0 ? value / maxValue : 0;
                    
                    return (
                      <motion.div
                        key={`${abc}-${xyz}`}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all",
                          abc === 'A' && xyz === 'X' ? "bg-emerald-500/20 border-2 border-emerald-500" :
                          abc === 'C' && xyz === 'Z' ? "bg-red-500/20 border-2 border-red-500" :
                          "bg-blue-500/10 border border-blue-500/30"
                        )}
                        style={{ opacity: 0.4 + intensity * 0.6 }}
                      >
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900">{abc}-{xyz}</div>
                          <div className="text-xs text-slate-600 mt-1">{count} SKUs</div>
                          <div className="text-xs font-semibold text-slate-900">${(value / 1000).toFixed(0)}K</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500 text-center">
              Click cells to filter inventory table
            </div>
          </CardContent>
        </Card>

        {/* Forecast Bias & MAPE */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-700">Forecast Quality (Bias vs MAPE)</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-2 font-semibold text-slate-700">SKU</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Bias %</th>
                    <th className="text-right p-2 font-semibold text-slate-700">MAPE %</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastMetrics.map((metric, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 font-mono text-blue-600">{metric.sku}</td>
                      <td className={cn("p-2 text-right font-semibold", getBiasColor(metric.bias))}>
                        {metric.bias}%
                      </td>
                      <td className={cn("p-2 text-right font-semibold", getMAPEColor(metric.mape))}>
                        {metric.mape}%
                      </td>
                      <td className="p-2 text-right text-slate-600">${(metric.revenue / 1000).toFixed(1)}K</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Operations Console - Bento 3-Column */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Operations Console
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Restock Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Restock Recommendations</div>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {restockRecs.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {restockRecs.slice(0, 6).map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "p-3 rounded-xl border text-xs",
                      rec.urgency === 'URGENT' 
                        ? "bg-red-50/50 border-red-200" 
                        : rec.urgency === 'High'
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-blue-50/50 border-blue-200"
                    )}
                  >
                    {rec.urgency === 'URGENT' && (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs mb-2 animate-pulse">
                        URGENT
                      </Badge>
                    )}
                    <div className="font-medium text-slate-900 mb-1">{rec.sku}</div>
                    <div className="text-slate-600 space-y-0.5 mb-2">
                      <div>Current: {rec.currentQty} → Order: {rec.recommendedOrderQty}</div>
                      <div>Lead: {rec.leadTimeDays}d | ${rec.estimatedCost.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{rec.supplier} • {rec.warehouse}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        className="flex-1 h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleCreatePO(rec)}
                      >
                        Create PO
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-6">
                        Snooze
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Anomaly Monitor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Anomaly Monitor</div>
                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                  {anomalies.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {anomalies.map(anomaly => (
                  <motion.div
                    key={anomaly.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 rounded-xl border text-xs cursor-pointer",
                      anomaly.severity === 'high' 
                        ? "bg-red-50/50 border-red-200" 
                        : "bg-amber-50/50 border-amber-200"
                    )}
                    onClick={() => {
                      setSelectedAnomaly(anomaly);
                      setAnomalyDrawer(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <AlertTriangle className={cn(
                        "w-3 h-3 mt-0.5",
                        anomaly.severity === 'high' ? "text-red-600" : "text-amber-600"
                      )} />
                      <Badge className={cn(
                        "text-xs",
                        anomaly.severity === 'high' 
                          ? "bg-red-100 text-red-700 border-red-300" 
                          : "bg-amber-100 text-amber-700 border-amber-300"
                      )}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <div className="font-medium text-slate-900 mb-1">{anomaly.title}</div>
                    <div className="text-slate-600 mb-2">{anomaly.details}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Impact: {anomaly.impact}</span>
                      <Button size="sm" variant="outline" className="h-5 text-xs">
                        Investigate
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cost Optimization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Cost Optimization</div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  ${costOptimizations.reduce((sum, o) => sum + o.savings, 0).toLocaleString()}
                </Badge>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {costOptimizations.map(opt => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-xl border text-xs",
                      appliedOptimizations.includes(opt.id)
                        ? "bg-emerald-100 border-emerald-300"
                        : "bg-emerald-50/50 border-emerald-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                        ${opt.savings.toLocaleString()}
                      </Badge>
                      {appliedOptimizations.includes(opt.id) && (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="font-medium text-slate-900 mb-1">{opt.title}</div>
                    <div className="text-slate-600 mb-2">{opt.description}</div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{opt.complexity} complexity</span>
                      <span>{opt.timeline}</span>
                    </div>
                    {!appliedOptimizations.includes(opt.id) ? (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          className="flex-1 h-6 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleApplyOptimization(opt)}
                        >
                          Auto-Apply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-6">
                          Simulate
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-700 font-medium text-center">
                        ✓ Applied
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Inventory Table with Sparklines */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              All Inventory ({filteredInventory.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setTransferOpen(true)}>
                <Truck className="w-3 h-3 mr-1" />
                Transfer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                  <TableHead className="font-semibold text-slate-700">Product</TableHead>
                  <TableHead className="font-semibold text-slate-700">Class</TableHead>
                  <TableHead className="font-semibold text-slate-700">Location</TableHead>
                  <TableHead className="font-semibold text-slate-700">On-Hand</TableHead>
                  <TableHead className="font-semibold text-slate-700">8-Wk Trend</TableHead>
                  <TableHead className="font-semibold text-slate-700">Available</TableHead>
                  <TableHead className="font-semibold text-slate-700">Days Supply</TableHead>
                  <TableHead className="font-semibold text-slate-700">Service %</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Risks</TableHead>
                  <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50 cursor-pointer group"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailDrawer(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}><Checkbox /></TableCell>
                    <TableCell className="font-mono text-sm text-blue-600 font-medium">{item.sku}</TableCell>
                    <TableCell className="text-sm">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          {item.abcClass}
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {item.xyzClass}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.warehouse}</TableCell>
                    <TableCell className="font-semibold">{item.onHand}</TableCell>
                    <TableCell>
                      <div className="w-20 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={item.sparkline.map((v, i) => ({ v, i }))}>
                            <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">{item.available}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={cn(
                        item.daysOfSupply < 14 ? "text-red-600 font-semibold" :
                        item.daysOfSupply < 30 ? "text-amber-600" : "text-slate-600"
                      )}>
                        {item.daysOfSupply}d
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className={cn("w-8 h-2 rounded", getServiceLevelColor(item.serviceLevel))}></div>
                        <span className="text-xs">{item.serviceLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.daysOld > 180 && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">AGE180+</Badge>
                        )}
                        {item.fefoCompliance < 98 && item.lotCount > 0 && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">FEFO</Badge>
                        )}
                        {parseFloat(item.shrinkageRate) > 1.5 && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">SHRINK↑</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setAdjustOpen(true)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Copilot */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96"
          >
            <Card className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 shadow-2xl">
              <CardHeader className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <CardTitle className="text-sm font-medium">Inventory AI</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setCopilotOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-xs text-slate-600 mb-3">Try asking:</p>
                      <div className="space-y-2">
                        {[
                          "What will stockout next week?",
                          "How many units expiring in 45 days?",
                          "Optimize MOQ for Acme Corp",
                          "Generate PO for under-safety SKUs",
                          "Investigate shrinkage in WH-B"
                        ].map((q, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="w-full text-xs text-left justify-start border-slate-200"
                            onClick={() => {
                              setChatInput(q);
                              handleAiChat(q);
                            }}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={cn(
                      "flex gap-2",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] p-3 rounded-xl text-xs",
                        msg.role === 'user'
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about inventory..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && chatInput && handleAiChat(chatInput)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => chatInput && handleAiChat(chatInput)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent className="bg-white w-96">
          <SheetHeader>
            <SheetTitle className="text-slate-900">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">Category</Label>
              <div className="space-y-2">
                {['Electronics', 'Clothing', 'Food', 'Furniture'].map(cat => (
                  <div key={cat} className="flex items-center">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={filters.category.includes(cat)}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          category: checked
                            ? [...prev.category, cat]
                            : prev.category.filter(c => c !== cat)
                        }));
                      }}
                    />
                    <label htmlFor={`cat-${cat}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">Status</Label>
              <div className="space-y-2">
                {['Healthy', 'At-Risk', 'Critical', 'Overstocked', 'Expiring'].map(status => (
                  <div key={status} className="flex items-center">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          status: checked
                            ? [...prev.status, status]
                            : prev.status.filter(s => s !== status)
                        }));
                      }}
                    />
                    <label htmlFor={`status-${status}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 rounded-xl"
                onClick={() => setFilters({ category: [], warehouse: [], supplier: [], status: [] })}
              >
                Clear All
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={() => setFilterSheetOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail Drawer */}
      <Sheet open={detailDrawer} onOpenChange={setDetailDrawer}>
        <SheetContent className="bg-white w-[600px] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-bold text-slate-900">{selectedItem.sku}</SheetTitle>
                    <div className="text-sm text-slate-600 mt-1">{selectedItem.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {selectedItem.status}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700">
                        {selectedItem.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                  <TabsTrigger value="levels" className="rounded-lg">Levels</TabsTrigger>
                  <TabsTrigger value="movement" className="rounded-lg">Movement</TabsTrigger>
                  <TabsTrigger value="forecast" className="rounded-lg">Forecast</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600">Warehouse</div>
                      <div className="text-lg font-semibold">{selectedItem.warehouse}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600">Location</div>
                      <div className="text-lg font-semibold">{selectedItem.zone} • {selectedItem.bin}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600">Supplier</div>
                      <div className="text-lg font-semibold">{selectedItem.supplier}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600">Unit Cost</div>
                      <div className="text-lg font-semibold">${selectedItem.unitCost}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="levels" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">On-Hand</span>
                      <span className="text-lg font-semibold">{selectedItem.onHand}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-slate-600">Available</span>
                      <span className="text-lg font-semibold text-blue-600">{selectedItem.available}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Committed</span>
                      <span className="text-lg font-semibold">{selectedItem.committed}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-slate-600">In-Transit</span>
                      <span className="text-lg font-semibold text-amber-600">{selectedItem.inTransit}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-slate-600">Safety Stock</span>
                      <span className="text-lg font-semibold text-emerald-600">{selectedItem.safetyStock}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="movement" className="space-y-4 mt-4">
                  <div className="text-sm text-slate-600">Recent movements for this SKU</div>
                  <div className="space-y-2">
                    {[
                      { type: 'Receipt', qty: 200, date: subDays(new Date(), 2) },
                      { type: 'Sale', qty: -50, date: subDays(new Date(), 1) },
                      { type: 'Transfer', qty: -30, date: new Date() }
                    ].map((move, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">{move.type}</div>
                          <div className="text-xs text-slate-500">{format(move.date, 'MMM d, h:mm a')}</div>
                        </div>
                        <div className={cn(
                          "text-lg font-semibold",
                          move.qty > 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          {move.qty > 0 ? '+' : ''}{move.qty}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="forecast" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <div className="text-xs text-slate-600">30 Days</div>
                      <div className="text-xl font-bold">{selectedItem.forecasted30}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <div className="text-xs text-slate-600">60 Days</div>
                      <div className="text-xl font-bold">{selectedItem.forecasted60}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <div className="text-xs text-slate-600">90 Days</div>
                      <div className="text-xl font-bold">{selectedItem.forecasted90}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-900 mb-2">AI Insight</div>
                    <div className="text-xs text-slate-700">
                      Demand trending up 12% vs last month. Recommend increasing safety stock by 15% to maintain 95% service level.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAdjustOpen(true)}>
                  Adjust
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setTransferOpen(true)}>
                  Transfer
                </Button>
                <Button className="flex-1" variant="outline">
                  Create PO
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <Dialog open={addInventoryOpen} onOpenChange={setAddInventoryOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>SKU</Label>
              <Input placeholder="SKU-0000" className="mt-1" />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH-A">WH-A</SelectItem>
                  <SelectItem value="WH-B">WH-B</SelectItem>
                  <SelectItem value="WH-C">WH-C</SelectItem>
                  <SelectItem value="WH-D">WH-D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit Cost</Label>
              <Input type="number" placeholder="0.00" className="mt-1" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
              toast.success('Inventory added successfully');
              setAddInventoryOpen(false);
            }}>
              Add Inventory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createPOOpen} onOpenChange={setCreatePOOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Vendor</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acme">Acme Corp</SelectItem>
                  <SelectItem value="global">Global Supply</SelectItem>
                  <SelectItem value="tech">TechVendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Warehouse</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH-A">WH-A</SelectItem>
                  <SelectItem value="WH-B">WH-B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium mb-2">Line Items</div>
              <div className="text-xs text-slate-600">
                3 SKUs selected • Total: $12,400
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
              toast.success('Purchase order created: PO-12345');
              setCreatePOOpen(false);
            }}>
              Create PO
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Anomaly Detail Drawer */}
      <Sheet open={anomalyDrawer} onOpenChange={setAnomalyDrawer}>
        <SheetContent className="bg-white w-[500px]">
          {selectedAnomaly && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  {selectedAnomaly.title}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm font-medium text-slate-900 mb-2">Impact</div>
                  <div className="text-2xl font-bold text-red-600">{selectedAnomaly.impact}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 mb-2">Details</div>
                  <div className="text-sm text-slate-700">{selectedAnomaly.details}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 mb-2">Suggested Fix</div>
                  <div className="text-sm text-slate-700">{selectedAnomaly.suggestedFix}</div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                    toast.success('Anomaly acknowledged and action initiated');
                    setAnomalyDrawer(false);
                  }}>
                    Acknowledge & Fix
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
